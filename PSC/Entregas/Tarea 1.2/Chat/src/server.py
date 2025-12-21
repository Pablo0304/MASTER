from flask import Flask, request, jsonify
from message import Message
from message_store import MessageStore

app = Flask(__name__)
store = MessageStore()

class Chat:
    """
    Server-side logic controller.
    """
    
    # msg: Message -> distribute_message() -> output: Void
    @staticmethod
    def distribute_message(msg):
        """
        Callback invoked when a message arrives.
        Stores it in the thread-safe store.
        """
        store.add(msg)

## --- REST API Routes ---

@app.route('/message', methods=['POST'])
def post_message():
    """
    Endpoint to receive new messages from clients.
    """
    data = request.json
    if not data:
        return jsonify({"error": "No data"}), 400
    
    # Deserialize and distribute
    new_msg = Message.from_dict(data)
    Chat.distribute_message(new_msg)
    
    return jsonify({"status": "received"}), 201

@app.route('/message', methods=['GET'])
def get_messages():
    """
    Endpoint for clients to poll messages.
    Clients send a 'last_timestamp' query param to get only new items.
    """
    try:
        last_timestamp = float(request.args.get('last_timestamp', 0))
    except ValueError:
        last_timestamp = 0.0

    # Retrieve from store
    new_messages = store.get_messages_since(last_timestamp)
    
    # Serialize list
    response_data = [m.to_dict() for m in new_messages]
    return jsonify(response_data), 200

if __name__ == '__main__':
    # Run threaded to handle multiple requests simultaneously
    print("Server running on port 5000...")
    app.run(port=5000, threaded=True)
