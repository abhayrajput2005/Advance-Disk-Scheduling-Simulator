from flask import Flask, request, jsonify
from flask_cors import CORS
from scheduler import simulate

app = Flask(__name__)
CORS(app)

@app.route("/simulate", methods=["POST"])
def handle_simulation():
    data = request.get_json()
    result = simulate(data)
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)
