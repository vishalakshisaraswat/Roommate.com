const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: { type: String, unique: true, required: true }, // Explicitly define it
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
  address: { type: String, required: true },
  rent: { type: Number, required: true },
  description: { type: String },
  photos: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
