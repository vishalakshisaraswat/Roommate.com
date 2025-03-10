const express = require('express');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const User = require('../models/user');
const path = require('path');
const { JWT_SECRET } = require('../middleware/authMiddleware'); // Ensure correct import

const router = express.Router();

// Signup
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

    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.sendFile(path.join(__dirname, '../views/success.html'));
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: 'Error during signup', error: err.message });
  }
});

// Login Page
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/login.html'));
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email }, // Fixed `userId` field
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Send token in response (optional)
    // res.json({ message: 'Login successful', token });
    // res.redirect('/profile.html');
    // Redirect (if using frontend routing)
    res.sendFile(path.join(__dirname, '../views/profile.html'));
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: 'Error during login', error: err.message });
  }
});

module.exports = router;
