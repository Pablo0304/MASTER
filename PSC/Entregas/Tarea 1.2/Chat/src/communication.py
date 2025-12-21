import requests
import time
from message import Message

SERVER_URL = "http://127.0.0.1:5000/message"

class CommunicationClient:
    """
    Handles REST communication for the Participant.
    """
    def __init__(self):
        # Tracks the timestamp of the last message received to allow delta-updates
        self.last_timestamp = 0.0

    # msg: Message -> send_message() -> output: Void
    def send_message(self, msg):
        """Sends POST /message with the Message data."""
        try:
            requests.post(SERVER_URL, json=msg.to_dict())
        except requests.RequestException as e:
            print(f"\n[System]: Failed to send message: {e}")

    # callback: Function -> check_message() -> output: List[Message]
    def check_message(self, callback_func):
        """
        Polls the server using GET /message.
        If new messages exist, updates internal state and invokes the callback.
        """
        try:
            # Request only messages newer than what we have seen
            response = requests.get(SERVER_URL, params={'last_timestamp': self.last_timestamp})
            if response.status_code == 200:
                data_list = response.json()
                
                for data in data_list:
                    msg_obj = Message.from_dict(data)
                    
                    # Update local logical clock
                    if msg_obj.timestamp > self.last_timestamp:
                        self.last_timestamp = msg_obj.timestamp
                    
                    # Invoke callback (Participant.message_arrived)
                    callback_func(msg_obj)
                    
        except requests.RequestException:
            # Silent fail on connection error to prevent console spam during polling
            pass
