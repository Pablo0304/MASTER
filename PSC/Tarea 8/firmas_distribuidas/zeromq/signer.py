import argparse
import time
import zmq

from common import loads, dumps, sign_payload, now_ms


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--id", required=True)
    parser.add_argument("--sub", required=True, help="SUB endpoint, e.g., tcp://localhost:5555")
    parser.add_argument("--push", required=True, help="PUSH endpoint for responses, e.g., tcp://localhost:5556")
    args = parser.parse_args()

    ctx = zmq.Context.instance()

    sub = ctx.socket(zmq.SUB)
    sub.connect(args.sub)
    sub.setsockopt_string(zmq.SUBSCRIBE, "")

    push = ctx.socket(zmq.PUSH)
    push.connect(args.push)

    while True:
        raw = sub.recv()
        msg = loads(raw)
        signers = set(msg.get("signers", []))
        if args.id not in signers:
            continue

        doc_b64 = msg["doc_b64"]
        doc_id = msg["doc_id"]

        payload = {
            "type": "signature",
            "doc_id": doc_id,
            "signer_id": args.id,
            "signed_at_ms": now_ms(),
            **sign_payload(doc_b64, args.id),
        }
        push.send(dumps(payload))
        time.sleep(0.01)


if __name__ == "__main__":
    main()
