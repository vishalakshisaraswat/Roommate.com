const path = require('path');
const express = require("express");
const router = express.Router();
const Questionnaire = require("../models/questionaire.js");

router.post('/submit-form', async (req, res) => {
    try {
        console.log("Received Data:", req.body); // Debugging

        // Normalize field names to match schema
        let formattedData = {
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