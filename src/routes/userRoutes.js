const express = require('express');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const User = require('../models/user');
const Profile = require('../models/profile');
const path = require('path');
const { JWT_SECRET } = require('../middleware/authMiddleware'); // Ensure correct import
const mongoose = require('mongoose'); 
const router = express.Router();

// Signup
// Signup Route
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (password.length < 8 || password.length > 19) {
      return res.status(400).json({ message: 'Password must be between 8 and 19 characters.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a unique userId (can use _id as userId)
    const userId = new mongoose.Types.ObjectId();
    const newUser = new User({
      userId, // Assign userId
      email,
      password: hashedPassword
    });

    await newUser.save();
    console.log(`"Signup successful:" , newUser.userId`);
    res.redirect(`/success.html?userId=${newUser.userId}`);
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: 'Error during signup', error: err.message });
  }
});


// Serve Login Page
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/login.html'));
});

// Serve Login-Signup Page
router.get('/login-signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/login-signup.html'));
});

// Common Login Handler
router.post(['/login', '/login-signup'], async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { userId: user.userId, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const profile = await Profile.findOne({ userId: user.userId });
    const redirectUrl = profile ? "/responses.html" : "/profile.html";

    // Return userId in response
    res.json({
      message: "Login successful",
      token,
      userId: user.userId,
      redirect: redirectUrl
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: 'Error during login', error: err.message });
  }
});


module.exports = router;
