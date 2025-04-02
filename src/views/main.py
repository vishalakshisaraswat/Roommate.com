from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
import uvicorn
import numpy as np

app = FastAPI()

# Load dataset
df = pd.read_csv("roommate_data.csv")

# Convert categorical data to numerical for similarity calculations
categorical_columns = ["gender", "smoking_preference", "pet_friendly"]

for col in categorical_columns:
    df[col] = df[col].astype('category').cat.codes  # Convert categories to numbers

class UserTraits(BaseModel):
    age: int
    gender: str
    budget: int
    smoking_preference: str
    pet_friendly: str

@app.post("/recommend")
def recommend(user: UserTraits):
    # Convert user input into a numerical vector
    user_vector = np.array([
        user.age,
        1 if user.gender == "Male" else 0,
        user.budget,
        1 if user.smoking_preference == "Yes" else 0,
        1 if user.pet_friendly == "Yes" else 0
    ]).reshape(1, -1)

    # Convert dataset to numeric matrix for comparison
    dataset_matrix = df[["age", "gender", "budget", "smoking_preference", "pet_friendly"]].values

    # Compute cosine similarity
    similarities = cosine_similarity(user_vector, dataset_matrix)[0]

    # Add similarity scores to the dataframe
    df["similarity"] = similarities

    # Get top 5 recommendations
    recommendations = df.nlargest(5, "similarity")[["name", "similarity"]].to_dict(orient="records")

    return {"recommendations": recommendations}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
