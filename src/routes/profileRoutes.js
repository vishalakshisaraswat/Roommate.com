const express = require('express');
const router = express.Router();
const Profile = require('../models/profile');


// Create Profile Route
router.post('/create', async (req, res) => {
  try {
    console.log("Received data:", req.body); // Debugging

    const { profileName, gender, age, userType, languages, address, description, image } = req.body;

    if (!profileName || !gender || !age || !userType || !address || !description) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let imageData = null;
    if (image) {
      if (image.startsWith('data:image')) {
        imageData = Buffer.from(image.split(',')[1], 'base64'); // Convert Base64 to Buffer
      } else {
        imageData = Buffer.from(image, 'base64');
      }
    }

    const newProfile = new Profile({
      profileName,
      gender,
      age,
      userType,
      languages: Array.isArray(languages) ? languages : [languages],
      address,
      description,
      image: imageData, // Store as Buffer
    });

    await newProfile.save();
    console.log("Profile saved successfully!");
    res.status(201).json({ message: 'Profile created successfully!' });

  } catch (error) {
    console.error('Error saving profile:', error);
    res.status(500).json({ message: 'Error creating profile' });
  }
});

// Fetch all profiles and convert Buffer image back to Base64
router.get('/all', async (req, res) => {
  try {
    const profiles = await Profile.find();

    const profilesWithImages = profiles.map(profile => ({
      ...profile.toObject(),
      image: profile.image ? `data:image/png;base64,${profile.image.toString('base64')}` : null,
    }));

    res.json(profilesWithImages);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ message: 'Error fetching profiles' });
  }
});

module.exports = router;
