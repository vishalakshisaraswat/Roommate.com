const express = require('express');
const bcrypt = require('bcrypt');
const Profile = require('../models/profile.js');
const path = require('path');
const router = express.Router();


// Create profile 
router.post('/create', async (req, res) => {
    try {
        const { profileName, gender, userType, age, languages, address, description } = req.body;

        // Validate required fields
        if (!profileName || !gender || !userType || !age || !languages || !address) {
            return res.status(400).json({ msg: 'Please fill in all required fields.' });
        }

        // Ensure age is a positive integer
        // if (age <= 0 || !Number.isInteger(age)) {
        //     return res.status(400).json({ msg: 'Age must be a positive integer.' });
        // }

        // Create new profile
        const newProfile = new Profile({
            profileName,
            gender,
            userType,
            age,
            languages,
            address,
            description
        });

        // Save profile to the database
        await newProfile.save();
        res.status(201).json({ msg: 'Profile created successfully', profile: newProfile });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;