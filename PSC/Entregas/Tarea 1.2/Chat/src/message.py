import json
import time

class Message:
    """
    Represents a message sent by a user.
    """

    def __init__(self, nickname, text, timestamp=None):
        self.nickname = nickname
        self.text = text
        # If no timestamp provided, use current time
        self.timestamp = timestamp if timestamp else time.time()

    # nickName: Text, message: Text -> to_dict() <- output: Dict
    def to_dict(self):
        """Converts the object to a dictionary for JSON serialization."""
        return {
            "nickName": self.nickname,
            "message": self.text,
            "timestamp": self.timestamp
        }

    # data: Dict -> from_dict() <- output: Message
    @staticmethod
    def from_dict(data):
        """Creates a Message object from a dictionary."""
        return Message(
            nickname=data.get("nickName"),
            text=data.get("message"),
            timestamp=data.get("timestamp")
        )

    # input: Void -> __str__() <- output: Text
    def __str__(self):
        # logical design: Format the message for display
        return f"[{self.nickname}]: {self.text}"
