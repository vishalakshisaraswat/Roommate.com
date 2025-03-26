// const express = require('express');
// const Chat = require('../models/chat');

// const router = express.Router();

// // Fetch chat history between two users
// router.get('/history/:sender/:receiver', async (req, res) => {
//     const { sender, receiver } = req.params;
//     try {
//         const messages = await Chat.find({
//             $or: [
//                 { sender, receiver },
//                 { sender: receiver, receiver: sender }
//             ]
//         }).sort({ timestamp: 1 });

//         res.status(200).json(messages);
//     } catch (error) {
//         res.status(500).json({ message: 'Error fetching chat history', error });
//     }
// });

// // Save a new message
// router.post('/send', async (req, res) => {
//     const { sender, receiver, message } = req.body;

//     if (!sender || !receiver || !message) {
//         return res.status(400).json({ message: 'All fields are required' });
//     }

//     try {
//         const newMessage = new Chat({ sender, receiver, message });
//         await newMessage.save();
//         res.status(201).json(newMessage);
//     } catch (error) {
//         res.status(500).json({ message: 'Error sending message', error });
//     }
// });

// module.exports = router;

const express = require('express');
const Chat = require('../models/chat');

const router = express.Router();

// Fetch chat history (All messages for a user OR specific chat)
router.get('/history/:sender/:receiver', async (req, res) => {
    const { sender, receiver } = req.params;

    try {
        let query;

        if (receiver === 'all') {
            // Fetch all messages where the user is either the sender or receiver
            query = { $or: [{ sender }, { receiver: sender }] };
        } else {
            // Fetch only messages exchanged between sender and receiver
            query = { 
                $or: [
                    { sender, receiver },
                    { sender: receiver, receiver: sender }
                ]
            };
        }

        const messages = await Chat.find(query).sort({ createdAt: 1 }); // Sort by oldest first
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching chat history', error });
    }
});

// Save a new message
router.post('/send', async (req, res) => {
    const { sender, receiver, message } = req.body;

    if (!sender || !receiver || !message) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const newMessage = new Chat({ sender, receiver, message });
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: 'Error sending message', error });
    }
});

module.exports = router;
