import threading

class MessageStore:
    """
    Thread-safe in-memory storage for messages.
    """
    def __init__(self):
        self._messages = []
        self._lock = threading.Lock()

    # input: Message -> add() -> output: Void
    def add(self, message):
        """Stores a message safely using a lock."""
        with self._lock:
            self._messages.append(message)

    # input: Float -> get_messages_since() <- output: List[Message]
    def get_messages_since(self, last_timestamp):
        """
        Returns all messages with a timestamp greater than the input.
        Used so clients only get new messages.
        """
        with self._lock:
            # Filter messages strictly newer than the client's last known timestamp
            return [m for m in self._messages if m.timestamp > last_timestamp]
