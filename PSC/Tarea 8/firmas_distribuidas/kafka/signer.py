import argparse
from kafka import KafkaConsumer, KafkaProducer

from common import loads, dumps, sign_payload, now_ms


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--id", required=True)
    parser.add_argument("--brokers", required=True, help="Comma separated brokers")
    parser.add_argument("--req-topic", default="sign-requests")
    parser.add_argument("--resp-topic", default="sign-responses")
    args = parser.parse_args()

    consumer = KafkaConsumer(
        args.req_topic,
        bootstrap_servers=args.brokers.split(","),
        group_id=f"signer-{args.id}",
        auto_offset_reset="latest",
        enable_auto_commit=True,
    )

    producer = KafkaProducer(
        bootstrap_servers=args.brokers.split(","),
        value_serializer=dumps,
    )

    for msg in consumer:
        req = loads(msg.value)
        signers = set(req.get("signers", []))
        if args.id not in signers:
            continue

        doc_b64 = req["doc_b64"]
        doc_id = req["doc_id"]

        payload = {
            "type": "signature",
            "doc_id": doc_id,
            "signer_id": args.id,
            "signed_at_ms": now_ms(),
            **sign_payload(doc_b64, args.id),
        }
        producer.send(args.resp_topic, value=payload)
        producer.flush()


if __name__ == "__main__":
    main()
