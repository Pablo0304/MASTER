# logic.py
import redis
import threading

class BusinessLogic:
    def __init__(self, host="redis", port=6379):
        self.redis = redis.Redis(host=host, port=port, decode_responses=True)
        self.lock = threading.Lock()
        self.key = "the_value"

        # Initialize value if missing
        with self.lock:
            if not self.redis.exists(self.key):
                self.redis.set(self.key, 0)

    def add(self, inc: int):
        with self.lock:
            current = int(self.redis.get(self.key))
            new_val = current + inc
            self.redis.set(self.key, new_val)
            return new_val

    def get_value(self):
        with self.lock:
            return int(self.redis.get(self.key))

