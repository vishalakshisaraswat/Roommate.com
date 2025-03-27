const express = require('express');
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

router.get('/recommend/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const response = await fetch(`http://127.0.0.1:8000/recommend/${userId}`); // Python API
        const recommendations = await response.json();
        res.json(recommendations);
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
