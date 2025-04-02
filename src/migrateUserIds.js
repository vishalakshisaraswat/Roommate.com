const mongoose = require('mongoose');
const User = require('./models/user');
const Profile = require('./models/profile');

async function updateProfilesWithUserId() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/userData', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const users = await User.find(); // Fetch all users

    for (const user of users) {
      // Try to match profiles by name (ensure users have names)
      const profiles = await Profile.find({ profileName: user.email.split('@')[0] }); // Matches before @

      if (profiles.length > 0) {
        for (const profile of profiles) {
          const updateResult = await Profile.updateOne(
            { _id: profile._id },
            { $set: { userId: user.userId } } // Update profile with user's `userId`
          );

          console.log(`Updated ${updateResult.modifiedCount} profile(s) for user ${user.email}`);
        }
      } else {
        console.log(`No matching profile found for user ${user.email}`);
      }
    }

    console.log('Database update complete.');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error updating profiles:', error);
  }
}

updateProfilesWithUserId();
