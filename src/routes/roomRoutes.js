const express = require('express');
const Room = require('../models/room');
const mongoose = require('mongoose');
const multer = require('multer');
const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(), // Using memory storage
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5 MB
});

// Route to create a new room
router.post('/create', upload.array('photos', 4), async (req, res) => {
  try {
    const {
      userId,
      roomType,
      washroomType,
      furnishing,
      city,
      area,
      colony,
      address,
      rent,
      availability,
      internetAccess,
      internetType,
      parking,
      ac,
      heater,
      balcony,
      kitchen
    } = req.body;

    // Convert checkbox values from string to boolean
    const internetAccessBoolean = internetAccess === 'on';
    const parkingBoolean = parking === 'on';

    const amenities = {
      ac: ac === 'on',
      heater: heater === 'on',
      balcony: balcony === 'on',
      kitchen: kitchen === 'on'
    };

    const photos = req.files.map(file => file.buffer.toString('base64'));

    const newRoom = new Room({
      roomId: new mongoose.Types.ObjectId().toString(),
      userId, // ✅ Include userId here
      roomType,
      washroomType,
      furnishing,
      city,
      area,
      colony,
      address,
      rent,
      availability,
      internetAccess: internetAccessBoolean,
      internetType: internetAccessBoolean ? internetType : null,
      parking: parkingBoolean,
      amenities,
      photos
    });

    await newRoom.save();
    res.status(201).json({ msg: 'Room details stored successfully', room: newRoom });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// Route to fetch all rooms
router.get('/all', async (req, res) => {
  try {
    const rooms = await Room.find();

    const roomsWithImages = rooms.map(room => ({
      ...room.toObject(),
      photos: room.photos.map(photo => `data:image/png;base64,${photo}`), // Convert images to Base64 format
    }));

    res.json(roomsWithImages);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ message: 'Error fetching rooms' });
  }
});

module.exports = router;
