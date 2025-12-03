
# main_server.py
from flask import Flask, send_from_directory

app = Flask(__name__)

@app.get("/")
def serve_ui():
    return send_from_directory(".", "user_interface.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=9999)
