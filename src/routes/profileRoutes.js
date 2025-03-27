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
router.get('/responses', async (req, res) => {
  

  try {
    const { userId } = req.query;
    console.log("Received User ID:", userId);

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const profiles = await Profile.find();
    const questionnaires = await Questionnaire.find();

    // Find the current user's questionnaire
    const currentUserQuestionnaire = questionnaires.find(q => q.userId.toString() === userId.toString());
    if (!currentUserQuestionnaire) {
      console.log("No questionnaire found for user:", userId);
      return res.json([]); // Return empty if no questionnaire found
    }

    const weights = {
      genderPreference: 10,
      roomBudget: 15,
      accommodationType: 10,
      sleepingSchedule: 8,
      workArrangement: 8,
      socialStyle: 8,
      smoking: 15,
      alcohol: 15,
      cleanliness: 15,
      quietEnvironment: 6,
      entertainGuests: 5,
      pets: 10,
      sharingMeals: 5,
      language: 10
    };

    const getValue = (obj, key) => obj[key] || 'N/A';

    const mergedData = profiles.map(profile => {
      if (profile.userId.toString() === userId.toString()) return null; // Exclude current user

      const profileQuestionnaire = questionnaires.find(q => q.userId.toString() === profile.userId.toString());
      if (!profileQuestionnaire) {
        console.log(`No questionnaire found for profile userId: ${profile.userId}`);
        return null; // Skip if no questionnaire exists
      }

      let score = 0;
      let totalWeight = 0;

      Object.keys(weights).forEach(key => {
        const currentUserValue = getValue(currentUserQuestionnaire, key).toString().toLowerCase().trim();
        const profileValue = getValue(profileQuestionnaire, key).toString().toLowerCase().trim();

        if (key === 'roomBudget') {
          const budgetDiff = Math.abs(parseInt(currentUserValue) - parseInt(profileValue));
          if (budgetDiff <= 200) score += weights[key];
        } else if (key === 'language' && currentUserQuestionnaire.language && profileQuestionnaire.language) {
          const commonLanguages = currentUserQuestionnaire.language
            .split(',')
            .map(lang => lang.trim().toLowerCase())
            .filter(lang => profileQuestionnaire.language.toLowerCase().includes(lang));
          if (commonLanguages.length > 0) score += weights[key];
        } else if (currentUserValue && profileValue && currentUserValue === profileValue) {
          score += weights[key];
        }

        totalWeight += weights[key];
      });

      const matchPercentage = totalWeight > 0 ? (score / totalWeight) * 100 : 20;

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
        matchPercentage: matchPercentage.toFixed(2)
      };
    }).filter(Boolean);

    mergedData.sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.json(mergedData);
  } catch (error) {
    console.error('Error fetching responses:', error);
    res.status(500).json({ message: 'Error fetching responses' });
  }
});







module.exports = router;
