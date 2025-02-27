const express = require('express');
const Questionaire = require('../models/questionaire.js');
const path = require('path');
const router = express.Router();


router.post('/submit-form', async (req, res) => {
    try {
        console.log("Received form data:", req.body); // Debugging: Log received data
  
        // if (!req.body.age || !req.body.genderr) {
        //     return res.status(400).json({ message: "Required fields missing" });
        // }
  
        const newResponse = new Questionaire(req.body);
        await newResponse.save();
  
        console.log("Data saved successfully:", newResponse);
        res.redirect('/responses.html'); // Redirect after successful submission
    } catch (error) {
        console.error("Error saving data:", error);
        res.status(500).json({ message: 'Server error' });
    }
  });
  
  module.exports = router;