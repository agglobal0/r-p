// backend/models/Presentation.js
const mongoose = require('mongoose');

const presentationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String, // Storing base64 content
    required: true,
  },
  summaryPrompt: {
    type: String,
    trim: true,
  }
}, {
  timestamps: true,
});

const Presentation = mongoose.model('Presentation', presentationSchema);

module.exports = Presentation;
