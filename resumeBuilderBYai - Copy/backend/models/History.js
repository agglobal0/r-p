// backend/models/History.js
const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
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
  type: {
    type: String,
    required: true,
    enum: ['pptx', 'resume-pdf', 'resume-html'], // Keep it extensible
  },
  sourceData: {
    type: mongoose.Schema.Types.Mixed, // To store the AI-generated JSON
    required: true,
  },
  fileContent: {
    type: String, // Storing base64 content of the generated file
    required: true,
  },
  prompt: { // The initial prompt/topic from the user
    type: String,
    trim: true,
  }
}, {
  timestamps: true,
});

const History = mongoose.model('History', historySchema);

module.exports = History;
