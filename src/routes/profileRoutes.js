const express = require('express');
const router = express.Router();
const Profile = require('../models/profile');
const mongoose = require('mongoose');
const Questionnaire = require("../models/questionaire.js");


// Create Profile Route
router.post('/create', async (req, res) => {
  try {

    const { userId, profileName, gender, age, userType, languages, address, description, image } = req.body;

    if (!profileName || !gender || !age || !userType || !address || !description) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid User ID' });
    }
    const userObjectId = new mongoose.Types.ObjectId(userId);

    let imageData = null;
    if (image) {
      if (image.startsWith('data:image')) {
        imageData = Buffer.from(image.split(',')[1], 'base64'); // Convert Base64 to Buffer
      } else {
        imageData = Buffer.from(image, 'base64');
      }
    }

    const newProfile = new Profile({
      userId : userObjectId,
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
    const questionnaires = await Questionnaire.find();
    
    console.log('Profiles fetched:', profiles.length);
    console.log('Questionnaires fetched:', questionnaires.length);

    const mergedData = profiles.map(profile => {
      const q = questionnaires.find(q => q.userId.toString() === profile.userId.toString());

      return {
        userId: profile.userId,
        profileName: profile.profileName,
        gender: profile.gender,
        age: profile.age,
        userType: profile.userType,
        languages: profile.languages,
        address: profile.address,
        description: profile.description,
        image: profile.image ? `data:image/png;base64,${profile.image.toString('base64')}` : null,
        // Add more fields from `q` if needed
      };
    });

    res.json(mergedData);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ message: 'Error fetching profiles' });
  }
});


router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Ensure valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid userId' });
        }

        const profiles = await Profile.find({ userId: new mongoose.Types.ObjectId(userId) });

        if (!profiles.length) {
            return res.status(404).json([]);
        }

        const profilesWithImages = profiles.map(profile => ({
            ...profile.toObject(),
            image: profile.image ? `data:image/png;base64,${profile.image.toString('base64')}` : null,
        }));

        res.json(profilesWithImages);
    } catch (error) {
        console.error('Error fetching profiles by userId:', error);
        res.status(500).json({ message: 'Error fetching profiles' });
    }
});



module.exports = router;
