const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  profileName: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  userType: { type: String, enum: ['roommateSeekerWithRoom', 'roommateSeekerWithoutRoom'], required: true },
  age: { type: Number, required: true },
  languages: { type: [String], required: true },
  otherLanguage: { type: String },
  address: { type: String, required: true },
  description: { type: String },
  image: { type: Buffer }, // Change from String to Buffer
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
