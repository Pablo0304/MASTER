import base64
import hashlib
import json
import time
from typing import Dict


def now_ms() -> int:
    return int(time.time() * 1000)


def encode_doc(doc_text: str) -> str:
    return base64.b64encode(doc_text.encode("utf-8")).decode("ascii")


def decode_doc(doc_b64: str) -> str:
    return base64.b64decode(doc_b64.encode("ascii")).decode("utf-8")


def doc_id_for(doc_b64: str) -> str:
    return hashlib.sha256(doc_b64.encode("ascii")).hexdigest()[:12]


def sign_payload(doc_b64: str, signer_id: str) -> Dict[str, str]:
    digest = hashlib.sha256((doc_b64 + signer_id).encode("ascii")).hexdigest()
    return {
        "signer_id": signer_id,
        "signature": digest,
    }


def dumps(msg: Dict) -> bytes:
    return json.dumps(msg, separators=(",", ":")).encode("utf-8")


def loads(raw: bytes) -> Dict:
    return json.loads(raw.decode("utf-8"))
