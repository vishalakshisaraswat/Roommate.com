from pymongo import MongoClient
import pandas as pd

# MongoDB connection
client = MongoClient("mongodb://127.0.0.1:27017/")
db = client['userData']
collection = db['questionnaires']

# Custom weights for matching criteria
weights = {
    'genderPreference': 20,
    'ageGroup': 10,
    'sleepingSchedule': 10,
    'workArrangement': 10,
    'socialStyle': 10,
    'roomBudget': 15,
    'accommodationType': 10,
    'language': 10,
    'smoking': 5,
    'alcohol': 5,
    'cleanliness': 5,
    'quietEnvironment': 5,
    'entertainGuests': 5,
    'roommateTime': 5,
    'sharingMeals': 5,
    'dietaryPreference': 5,
    'pets': 5
}

def calculate_match(user1, user2):
    """Calculates a match score between two users based on weighted criteria."""
    score = 0
    for field, weight in weights.items():
        if field == 'roomBudget':
            try:
                budget1 = int(user1.get(field, 0))
                budget2 = int(user2.get(field, 0))
                threshold = budget1 * 0.2
                if abs(budget1 - budget2) <= threshold:
                    score += weight
            except ValueError:
                pass
        elif field == 'language':
            if isinstance(user1.get(field), list) and isinstance(user2.get(field), list):
                if any(lang in user2.get(field) for lang in user1.get(field)):
                    score += weight
        else:
            if user1.get(field) == user2.get(field):
                score += weight
    return score

def get_matches(user_id):
    """Finds the top 5 best roommate matches for a given user."""
    users = list(collection.find({}))
    if not users:
        print("⚠️ No users found in the database.")
        return []

    df = pd.DataFrame(users)

    # Ensure 'userId' column exists and convert ObjectId to string
    if '_id' in df.columns:
        df['_id'] = df['_id'].astype(str)
    if 'userId' in df.columns:
        df['userId'] = df['userId'].astype(str)  # ✅ Fix: Convert userId to string

    print("✅ Available userIds:", df['userId'].tolist())
    print(f"🔍 Searching matches for userId: {user_id}")

    # Ensure the user exists in the database
    current_user = df[df['userId'] == user_id]
    if current_user.empty:
        print(f"❌ User with userId '{user_id}' not found.")
        return []

    current_user = current_user.iloc[0].to_dict()
    others = df[df['userId'] != user_id]

    if others.empty:
        print("⚠️ No other users available for matching.")
        return []

    # Calculate match scores
    results = []
    for _, other in others.iterrows():
        match_score = calculate_match(current_user, other.to_dict())
        results.append({
            "userId": other['userId'],
            "matchPercentage": round((match_score / sum(weights.values())) * 100, 2)  # Normalize match score
        })

    # Sort results by match percentage in descending order
    results.sort(key=lambda x: x['matchPercentage'], reverse=True)
    
    print("✅ Top matches found:", results[:5])
    return results[:20]  # Return the top 5 matches

# Example usage for debugging
if __name__ == "__main__":
    test_user_id = "67e6881bff63458f387f6c64"  # Change this to a valid userId
    matches = get_matches(test_user_id)
    print("\n🎯 Recommended Matches:")
    for match in matches:
        print(match)
