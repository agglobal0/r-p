const mongoose = require('mongoose');

const refinementSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  historyItem: { type: mongoose.Schema.Types.ObjectId, ref: 'History', required: true },
  summary: { type: String },
  before: { type: mongoose.Schema.Types.Mixed },
  after: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

module.exports = mongoose.model('Refinement', refinementSchema);
