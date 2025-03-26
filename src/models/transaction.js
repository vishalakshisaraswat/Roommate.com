const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: {
        type: String,
        enum: ['user1', 'user2'],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0.01
    },
    type: {
        type: String,
        enum: ['expense', 'payback'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
