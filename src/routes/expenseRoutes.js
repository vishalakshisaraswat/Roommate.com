const express = require('express');
const router = express.Router();
const Transaction = require('../models/transaction');

// Add a new transaction (expense or payback)
router.post('/expense', async (req, res) => {
    try {
        console.log("Received Data:", req.body); // ✅ Check what data is coming from frontend
        const { user, amount, type } = req.body;
        
        if (!user || !amount || !type) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const transaction = new Transaction({ user, amount, type });
        await transaction.save();
        res.status(201).json(transaction);
    } catch (err) {
        console.error("Error saving transaction:", err);
        res.status(500).json({ error: err.message });
    }
});


// Fetch all transactions
router.get('/transactions', async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ timestamp: -1 });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
