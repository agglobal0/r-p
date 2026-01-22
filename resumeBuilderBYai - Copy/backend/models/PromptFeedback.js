const mongoose = require('mongoose');

const promptFeedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  prompt: { type: String, required: true },
  feedback: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
}, { timestamps: true });

module.exports = mongoose.model('PromptFeedback', promptFeedbackSchema);
