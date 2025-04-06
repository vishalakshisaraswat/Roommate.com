const mongoose = require('mongoose');

const RoommateSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    genderPreference: { type: String, enum: ['male', 'female', 'no-preference'], required: true },
    ageGroup: { type: String, enum: ['18-25', '26-35', '36-45', 'no-preference'], required: true },
    sleepingSchedule: { type: String, enum: ['morning-person', 'night-person', 'no-preference'], required: true },
    workArrangement: { type: String, enum: ['work-from-home', 'on-site-work', 'student'], required: true },
    socialStyle: { type: String, enum: ['outgoing', 'friendly', 'occasional', 'reserved', 'flexible'], required: true },
    languages: [{ type: String }],
    smoking: { type: String, enum: ['yes', 'no'], required: true },
    alcohol: { type: String, enum: ['yes', 'no'], required: true },
    cleanliness: { type: String, enum: ['very-important', 'moderately-important', 'not-important'], required: true },
    quietEnvironment: { type: String, enum: ['yes', 'no', 'flexible'], required: true },
    entertainGuests: { type: String, enum: ['rarely', 'occasionally', 'frequently'], required: true },
    roommateTime: { type: String, enum: ['yes', 'no', 'sometimes'], required: true },
    sharingMeals: { type: String, enum: ['yes', 'no', 'depends'], required: true },
    dietaryPreference: { type: String, enum: ['vegetarian', 'non-vegetarian', 'vegan'], required: true },
    pets: { type: String, enum: ['own-and-comfortable', 'comfortable-no-pets', 'not-comfortable', 'no-preference'], required: true },
    additionalPreferences: { type: String },
}, { timestamps: true });


const Roommate = mongoose.model('Roommate', RoommateSchema);

module.exports = Roommate;
