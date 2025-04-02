const mongoose = require('mongoose');
const Profile = require('./models/profile'); // Adjust the path

async function checkProfiles() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/userData', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const sampleProfile = await Profile.findOne(); // Fetch any profile
    console.log('Sample Profile:', sampleProfile);

    mongoose.disconnect();
  } catch (error) {
    console.error('Error checking profiles:', error);
  }
}

checkProfiles();
