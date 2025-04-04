from flask import Flask, jsonify
from recommend import get_matches  # this function handles recommendation logic


app = Flask(__name__)


@app.route('/recommend/<user_id>', methods=['GET'])
def recommend(user_id):
    try:
        results = get_matches(user_id)  # implement this in recommend.py
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5001, debug=True)
