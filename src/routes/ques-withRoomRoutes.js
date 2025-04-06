const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const Roommate = require("../models/ques-withRoom.js");
const Room = require("../models/room.js"); // ✅ Using room.js instead of profile.js

// Handle form submission
router.post("/submit-form", async (req, res) => {
    try {
        console.log("Received Data:", req.body);

        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid User ID" });
        }

        const userRoom = await Room.findOne({ userId: new mongoose.Types.ObjectId(userId) });

        if (!userRoom) {
            return res.status(404).json({ message: "User room not found" });
        }

        let formattedData = {
            userId, // ✅ Now using userId field
            genderPreference: req.body["gender-preference"],
            ageGroup: req.body["age-group"],
            sleepingSchedule: req.body["sleeping-schedule"],
            workArrangement: req.body["work_arrangement"],
            socialStyle: req.body["social_style"],
            languages: Array.isArray(req.body.language) ? req.body.language : [],
            smoking: req.body.smoking,
            alcohol: req.body.alcohol,
            cleanliness: req.body.cleanliness,
            quietEnvironment: req.body["quiet-environment"],
            entertainGuests: req.body["entertain-guests"],
            roommateTime: req.body["roommate-time"],
            sharingMeals: req.body["sharing-meals"],
            dietaryPreference: req.body["dietary-preference"],
            pets: req.body.pets,
            additionalPreferences: req.body["additional-preferences"],
        };

        if (req.body.other_language && req.body.other_language.trim() !== "") {
            formattedData.languages.push(req.body.other_language.trim());
        }

        console.log("Formatted Data:", formattedData);

        const newPreferences = new Roommate(formattedData);
        await newPreferences.save();

        res.status(201).json({ message: "Preferences saved successfully!", data: newPreferences });
    } catch (error) {
        console.error("Error saving preferences:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Retrieve preferences by userId
router.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid User ID" });
        }

        const preferences = await Roommate.findOne({ userId });

        if (!preferences) {
            return res.status(404).json({ message: "No preferences found for this user" });
        }

        res.status(200).json(preferences);
    } catch (error) {
        console.error("Error retrieving preferences:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const axios = require("axios");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// AI-based matching endpoint
router.get('/ai-match/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const flaskURL = `http://127.0.0.1:5001/recommend/${userId}`;
        const response = await axios.get(flaskURL);

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching from Flask API:', error.message);
        res.status(500).json({ message: 'Error calling Flask API', error: error.message });
    }
});

// Retrieve all roommate preferences
router.get("/all", async (req, res) => {
    try {
        const preferences = await Roommate.find();
        res.status(200).json(preferences);
    } catch (error) {
        res.status(500).json({ message: "Error fetching preferences" });
    }
});

module.exports = router;
