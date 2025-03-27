const path = require('path');
const express = require("express");
const router = express.Router();
const Questionnaire = require("../models/questionaire.js");
const Profile = require("../models/profile.js"); 
const mongoose = require('mongoose');

router.get("/match/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid User ID" });
        }

        // Fetch the current user's questionnaire
        const currentUser = await Questionnaire.findOne({ userId });
        if (!currentUser) {
            return res.status(404).json({ message: "Current user questionnaire not found" });
        }

        // Fetch all other users' questionnaires
        const otherUsers = await Questionnaire.find({ userId: { $ne: userId } });

        let matches = [];

        // Define weightage for each category (total should sum up to 100)
        const weights = {
            genderPreference: 20,
            ageGroup: 10,
            sleepingSchedule: 10,
            workArrangement: 10,
            socialStyle: 10,
            roomBudget: 15,
            accommodationType: 10,
            language: 10,
            smoking: 5,
            alcohol: 5,
            cleanliness: 5,
            quietEnvironment: 5,
            entertainGuests: 5,
            roommateTime: 5,
            sharingMeals: 5,
            dietaryPreference: 5,
            pets: 5
        };

        // Function to calculate similarity
        const calculateMatchPercentage = (user1, user2) => {
            let score = 0;
            let totalWeight = 0;

            // Matching logic
            if (user1.genderPreference === user2.genderPreference || user1.genderPreference === "no-preference") {
                score += weights.genderPreference;
            }
            if (user1.ageGroup === user2.ageGroup || user1.ageGroup === "no-preference") {
                score += weights.ageGroup;
            }
            if (user1.sleepingSchedule === user2.sleepingSchedule) {
                score += weights.sleepingSchedule;
            }
            if (user1.workArrangement === user2.workArrangement) {
                score += weights.workArrangement;
            }
            if (user1.socialStyle === user2.socialStyle) {
                score += weights.socialStyle;
            }
            if (user1.accommodationType === user2.accommodationType) {
                score += weights.accommodationType;
            }
            if (user1.smoking === user2.smoking) {
                score += weights.smoking;
            }
            if (user1.alcohol === user2.alcohol) {
                score += weights.alcohol;
            }
            if (user1.cleanliness === user2.cleanliness) {
                score += weights.cleanliness;
            }
            if (user1.quietEnvironment === user2.quietEnvironment) {
                score += weights.quietEnvironment;
            }
            if (user1.entertainGuests === user2.entertainGuests) {
                score += weights.entertainGuests;
            }
            if (user1.roommateTime === user2.roommateTime) {
                score += weights.roommateTime;
            }
            if (user1.sharingMeals === user2.sharingMeals) {
                score += weights.sharingMeals;
            }
            if (user1.dietaryPreference === user2.dietaryPreference) {
                score += weights.dietaryPreference;
            }
            if (user1.pets === user2.pets) {
                score += weights.pets;
            }

            // Room Budget Matching (Using a threshold of ±20%)
            let budgetThreshold = user1.roomBudget * 0.2;
            if (Math.abs(user1.roomBudget - user2.roomBudget) <= budgetThreshold) {
                score += weights.roomBudget;
            }

            // Language Matching (At least one common language)
            if (user1.language.some(lang => user2.language.includes(lang))) {
                score += weights.language;
            }

            // Convert score to percentage (out of 100)
            return (score / 100) * 100;
        };

        // Compute match percentages
        for (let otherUser of otherUsers) {
            let matchPercentage = calculateMatchPercentage(currentUser, otherUser);
            matches.push({ userId: otherUser.userId, matchPercentage });
        }

        // Sort matches in descending order
        matches.sort((a, b) => b.matchPercentage - a.matchPercentage);

        res.status(200).json({ matches });
    } catch (error) {
        console.error("Error calculating matches:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post('/submit-form', async (req, res) => {
    try {
        console.log("Received Data:", req.body); // Debugging
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid User ID" });
        }
        const userProfile = await Profile.findOne({ userId });
        if (!userProfile) {
            return res.status(404).json({ message: "User profile not found" });
        }


        // Check if the userId exists in the Profile collection
      
        // Normalize field names to match schema
        let formattedData = {
            userId,
            genderPreference: req.body['gender-preference'],
            ageGroup: req.body['age-group'],
            sleepingSchedule: req.body['sleeping-schedule'],
            workArrangement: req.body.work_arrangement,
            socialStyle: req.body.social_style,
            locationPreference: req.body.location_preference,
            specificAddress: req.body.specific_address,
            roomBudget: req.body['room-budget'],
            accommodationType: req.body['accommodation-type'],
            language: Array.isArray(req.body.language) ? req.body.language : [],  // Ensure array format
            smoking: req.body.smoking,
            alcohol: req.body.alcohol,
            cleanliness: req.body.cleanliness,
            quietEnvironment: req.body['quiet-environment'],
            entertainGuests: req.body['entertain-guests'],
            roommateTime: req.body['roommate-time'],
            sharingMeals: req.body['sharing-meals'],
            dietaryPreference: req.body['dietary-preference'],
            pets: req.body.pets,
            additionalPreferences: req.body['additional-preferences'],
        };

        // Include "other_language" in the "language" array if it's not empty
        if (req.body.other_language && req.body.other_language.trim() !== "") {
            formattedData.language.push(req.body.other_language.trim());
        }

        console.log("Formatted Data:", formattedData); // Debugging

        const newResponse = new Questionnaire(formattedData);
        await newResponse.save();

        res.status(201).json({ message: "Responses saved successfully!", data: newResponse });
    } catch (error) {
        console.error("Error saving responses:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/:userID", async (req, res) => {
    try {
        const { userID } = req.params;
        const questionnaire = await Questionnaire.findOne({ userID });
        
        if (!mongoose.Types.ObjectId.isValid(userID)) {
            return res.status(400).json({ message: "Invalid User ID" });
        }

        if (!questionnaire) {
            return res.status(404).json({ message: "No questionnaire found for this user" });
        }
        
        res.status(200).json(questionnaire);
    } catch (error) {
        console.error("Error retrieving questionnaire:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get('/all', async (req, res) => {
    try {
            const responses = await Questionnaire.find();
            res.status(200).json(responses);
        } catch (error) {
            res.status(500).json({ message: "Error fetching responses" });
        }
});

  
  module.exports = router;