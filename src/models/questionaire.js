const mongoose = require('mongoose');


const questionnaireSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true }, // Foreign key to Profile
    genderPreference: String,
    ageGroup: String,
    sleepingSchedule: String,
    workArrangement: String,
    socialStyle: String,
    locationPreference: String,
    specificAddress: String,

    roomBudget: { type: Number, min: 500 }, 
    accommodationType: String,
    language: [String],
    otherLanguage: { type: String },
    smoking: String,
    alcohol: String,
    cleanliness: String,
    quietEnvironment: String,
    entertainGuests: String,
    roommateTime: String,
    sharingMeals: String,
    dietaryPreference: String,
    pets: String,
    additionalPreferences: String,
}, { timestamps: true });

module.exports = mongoose.model('Questionnaire', questionnaireSchema);