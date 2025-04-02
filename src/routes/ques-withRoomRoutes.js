const express = require("express");
const router = express.Router();
const Roommate = require("../models/ques-withRoom.js");

// Handle form submission
router.post("/submit-form", async (req, res) => {
    try {
        console.log("Received Data:", req.body);

        let formattedData = {
            genderPreference: req.body["gender-preference"],
            ageGroup: req.body["age-group"],
            sleepingSchedule: req.body["sleeping-schedule"],
            workArrangement: req.body["work_arrangement"], // correct
            socialStyle: req.body["social_style"], // correct
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
        

        // Include "other_language" in the "language" array if provided
        if (req.body.other_language && req.body.other_language.trim() !== "") {
            formattedData.language.push(req.body.other_language.trim());
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

// Retrieve preferences by user ID
router.get("/:userID", async (req, res) => {
    try {
        const { userID } = req.params;
        const preferences = await Roommate.findOne({ userID });
        
        if (!preferences) {
            return res.status(404).json({ message: "No preferences found for this user" });
        }
        
        res.status(200).json(preferences);
    } catch (error) {
        console.error("Error retrieving preferences:", error);
        res.status(500).json({ error: "Internal Server Error" });
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

router.post("/submit-form", async (req, res) => {
    try {
        console.log("Received Data:", req.body);  // Debugging
        const newPreferences = new Roommate(req.body);
        await newPreferences.save();
        res.status(201).json({ message: "Preferences saved!", data: newPreferences });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});


module.exports = router;
