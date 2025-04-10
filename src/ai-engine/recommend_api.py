from flask import Flask, jsonify
from recommend import get_matches  # this function handles recommendation logic


app = Flask(__name__)

@app.route('/recommend/<user_id>', methods=['GET'])
def recommend(user_id):
    print(f"📥 Received recommendation request for userId: {user_id}")
    try:
        results = get_matches(user_id)
        if not results:
            return jsonify({"message": "No matches found"}), 404
        return jsonify(results)
    except Exception as e:
        print(" Error in recommendation API:", str(e))
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5001, debug=True)
