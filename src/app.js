const express = require('express');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const Profile = require('./models/profile');  // Import Profile model
const Questionaire = require('./models/questionaire'); // Import Questionaire model
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoutes.js');
const questionaireRoutes = require('./routes/questionaireRoutes.js');
const roomRoutes = require('./routes/roomRoutes.js');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
app.use(cors());

// Connect to database
connectDB();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'views')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/room', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'room.html'));
});

// Route to fetch merged Profile + Questionaire responses
app.get('/responses', async (req, res) => {
  try {
    const profiles = await Profile.find();
    const questionaires = await Questionaire.find();

    // Merging data based on a common field (e.g., email, userID) if exists
    const mergedData = profiles.map(profile => {
      const matchingResponse = questionaires.find(q => q.userID === profile.userID); // Ensure `userID` exists in both
      return {
        profileName: profile.profileName,
        gender: profile.gender,
        age: profile.age,
        userType: profile.userType,
        languages: profile.languages,
        address: profile.address,
        description: profile.description,
        // Questionaire Fields
        genderPreference: matchingResponse?.genderPreference || 'N/A',
        roomBudget: matchingResponse?.roomBudget || 'N/A',
        accommodationType: matchingResponse?.accommodationType || 'N/A',
        pets: matchingResponse?.pets || 'N/A',
        smoking: matchingResponse?.smoking || 'N/A',
        alcohol: matchingResponse?.alcohol || 'N/A',
        cleanliness: matchingResponse?.cleanliness || 'N/A',
        quietEnvironment: matchingResponse?.quietEnvironment || 'N/A',
        entertainGuests: matchingResponse?.entertainGuests || 'N/A'
      };
    });

    res.json(mergedData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching responses' });
  }
});

app.get('/responses.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'responses.html'));
});


// Routes
app.use('/', userRoutes);
app.use('/profile', profileRoutes);
app.use('/room', roomRoutes);
app.use('/questionaire', questionaireRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
