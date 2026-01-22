const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const Presentation = require('../models/Presentation');
const PromptFeedback = require('../models/PromptFeedback');
const History = require('../models/History');

// Get all presentations for current user
router.get('/presentations', protect, async (req, res) => {
  try {
    const presentations = await Presentation.find({ user: req.user._id });
    res.json(presentations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Save a new presentation (already exists in auth routes but expose here for consistency)
router.post('/presentations', protect, async (req, res) => {
  const { title, content, summaryPrompt } = req.body;
  try {
    const presentation = new Presentation({ title, content, summaryPrompt, user: req.user._id });
    const saved = await presentation.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// History endpoints: save and retrieve generated artifacts (pptx/resume)
router.post('/history', protect, async (req, res) => {
  const { title, type, sourceData, fileContent, prompt } = req.body;
  try {
    const entry = new History({ user: req.user._id, title, type, sourceData, fileContent, prompt });
    const saved = await entry.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/history', protect, async (req, res) => {
  try {
    const items = await History.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/history/:id', protect, async (req, res) => {
  try {
    const item = await History.findOne({ _id: req.params.id, user: req.user._id });
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Prompt feedback endpoints
router.post('/feedback', protect, async (req, res) => {
  const { prompt, feedback, rating } = req.body;
  try {
    const entry = new PromptFeedback({ user: req.user._id, prompt, feedback, rating });
    const saved = await entry.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/feedback', protect, async (req, res) => {
  try {
    const feedbacks = await PromptFeedback.find({ user: req.user._id });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
