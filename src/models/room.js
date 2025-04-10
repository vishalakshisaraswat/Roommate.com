const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: { type: String, unique: true, required: true }, // Explicitly defined
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },

  // Describe Your Room 
  roomType: { type: String, enum: ["Single", "Double", "Suite"], required: true },
  washroomType: { type: String, enum: ["Private", "Shared"], required: true },
  furnishing: { type: String, enum: ["Fully Furnished", "Semi Furnished", "Unfurnished"], required: true },

  // Address Fields
  city: { type: String, required: true },
  area: { type: String, required: true },
  colony: { type: String, required: true },
  address: { type: String, required: true },

  // Rent (Dropdown)
  rent: { type: String, required: true }, 

  // Availability
  availability: { type: Date, required: true },

  // Internet Access
  internetAccess: { type: Boolean, default: false },
  internetType: { type: String, enum: ["WiFi", "Broadband"], default: null },

  // Parking
  parking: { type: Boolean, default: false },

  // Additional Amenities
  amenities: {
    ac: { type: Boolean, default: false },
    heater: { type: Boolean, default: false },
    balcony: { type: Boolean, default: false },
    kitchen: { type: Boolean, default: false }
  },

  // Photos
  photos: [{ type: String }], 

}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
