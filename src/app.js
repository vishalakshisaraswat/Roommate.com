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

app.use(bodyParser.json({ limit: '50mb' }));  
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

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

app.get('/quessionaire', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'quessionaire.html'));
});

// Route to fetch merged Profile + Questionaire responses
app.get('/responses', async (req, res) => {
  try {
    const profiles = await Profile.find();
    const questionaires = await Questionaire.find();

    const mergedData = profiles.map(profile => {
      const matchingResponse = questionaires.find(q => q.userID === profile.userID);

      if (!matchingResponse) return null; // Skip if no questionnaire data

      // Define weightage for different factors
      const weights = {
        genderPreference: 20,
        roomBudget: 15,
        accommodationType: 10,
        pets: 10,
        smoking: 15,
        alcohol: 10,
        cleanliness: 15,
        quietEnvironment: 10,
        entertainGuests: 5
      };

      let score = 0;
      let totalWeight = 0;

      Object.keys(weights).forEach(key => {
        if (matchingResponse[key] && profile[key]) {  // Ensure values exist
          if (matchingResponse[key] === profile[key]) {
            score += weights[key]; // Add weight if values match
          }
          totalWeight += weights[key]; // Add to total possible score
        }
      });

      // Calculate match percentage
      const matchPercentage = totalWeight > 0 ? (score / totalWeight) * 100 : 0;
      
      return {
        profileName: profile.profileName,
        gender: profile.gender,
        age: profile.age,
        userType: profile.userType,
        languages: profile.languages,
        address: profile.address,
        description: profile.description,
        // Convert image to Base64 (if available)
        image: profile.image ? `data:image/png;base64,${profile.image}` : null,
        // Questionaire Fields
        genderPreference: matchingResponse?.genderPreference || 'N/A',
        roomBudget: matchingResponse?.roomBudget || 'N/A',
        accommodationType: matchingResponse?.accommodationType || 'N/A',
        pets: matchingResponse?.pets || 'N/A',
        smoking: matchingResponse?.smoking || 'N/A',
        alcohol: matchingResponse?.alcohol || 'N/A',
        cleanliness: matchingResponse?.cleanliness || 'N/A',
        quietEnvironment: matchingResponse?.quietEnvironment || 'N/A',
        entertainGuests: matchingResponse?.entertainGuests || 'N/A',
        matchPercentage: matchPercentage.toFixed(2) // Round to 2 decimal places
      };
    }).filter(Boolean); // Remove null values

    // Sort profiles by match percentage in descending order
    mergedData.sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.json(mergedData);
  } catch (error) {
    console.error('Error fetching responses:', error);
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
