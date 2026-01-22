const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const History = require('../models/History');
const PromptFeedback = require('../models/PromptFeedback');
const Refinement = require('../models/Refinement');
const { callDeepSeek } = require('../ai/deepseek');
const { generatePresentation } = require('../util/pptxGenerator');
const { generatePDFBuffer, generateHTMLResume } = require('../util/pdfGenerator');

// POST /api/review - submit a user review and process refinement
router.post('/', protect, async (req, res) => {
  const { historyId, feedback, rating } = req.body;
  if (!historyId || !feedback) return res.status(400).json({ message: 'historyId and feedback required' });

  try {
    const item = await History.findOne({ _id: historyId, user: req.user._id });
    if (!item) return res.status(404).json({ message: 'History item not found' });

    // Save prompt feedback
    const fb = new PromptFeedback({ user: req.user._id, prompt: item.prompt || '', feedback, rating });
    await fb.save();

    // Build a refinement prompt for DeepSeek
    const prompt = `You are an AI editor. The user provided the following feedback about the generated content: "${feedback}".\n\nOriginal AI source JSON:\n${JSON.stringify(item.sourceData, null, 2)}\n\nReturn a JSON object with two keys: "modified" (the revised structured data JSON) and "summary" (a short description of changes). Ensure modified matches the same structure as the original.`;

    const aiResponse = await callDeepSeek(prompt, { temperature: 0.3, max_tokens: 1500 });

    // aiResponse may be { modified: {...}, summary: '...' } or directly the modified JSON
    let modified = aiResponse.modified || aiResponse;
    let summary = aiResponse.summary || 'Refinement applied by AI';

    // Update history item and regenerate fileContent depending on type
    let newFileContent = item.fileContent;
    if (item.type === 'pptx') {
      newFileContent = await generatePresentation(modified);
    } else if (item.type === 'resume-pdf') {
      const buf = await generatePDFBuffer(modified);
      newFileContent = Buffer.from(buf).toString('base64');
    } else if (item.type === 'resume-html') {
      const html = generateHTMLResume(modified);
      newFileContent = Buffer.from(html).toString('base64');
    }

    const before = item.sourceData;
    item.sourceData = modified;
    item.fileContent = newFileContent;
    await item.save();

    const refinement = new Refinement({ user: req.user._id, historyItem: item._id, summary, before, after: modified });
    await refinement.save();

    res.json({ success: true, history: item, refinement });
  } catch (err) {
    console.error('Review processing error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET refinements for a user
router.get('/', protect, async (req, res) => {
  try {
    const items = await Refinement.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
