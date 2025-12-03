# main_endpoint.py
from flask import Flask, jsonify
from flask_cors import CORS
from logic import BusinessLogic

app = Flask(__name__)

#CORS(app, resources={r"/*": {"origins": "*"}})
#CORS(app, resources={r"/*": {"origins": "http://localhost:9999"}})

cors = CORS(app) # allow CORS for all domains on all routes.
app.config['CORS_HEADERS'] = 'Content-Type'


logic = BusinessLogic()

@app.post("/add/<int:inc>")
def add(inc):
    new_val = logic.add(inc)
    return jsonify({"new_value": new_val})

@app.get("/value")
def value():
    v = logic.get_value()
    return jsonify({"value": v})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)

