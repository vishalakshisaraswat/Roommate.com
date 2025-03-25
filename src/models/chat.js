const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    sender: { type: String, required: true }, // Store sender's username
    receiver: { type: String, required: true }, // Store receiver's username
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chat', chatSchema);



