
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const connectDB = require('./config/db');
const Profile = require('./models/profile');
const Questionaire = require('./models/questionaire');
const Chat = require('./models/chat'); // Chat model
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoutes.js');
const questionaireRoutes = require('./routes/questionaireRoutes');
const queswithRoomRoutes = require('./routes/ques-withRoomRoutes.js');
const roomRoutes = require('./routes/roomRoutes');
const expenseRoutes = require('./routes/expenseRoutes.js');
const chatRoutes = require('./routes/chatRoutes.js');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const PORT = process.env.PORT || 3000;

const otpStore = {}; // Temporary OTP storage
const dummyData = new Set([
  "123456789012",
  "987654321098",
  "112233445566",
  "223344556677",
  "334455667788"
]);

app.use(cors());

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Connect to database
connectDB();

const users = {}; // Store connected users 

const axios = require('axios'); // Ensure Axios is installed


// WebSocket connection
io.on('connection', async (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', async (username) => {
        users[socket.id] = username;
        console.log(`${username} joined the chat.`);

        try {
            // Fetch previous messages where the user is either sender or receiver
            const chatHistory = await Chat.find({
                $or: [{ sender: username }, { receiver: username }]
            }).sort({ createdAt: 1 }); // Sort by oldest first

            // Send chat history to the user
            socket.emit('chatHistory', chatHistory);
        } catch (error) {
            console.error('Error fetching chat history:', error);
        }
    });

    socket.on('privateMessage', async ({ sender, receiver, message }) => {
        const receiverSocketId = Object.keys(users).find(key => users[key] === receiver);

        if (receiverSocketId) {
            io.to(receiverSocketId).emit('privateMessage', { sender, message });
        }

        try {
            const newMessage = new Chat({ sender, receiver, message });
            await newMessage.save();
            io.emit('receiveMessage', { sender, receiver, message }); // Emit to all
        } catch (error) {
            console.error('Error saving message:', error);
        }
    });

    socket.on('disconnect', () => {
        if (users[socket.id]) {
            console.log(`${users[socket.id]} disconnected`);
            delete users[socket.id];
        }
    });
});


app.get('/', (req, res) => {
    res.send('Welcome to the Aadhaar e-KYC API!');
});


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

app.post('/verifyOtp', (req, res) => {
    const { aadhaar, otp } = req.body;
    const userId = req.body.userId || localStorage.getItem("userId");

    if (!aadhaar || !otp || !userId) {
        return res.status(400).json({ message: "Missing required fields." });
    }

    if (otpStore[aadhaar] && otpStore[aadhaar].toString() === otp) {
        delete otpStore[aadhaar]; // Remove OTP after verification
        res.status(200).json({ message: "OTP Verified Successfully", userId });
    } else {
        res.status(401).json({ message: "Invalid OTP" });
    }
});



// Static files
app.use(express.static(path.join(__dirname, 'views')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Serve HTML pages
app.get('/login.html', (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));
app.get('/room', (req, res) => res.sendFile(path.join(__dirname, 'views', 'room.html')));
app.get('/quessionaire', (req, res) => res.sendFile(path.join(__dirname, 'views', 'quessionaire.html')));
app.get('/ques-withRoom.html', (req, res) => res.sendFile(path.join(__dirname, 'views', 'ques-withRoom.html')));
app.get('/responses.html', (req, res) => res.sendFile(path.join(__dirname, 'views', 'responses.html')));
app.get('/chat', (req, res) => res.sendFile(path.join(__dirname, 'views', 'chat.html')));
app.get('/expenses.html', (req, res) => res.sendFile(path.join(__dirname, 'views', 'expenses.html')));

  
// Routes
app.use('/', userRoutes);
app.use('/profile', profileRoutes);
app.use('/room', roomRoutes);
app.use('/questionaire', questionaireRoutes);
app.use('/ques-withRoom', queswithRoomRoutes)
app.use('/chat', chatRoutes);;
app.use('/', expenseRoutes);


app._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
        console.log(r.route.path);
    }
});


// Start server
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));