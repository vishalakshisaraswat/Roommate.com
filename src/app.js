const express = require('express');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const Profile = require('./models/profile');
const Questionaire = require('./models/questionaire');
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoutes.js');
const questionaireRoutes = require('./routes/questionaireRoutes.js');
const roomRoutes = require('./routes/roomRoutes.js');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const otpStore = {}; // Temporary OTP storage
const dummyData = new Set([
  "123456789012",
  "987654321098",
  "112233445566",
  "223344556677",
  "334455667788"
]);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Connect to database
connectDB();

app.get('/', (req, res) => {
    res.send('Welcome to the Aadhaar e-KYC API!');
});

// **Send Aadhaar & Generate OTP (Only if Aadhaar exists in dummyData)**
app.post('/sendAadhaar', async (req, res) => {
    const { aadhaar } = req.body;

    if (!aadhaar || !/^\d{12}$/.test(aadhaar)) {
        return res.status(400).json({ message: "Invalid Aadhaar number. Must be 12 digits." });
    }

    if (!dummyData.has(aadhaar)) {
        return res.status(403).json({ message: "Aadhaar number not registered." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[aadhaar] = otp;

    console.log(`OTP for Aadhaar ${aadhaar}: ${otp}`);

    res.status(200).json({ message: "OTP Sent", aadhaar });
});

// **Verify OTP**
app.post('/verifyOtp', (req, res) => {
    const { aadhaar, otp } = req.body;

    if (!aadhaar || !otp) {
        return res.status(400).json({ message: "Aadhaar and OTP are required." });
    }

    if (otpStore[aadhaar] && otpStore[aadhaar].toString() === otp) {
        delete otpStore[aadhaar]; // Remove OTP after verification
        res.status(200).json({ message: "OTP Verified Successfully" });
    } else {
        res.status(401).json({ message: "Invalid OTP" });
    }
});

// **Static files**
app.use(express.static(path.join(__dirname, 'views')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// **Serve HTML pages**
app.get('/login.html', (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));
app.get('/room', (req, res) => res.sendFile(path.join(__dirname, 'views', 'room.html')));
app.get('/quessionaire', (req, res) => res.sendFile(path.join(__dirname, 'views', 'quessionaire.html')));
app.get('/responses.html', (req, res) => res.sendFile(path.join(__dirname, 'views', 'responses.html')));

// **Routes**
app.use('/', userRoutes);
app.use('/profile', profileRoutes);
app.use('/room', roomRoutes);
app.use('/questionaire', questionaireRoutes);

// **Start server**
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
