import argparse
import time
from kafka import KafkaConsumer, KafkaProducer

from common import encode_doc, doc_id_for, loads, dumps


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--brokers", required=True, help="Comma separated brokers")
    parser.add_argument("--signers", required=True, help="Comma separated signer IDs")
    parser.add_argument("--doc", required=True, help="Document text")
    parser.add_argument("--req-topic", default="sign-requests")
    parser.add_argument("--resp-topic", default="sign-responses")
    parser.add_argument("--timeout", type=float, default=5.0)
    args = parser.parse_args()

    signers = [s.strip() for s in args.signers.split(",") if s.strip()]
    doc_b64 = encode_doc(args.doc)
    doc_id = doc_id_for(doc_b64)

    producer = KafkaProducer(
        bootstrap_servers=args.brokers.split(","),
        value_serializer=dumps,
    )

    consumer = KafkaConsumer(
        args.resp_topic,
        bootstrap_servers=args.brokers.split(","),
        group_id=f"client-{doc_id}",
        auto_offset_reset="latest",
        enable_auto_commit=True,
    )

    req = {
        "type": "sign_request",
        "doc_id": doc_id,
        "doc_b64": doc_b64,
        "signers": signers,
    }
    producer.send(args.req_topic, value=req)
    producer.flush()

    collected = {}
    deadline = time.time() + args.timeout
    while time.time() < deadline and len(collected) < len(signers):
        records = consumer.poll(timeout_ms=200)
        for _, msgs in records.items():
            for msg in msgs:
                resp = loads(msg.value)
                if resp.get("doc_id") != doc_id:
                    continue
                signer_id = resp.get("signer_id")
                if signer_id not in collected:
                    collected[signer_id] = resp

    missing = [s for s in signers if s not in collected]
    print({
        "doc_id": doc_id,
        "signatures": list(collected.values()),
        "missing": missing,
    })


if __name__ == "__main__":
    main()
