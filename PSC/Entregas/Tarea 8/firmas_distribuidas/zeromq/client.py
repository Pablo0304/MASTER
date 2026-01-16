import argparse
import time
import zmq

from common import encode_doc, doc_id_for, dumps, loads


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pub", required=True, help="PUB bind endpoint, e.g., tcp://*:5555")
    parser.add_argument("--pull", required=True, help="PULL bind endpoint, e.g., tcp://*:5556")
    parser.add_argument("--signers", required=True, help="Comma separated signer IDs")
    parser.add_argument("--doc", required=True, help="Document text")
    parser.add_argument("--timeout", type=float, default=3.0)
    parser.add_argument("--retries", type=int, default=1)
    args = parser.parse_args()

    signers = [s.strip() for s in args.signers.split(",") if s.strip()]
    doc_b64 = encode_doc(args.doc)
    doc_id = doc_id_for(doc_b64)

    ctx = zmq.Context.instance()

    pub = ctx.socket(zmq.PUB)
    pub.bind(args.pub)

    pull = ctx.socket(zmq.PULL)
    pull.bind(args.pull)

    poller = zmq.Poller()
    poller.register(pull, zmq.POLLIN)

    collected = {}

    time.sleep(0.5)

    for attempt in range(args.retries + 1):
        msg = {
            "type": "sign_request",
            "doc_id": doc_id,
            "doc_b64": doc_b64,
            "signers": signers,
        }
        pub.send(dumps(msg))

        deadline = time.time() + args.timeout
        while time.time() < deadline and len(collected) < len(signers):
            socks = dict(poller.poll(timeout=100))
            if pull in socks:
                resp = loads(pull.recv())
                signer_id = resp.get("signer_id")
                if signer_id not in collected:
                    collected[signer_id] = resp

        if len(collected) == len(signers):
            break

    missing = [s for s in signers if s not in collected]
    print({
        "doc_id": doc_id,
        "signatures": list(collected.values()),
        "missing": missing,
    })


if __name__ == "__main__":
    main()
