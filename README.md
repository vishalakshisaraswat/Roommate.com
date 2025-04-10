# Roommate.com

Roommate.com is a full-stack application that helps people find compatible roommates based on preferences, lifestyle, and available rooms.

## Features
- User authentication with JWT
- Profile creation with two types of users:
  - RoommateSeekerWithRoom
  - RoommateSeekerWithoutRoom
- AI-powered roommate matching engine
- Real-time communication using Socket.IO

---

## Prerequisites

- Node.js & npm
- Python 3.x
- MongoDB
- pip (for Python packages)

---

## Installation

1. Clone the repository

   git clone https://github.com/yourusername/roommate.com.git
   cd roommate.com
  

2. Install Node and python dependencies
   
   npm install mongoose express body-parser socket.io cors dotenv axios bcrypt

pip install pymongo pandas flask
   

3. Set up environment variables

   Create a `.env` file in the root and add:
   ```
   MONGO_URI=your_mongo_uri
   JWT_SECRET=your_jwt_secret
   ```

---

## Running the Project

1. Start Node.js Backend Server
```
node src/app.js
```

2. Start Python AI Matching Engine
```
cd src/ai-engine
python recommend_api.py
```

 3. Run Frontend
```
cd i-landing
Run index.html
```


