const express = require('express');
const Room = require('../models/room');
const mongoose = require('mongoose');
const multer = require('multer');
const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(), // or set up local disk storage
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5 MB
});

// // Route to create room
// router.post('/create', upload.array('photos', 4), async (req, res) => {
//   try {
//     const { address, rent, description, availableSpacesForRoommates } = req.body;
//     const photos = req.files.map(file => file.originalname); // Save file names or URLs

//     if (!address || !rent || !availableSpacesForRoommates) {
//       return res.status(400).json({ message: 'All fields are required' });
//     }
//     console.log(req.body);
//     console.log(photos);

//     const newRoom = new Room({
//       roomId: new mongoose.Types.ObjectId().toString(),
//       address,
//       rent,
//       description,
//       availableSpacesForRoommates,
//       photos,
//       roomId: new mongoose.Types.ObjectId()
//     });

//     await newRoom.save();
//     res.status(201).json({ msg: 'Room details stored successfully', room: newRoom });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server Error');
//   }
// });

router.post('/create', upload.array('photos', 4), async (req, res) => {
  try {
    const { address, rent, description, availableSpacesForRoommates } = req.body;

    if (!address || !rent || !availableSpacesForRoommates) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const photos = req.files.map(file => file.buffer.toString('base64')); // Convert to Base64

    const newRoom = new Room({
      roomId: new mongoose.Types.ObjectId().toString(),
      address,
      rent,
      description,
      availableSpacesForRoommates,
      photos, // Store Base64-encoded images
    });

    await newRoom.save();
    res.status(201).json({ msg: 'Room details stored successfully', room: newRoom });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


router.get('/all', async (req, res) => {
  try {
    const rooms = await Room.find();

    const roomsWithImages = rooms.map(room => ({
      ...room.toObject(),
      photos: room.photos.map(photo => `data:image/png;base64,${photo}`), // Convert images to Base64
    }));

    res.json(roomsWithImages);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ message: 'Error fetching rooms' });
  }
});


module.exports = router;
