import threading
import time
from message import Message
from communication import CommunicationClient

class Participant:
    # nick: Text -> constructor() ->
    def __init__(self, nick):
        self.nick = nick
        self.comm = CommunicationClient()
        self._running = True

    # input: Void -> start_polling() -> output: Void
    def start_polling(self):
        """
        Starts a background thread to poll the server every 10 seconds.
        """
        poll_thread = threading.Thread(target=self._poll_loop, daemon=True)
        poll_thread.start()

    # input: Void -> _poll_loop() -> output: Void
    def _poll_loop(self):
        """
        Internal loop that executes check_message every 10 seconds.
        """
        while self._running:
            # Calls communication lib, passing self.message_arrived as the callback
            self.comm.check_message(self.message_arrived)
            time.sleep(10)

    # userInput: Text -> text_read() -> output: Void
    def text_read(self, user_input):
        """
        Callback invoked when the user writes a message.
        """
        if not user_input.strip():
            return

        new_msg = Message(self.nick, user_input)
        # Delegate to communication library
        self.comm.send_message(new_msg)

    # msg: Message -> message_arrived() -> output: Void
    def message_arrived(self, msg):
        """
        Callback invoked when a message from another participant arrives.
        """
        # Simple logic to avoid printing own messages (optional, but good UX)
        # However, specification says "All users can see all messages"
        # We print everything.
        print(f"\n{msg}")
        # Re-print prompt to keep UI clean
        print(f"({self.nick}) > ", end="", flush=True)

    # input: Void -> run_ui() -> output: Void
    def run_ui(self):
        """
        Main blocking loop for user input.
        """
        print(f"Welcome to the chat, {self.nick}!")
        print("Type your message and press Enter. (Ctrl+C to quit)")
        
        self.start_polling()

        try:
            while True:
                user_input = input(f"({self.nick}) > ")
                self.text_read(user_input)
        except KeyboardInterrupt:
            self._running = False
            print("\nExiting...")
