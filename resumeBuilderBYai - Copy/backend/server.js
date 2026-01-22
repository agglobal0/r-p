// server.js - Improved with HTML/Tailwind resume generation
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { callDeepSeek } = require("./ai/deepseek");
const { 
  buildInterviewPrompt, 
  buildResumeLayoutPrompt, 
  buildResumeModificationPrompt,
  buildAnalysisPrompt,
  buildPresentationPrompt
} = require("./util/prompts");
const { generatePDFBuffer, generateResumeLayout } = require('./util/pdfGenerator');
const { generateSimplePPTX, generatePresentation } = require('./util/pptxGenerator');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const History = require('./models/History');
const Feedback = require('./models/Feedback');

const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const externalRoutes = require('./routes/external');
const historyRoutes = require('./routes/history');
const reviewRoutes = require('./routes/review');

// --- MongoDB Connection ---
// The user will need to install mongoose: npm install mongoose
// The user will also need to set the MONGO_URI in a .env file
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/resumeBuilder';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Successfully connected to MongoDB.'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  // It's often better to exit if you can't connect to the DB
  process.exit(1);
});
// --- End of MongoDB Connection ---

// Import missing constants
const RESUME_METHODS = {
  star: { name: 'STAR Method', description: 'Situation–Task–Action–Result' },
  car: { name: 'CAR Method', description: 'Challenge–Action–Result' },  
  par: { name: 'PAR Method', description: 'Problem–Action–Result' },
  soar: { name: 'SOAR Method', description: 'Situation–Obstacle–Action–Result' },
  fab: { name: 'FAB Method', description: 'Features–Advantages–Benefits' }
};

const INDUSTRY_STANDARDS = {
  tech: { colors: ['#2563eb', '#1f2937'], sections: ['contact', 'summary', 'skills', 'experience', 'projects', 'education'] },
  medical: { colors: ['#dc2626', '#1f2937'], sections: ['contact', 'summary', 'education', 'certifications', 'experience', 'skills'] },
  ai: { colors: ['#7c3aed', '#1f2937'], sections: ['contact', 'summary', 'skills', 'research', 'projects', 'experience'] }
};

const app = express();
const PORT = process.env.PORT || 5000;

const protect = async (req, res, next) => {
  let token;

  if (req.cookies.token) {
    try {
      token = req.cookies.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      console.error(error);
      res.status(401).send('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401).send('Not authorized, no token');
  }
};


// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/external', externalRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/review', reviewRoutes);

// Global state
let resumeAnalysis = null;
let resumeLayout = null;
let interviewState = {
  qa: [],
  finished: false,
  maxQuestions: 5,
  level: "basic"
};

// Helper function to generate HTML resume
function generateHTMLResume(data, theme = { primary: '#2563eb' }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.personalInfo?.name || 'Resume'}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @media print { 
            body { -webkit-print-color-adjust: exact; }
            .no-print { display: none; }
        }
        .primary-color { color: ${theme.primary}; }
        .primary-border { border-color: ${theme.primary}; }
        .primary-bg { background-color: ${theme.primary}; }
        
        /* Enhanced text selection styling */
        ::selection {
            background-color: ${theme.primary}20;
            color: ${theme.primary};
        }
        
        /* Improved hover effects for better user experience */
        .selectable-content:hover {
            background-color: #f8fafc;
            cursor: text;
        }
        
        /* Better spacing and typography */
        .resume-section {
            margin-bottom: 2rem;
            padding: 1rem 0;
        }
        
        .resume-text {
            user-select: text;
            line-height: 1.6;
        }
    </style>
</head>
<body class="bg-white text-gray-800 font-sans leading-relaxed">
    <div class="max-w-4xl mx-auto p-8">
        <!-- Header -->
        <header class="text-center mb-8 pb-6 border-b-2 primary-border resume-section">
            <h1 class="text-3xl font-bold primary-color mb-2 resume-text selectable-content">${data.personalInfo?.name || 'Your Name'}</h1>
            <div class="text-sm text-gray-600 resume-text selectable-content">
                ${data.personalInfo?.email || ''} • 
                ${data.personalInfo?.phone || ''} • 
                ${data.personalInfo?.location || ''}
            </div>
        </header>

        <!-- Professional Summary -->
        ${data.summary ? `
        <section class="resume-section">
            <h2 class="text-lg font-semibold primary-color mb-3 uppercase tracking-wide">Professional Summary</h2>
            <p class="text-gray-700 leading-relaxed resume-text selectable-content">${data.summary}</p>
        </section>
        ` : ''}

        <!-- Skills -->
        ${data.skills?.technical?.length || data.skills?.soft?.length || data.skills?.tools?.length ? `
        <section class="resume-section">
            <h2 class="text-lg font-semibold primary-color mb-3 uppercase tracking-wide">Skills</h2>
            
            ${data.skills?.technical?.length ? `
                <div class="mb-4">
                    <h3 class="font-medium text-gray-800 mb-2">Technical Skills</h3>
                    <div class="grid grid-cols-2 gap-2">
                        ${data.skills.technical.map(skill => `<div class="text-gray-700 resume-text selectable-content">• ${skill}</div>`).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${data.skills?.soft?.length ? `
                <div class="mb-4">
                    <h3 class="font-medium text-gray-800 mb-2">Soft Skills</h3>
                    <div class="grid grid-cols-2 gap-2">
                        ${data.skills.soft.map(skill => `<div class="text-gray-700 resume-text selectable-content">• ${skill}</div>`).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${data.skills?.tools?.length ? `
                <div class="mb-4">
                    <h3 class="font-medium text-gray-800 mb-2">Tools & Technologies</h3>
                    <div class="grid grid-cols-2 gap-2">
                        ${data.skills.tools.map(tool => `<div class="text-gray-700 resume-text selectable-content">• ${tool}</div>`).join('')}
                    </div>
                </div>
            ` : ''}
        </section>
        ` : ''}

        <!-- Experience -->
        ${data.experience?.length ? `
        <section class="resume-section">
            <h2 class="text-lg font-semibold primary-color mb-3 uppercase tracking-wide">Experience</h2>
            ${data.experience.map(exp => `
                <div class="mb-6">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-semibold text-gray-800 resume-text selectable-content">${exp.role || 'Job Title'}</h3>
                        <span class="text-gray-600 text-sm resume-text selectable-content">${exp.duration || 'Duration'}</span>
                    </div>
                    <div class="text-gray-600 mb-2 resume-text selectable-content">${exp.company || 'Company Name'}</div>
                    ${exp.achievements?.length ? `
                        <ul class="ml-4">
                            ${exp.achievements.map(achievement => `<li class="text-gray-700 mb-1 resume-text selectable-content">• ${achievement}</li>`).join('')}
                        </ul>
                    ` : ''}
                </div>
            `).join('')}
        </section>
        ` : ''}

        <!-- Education -->
        ${data.education?.length ? `
        <section class="resume-section">
            <h2 class="text-lg font-semibold primary-color mb-3 uppercase tracking-wide">Education</h2>
            ${data.education.map(edu => `
                <div class="mb-3">
                    <div class="flex justify-between items-start">
                        <div>
                            <div class="font-semibold text-gray-800 resume-text selectable-content">${edu.degree || 'Degree'}</div>
                            <div class="text-gray-600 resume-text selectable-content">${edu.institution || 'Institution'}</div>
                        </div>
                        <span class="text-gray-600 text-sm resume-text selectable-content">${edu.year || 'Year'}</span>
                    </div>
                </div>
            `).join('')}
        </section>
        ` : ''}

        <!-- Projects -->
        ${data.projects?.length ? `
        <section class="resume-section">
            <h2 class="text-lg font-semibold primary-color mb-3 uppercase tracking-wide">Projects</h2>
            ${data.projects.map(project => `
                <div class="mb-4">
                    <h3 class="font-semibold text-gray-800 mb-1 resume-text selectable-content">${project.title || 'Project Title'}</h3>
                    <p class="text-gray-700 resume-text selectable-content">${project.description || 'Project description'}</p>
                    ${project.technologies?.length ? `
                        <div class="mt-2">
                            <span class="text-sm text-gray-600 resume-text selectable-content">Technologies: ${project.technologies.join(', ')}</span>
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </section>
        ` : ''}

        <!-- Certifications -->
        ${data.certifications?.length ? `
        <section class="resume-section">
            <h2 class="text-lg font-semibold primary-color mb-3 uppercase tracking-wide">Certifications</h2>
            <div class="grid grid-cols-1 gap-2">
                ${data.certifications.map(cert => `<div class="text-gray-700 resume-text selectable-content">• ${cert}</div>`).join('')}
            </div>
        </section>
        ` : ''}
    </div>
</body>
</html>`;
}


// API Routes
app.post("/api/generatePPTX", protect, async (req, res) => {
  try {
    const { topic, slideCount, tone } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: "The 'topic' field is required in the request body.",
      });
    }

    // 1. Generate a prompt for the AI
    const prompt = buildPresentationPrompt(topic, slideCount, tone);

    // 2. Call the AI to get structured presentation data
    const aiData = await callDeepSeek(prompt, { max_tokens: 1000 });

    // 3. Generate the .pptx file from the AI data
    const pptx_data = await generatePresentation(aiData);

    // 4. Save to history
    const historyItem = new History({
      title: aiData.title || topic,
      type: 'pptx',
      sourceData: aiData,
      fileContent: pptx_data,
      prompt: topic,
      user: req.user._id,
    });
    const savedItem = await historyItem.save();

    // 5. Send the base64 PPTX and history ID back to the client
    res.json({ success: true, pptx: pptx_data, aiData: aiData, historyId: savedItem._id });
  } catch (error) {
    console.error("PPTX generation error:", error);
    res.status(500).json({
      success: false,
      error: `PPTX generation failed: ${error.message}`,
      details: error.cause,
    });
  }
});

// @desc    Get user's generation history
// @route   GET /api/history
// @access  Private
app.get('/api/history', protect, async (req, res) => {
  try {
    const query = { user: req.user._id };
    if (req.query.type) {
      query.type = req.query.type;
    }
    const history = await History.find(query).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: `Error fetching history: ${error.message}` });
  }
});

// @desc    Save a generated item to history
// @route   POST /api/history
// @access  Private
app.post('/api/history', protect, async (req, res) => {
  const { title, type, sourceData, fileContent, prompt } = req.body;

  if (!title || !type || !sourceData || !fileContent) {
    return res.status(400).json({ message: 'Missing required fields for history item.' });
  }

  try {
    const historyItem = new History({
      title,
      type,
      sourceData,
      fileContent,
      prompt,
      user: req.user._id,
    });

    const createdHistoryItem = await historyItem.save();
    res.status(201).json(createdHistoryItem);
  } catch (error) {
    res.status(400).json({ message: `Error saving history item: ${error.message}` });
  }
});

// @desc    Submit feedback for a history item
// @route   POST /api/feedback
// @access  Private
app.post('/api/feedback', protect, async (req, res) => {
  const { historyId, rating, comment } = req.body;

  if (!historyId || !rating) {
    return res.status(400).json({ message: 'History ID and rating are required.' });
  }

  try {
    // Ensure the history item belongs to the user
    const historyItem = await History.findById(historyId);
    if (!historyItem || historyItem.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'History item not found or not owned by user.' });
    }

    const feedback = new Feedback({
      historyItem: historyId,
      rating,
      comment,
      user: req.user._id,
    });

    const createdFeedback = await feedback.save();
    res.status(201).json(createdFeedback);
  } catch (error) {
    res.status(400).json({ message: `Error submitting feedback: ${error.message}` });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});



app.post("/api/modifyResumeGeneral", async (req, res) => {
  try {
    if (!resumeLayout) {
      return res.status(400).json({ 
        success: false, 
        error: "No resume exists to modify. Please generate a resume first." 
      });
    }

    const { request, section } = req.body;
    
    if (!request || !request.trim()) {
      return res.status(400).json({
        success: false,
        error: "Modification request is required"
      });
    }

    const modificationPrompt = `
You are an AI resume editor. Modify the existing resume based on the user's request.

Current Resume Data:
${JSON.stringify(resumeLayout.data, null, 2)}

User Request: "${request}"
${section ? `Focused Section: "${section}"` : ''}

Rules:
1. Return ONLY the complete updated JSON resume structure
2. Make targeted changes based on the request
3. Preserve all existing information unless specifically requested to change/remove
4. Maintain professional language and ATS optimization
5. Keep the same JSON structure as the original
6. If adding new information, ensure it's relevant and professional

Return the complete updated resume JSON:`;

    const modified = await callDeepSeek(modificationPrompt, { 
      temperature: 0.4,
      max_tokens: 1500
    });

    // Update layout with new data and preserve theme
    const currentTheme = resumeLayout.theme || { primary: "#2563eb" };
    resumeLayout.data = modified;
    resumeLayout.htmlContent = generateHTMLResume(modified, currentTheme);
    resumeLayout.theme = currentTheme;

    res.json({ success: true, layout: resumeLayout });
    
  } catch (err) {
    console.error("Resume modification error:", err);
    res.status(500).json({ 
      success: false, 
      error: `Modification failed: ${err.message}` 
    });
  }
});




app.post("/api/analyzeMissingItems", async (req, res) => {
  try {
    const { resumeData, htmlContent } = req.body;
    
    if (!resumeData || !htmlContent) {
      return res.status(400).json({
        success: false,
        error: "Resume data and HTML content are required"
      });
    }

    const analysisPrompt = `
You are an AI resume quality analyzer. Analyze this resume for missing, incomplete, or problematic information that could hurt the candidate's chances.

Resume Data:
${JSON.stringify(resumeData, null, 2)}

HTML Content Preview:
${htmlContent.substring(0, 1000)}...

Focus on these common issues:
1. Missing or generic dates (like "Recent" instead of "2023-2024")
2. Vague job descriptions without quantifiable achievements
3. Missing contact information elements
4. Generic or weak professional summaries
5. Skills listed without context or proficiency levels
6. Education without graduation years or relevant details
7. Experience without specific company names or roles
8. Projects without technologies or outcomes mentioned

For each issue found, provide:
- field: the section/field with the issue
- issue: description of what's wrong
- severity: "high"|"medium"|"low" 
- suggestions: array of 2-3 specific fix examples
- placeholder: suggested input placeholder text

Return JSON:
{
  "hasIssues": boolean,
  "totalIssues": number,
  "missingItems": [
    {
      "field": "Experience Dates",
      "issue": "Using vague terms like 'Recent' instead of specific date ranges",
      "severity": "high",
      "suggestions": ["June 2023 - August 2023", "Jan 2024 - Present", "Summer 2023"],
      "placeholder": "e.g., June 2023 - Present"
    }
  ],
  "overallScore": 85,
  "recommendations": ["Overall improvement suggestions"]
}

Only flag genuine issues that would impact ATS parsing or recruiter perception. Be constructive and specific.
`;

    const analysis = await callDeepSeek(analysisPrompt, { 
      temperature: 0.3,
      max_tokens: 1200
    });
    
    // Validate and filter results
    const validIssues = analysis.missingItems?.filter(item => 
      item.field && item.issue && item.severity
    ) || [];

    res.json({
      success: true,
      hasIssues: validIssues.length > 0,
      missingItems: validIssues,
      totalIssues: validIssues.length,
      overallScore: analysis.overallScore || 75,
      recommendations: analysis.recommendations || []
    });

  } catch (error) {
    console.error("Missing items analysis error:", error);
    res.status(500).json({
      success: false,
      error: `Analysis failed: ${error.message}`
    });
  }
});

app.post("/api/correctMissingItem", async (req, res) => {
  try {
    const { resumeData, item, value } = req.body;
    
    if (!resumeData || !item || !value) {
      return res.status(400).json({
        success: false,
        error: "Resume data, item details, and correction value are required"
      });
    }

    const correctionPrompt = `
You are an AI resume editor. Apply a specific correction to the resume data.

Current Resume Data:
${JSON.stringify(resumeData, null, 2)}

Issue to Fix: ${item.field}
Problem: ${item.issue}
User's Correction: "${value}"

Apply this correction to the appropriate section of the resume. Be surgical - only modify the specific field that needs fixing.

Rules:
1. Maintain all existing information
2. Apply the correction to the exact field mentioned
3. Ensure the correction fits naturally into the resume structure
4. Keep the JSON structure identical
5. Make minimal changes - only fix what was requested

Return the complete corrected resume JSON:
`;

    const correctedResume = await callDeepSeek(correctionPrompt, {
      temperature: 0.2,
      max_tokens: 1500
    });

    // Validate the response
    if (!correctedResume || typeof correctedResume !== 'object') {
      throw new Error("Invalid correction response from AI");
    }

    // Generate updated HTML
    const updatedLayout = generateResumeLayout(correctedResume);
    
    // Update global state
    resumeLayout = updatedLayout;

    console.log(`Corrected missing item: ${item.field} with value: ${value}`);

    res.json({
      success: true,
      layout: updatedLayout,
      message: `Fixed: ${item.field}`
    });

  } catch (error) {
    console.error("Missing item correction error:", error);
    res.status(500).json({
      success: false,
      error: `Correction failed: ${error.message}`
    });
  }
});

app.post("/api/modifySelectedText", async (req, res) => {
  try {
    const { resumeData, htmlContent, selectedText, context, modification } = req.body;
    
    if (!resumeData || !selectedText || !modification) {
      return res.status(400).json({
        success: false,
        error: "Resume data, selected text, and modification instructions are required"
      });
    }

    const modificationPrompt = `
You are an AI resume editor specializing in precise text modifications. You need to modify ONLY the selected text while preserving everything else.

Current Resume Data:
${JSON.stringify(resumeData, null, 2)}

Selected Text to Modify: "${selectedText}"
Context Around Selected Text: "${context}"
User's Modification Request: "${modification}"

CRITICAL RULES:
1. Find the exact location of the selected text in the resume data
2. Apply ONLY the requested modification to that specific text
3. Preserve ALL other resume content exactly as is
4. Maintain the same JSON structure
5. Be surgical and precise - no broad changes

Task: Identify where "${selectedText}" appears in the resume and modify it according to the user's request.

Return the complete updated resume JSON with ONLY the selected text modified:
`;

    const modifiedResume = await callDeepSeek(modificationPrompt, {
      temperature: 0.3,
      max_tokens: 1500
    });

    // Validate the response
    if (!modifiedResume || typeof modifiedResume !== 'object') {
      throw new Error("Invalid modification response from AI");
    }

    // Generate updated HTML with preserved theme
    const currentTheme = resumeLayout?.theme || { primary: "#2563eb" };
    const updatedLayout = generateResumeLayout(modifiedResume, currentTheme);
    
    // Update global state
    resumeLayout = updatedLayout;

    console.log(`Modified selected text: "${selectedText.substring(0, 50)}..."`);

    res.json({
      success: true,
      layout: updatedLayout,
      message: "Selected text modified successfully"
    });

  } catch (error) {
    console.error("Selected text modification error:", error);
    res.status(500).json({
      success: false,
      error: `Selected text modification failed: ${error.message}`
    });
  }
});



app.post("/api/startInterview", (req, res) => {
  const { level } = req.body;
  
  const levels = {
    basic: 1,      // More realistic for combining questions
    standard: 8,
    advanced: 15
  };

  const chosenLevel = level && levels[level] ? level : "basic";

  interviewState = {
    qa: [],
    finished: false,
    maxQuestions: levels[chosenLevel],
    level: chosenLevel
  };

  res.json({
    success: true,
    message: `Interview started with ${chosenLevel} mode`,
    maxQuestions: interviewState.maxQuestions
  });
});

app.post("/api/getInterview", async (req, res) => {
  try {
    const { answer } = req.body;

    // Save answer if there was a previous question
    if (answer !== undefined && interviewState.qa.length > 0) {
      const lastQ = interviewState.qa[interviewState.qa.length - 1];
      lastQ.answer = answer;
      lastQ.category = lastQ.category || 'general'; // Ensure category exists
    }

    // Check if we reached max questions
    if (interviewState.qa.length >= interviewState.maxQuestions) {
      interviewState.finished = true;
      return res.json({
        success: true,
        done: true,
        message: "Interview complete."
      });
    }

    // Build prompt with improved logic
    const prompt = buildInterviewPrompt(
      interviewState.qa, 
      answer, 
      interviewState.maxQuestions
    );
    
    const parsed = await callDeepSeek(prompt, { temperature: 0.3 }); // Lower temp for consistency

    if (parsed.done) {
      interviewState.finished = true;
      return res.json({
        success: true,
        done: true,
        message: "Interview complete."
      });
    }

    if (!parsed.question) {
      return res.status(500).json({
        success: false,
        error: "AI did not return a valid question"
      });
    }

    // Save new question with metadata
    interviewState.qa.push({ 
      question: parsed.question, 
      answer: null,
      category: parsed.category || 'general',
      type: parsed.type || 'text',
      requiresMultipleFields: parsed.requiresMultipleFields || false
    });

    res.json({
      success: true,
      question: parsed.question,
      type: parsed.type || "text",
      options: parsed.options || [],
      category: parsed.category,
      currentCount: interviewState.qa.length,
      maxQuestions: interviewState.maxQuestions
    });

  } catch (error) {
    console.error("Interview error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/chooseMethod", async (req, res) => {
  try {
    let { method, industry } = req.body;

    industry = industry || "ai";
    method = method || "star";

    const selectedMethod = RESUME_METHODS[method] || RESUME_METHODS.star;
    const selectedIndustry = INDUSTRY_STANDARDS[industry] || INDUSTRY_STANDARDS.ai;

    // Use improved analysis prompt
    const analysisPrompt = buildAnalysisPrompt(interviewState.qa, method, industry);
    const analysis = await callDeepSeek(analysisPrompt, { temperature: 0.4 });

    resumeAnalysis = analysis;

    res.json({
      success: true,
      method: selectedMethod,
      industry: selectedIndustry,
      analysis: {
        summaryText: `Professional ${industry} specialist with proven experience`,
        structuredData: analysis,
        visualIdeas: ["Skills distribution chart", "Experience timeline"]
      }
    });

  } catch (error) {
    console.error("Choose method error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/generateResume", async (req, res) => {
  try {
    const { preference, selectedHighlights, additionalInfo, skipMissingCheck } = req.body;
    
    // Add additional info to interview state if provided
    if (additionalInfo && additionalInfo.trim()) {
      interviewState.qa.push({
        question: "Supplementary information for resume completion",
        answer: additionalInfo,
        category: 'supplementary',
        type: 'text'
      });
    }
    
    // Only check for missing info if not explicitly skipped
    if (!skipMissingCheck) {
      // Quick check for critical missing information before generating
      const missingCheck = await callDeepSeek(`
Analyze this interview data for CRITICAL missing information that would make resume generation impossible:

${JSON.stringify(interviewState.qa, null, 2)}

Return JSON:
{
  "canProceed": boolean,
  "criticalIssue": "description if canProceed is false"
}

Only set canProceed to false if there's absolutely no way to create a basic resume.
`, { temperature: 0.2 });

      if (!missingCheck.canProceed) {
        return res.status(400).json({
          success: false,
          error: missingCheck.criticalIssue || "Critical information missing",
          needsMoreInfo: true
        });
      }
    }
    
    // Enhanced resume generation prompt with better structure and fallback handling
    const resumePrompt = `
You are a professional resume builder. Create a comprehensive, ATS-optimized resume using the available interview responses.

CRITICAL: Return ONLY valid JSON. No explanations, no additional text.

Interview Responses:
${JSON.stringify(interviewState.qa, null, 2)}

User Preferences:
- Template: ${preference || "ats_friendly"}
- Highlights: ${JSON.stringify(selectedHighlights || [])}

IMPORTANT INSTRUCTIONS:
1. If specific information is missing, make reasonable professional assumptions
2. Use placeholder text that looks professional (e.g., "Professional Name" not "NAME_MISSING")
3. Extract all available information accurately
4. Create compelling content even with limited input
5. Ensure the resume looks complete and professional

Create a complete resume with this structure:

{
  "personalInfo": {
    "name": "Extract full name OR use 'Professional Candidate'",
    "email": "Extract email OR generate professional-looking email like 'professional.candidate@email.com'", 
    "phone": "Extract phone OR use '+1 (555) 123-4567'",
    "location": "Extract city, state OR use 'City, State'",
    "linkedin": "Generate if mentioned, otherwise omit",
    "portfolio": "Extract if mentioned, otherwise omit"
  },
  "summary": "Write compelling 3-4 line professional summary using ANY available information about skills, experience, or goals. If very limited info, write generic but professional summary for the target industry",
  "skills": {
    "technical": ["Extract technical skills OR infer from any technology mentions OR provide common professional skills"],
    "soft": ["Extract soft skills OR infer from experience descriptions OR provide standard professional skills like 'Communication', 'Problem Solving'"],
    "tools": ["Extract tools/software mentioned OR provide commonly used tools for the apparent field"],
    "languages": ["Only include if specifically mentioned"]
  },
  "experience": [
    {
      "company": "Extract company name OR use 'Professional Experience'",
      "role": "Extract job title OR infer from context OR use 'Professional Role'",
      "duration": "Extract timeframe OR estimate based on context OR use 'Recent'",
      "location": "Extract if mentioned OR omit",
      "achievements": [
        "Create professional achievement based on any work descriptions provided",
        "Second achievement if enough information available",
        "Third achievement focusing on results/impact if possible"
      ]
    }
  ],
  "education": [
    {
      "degree": "Extract degree OR infer education level OR use 'Relevant Education'",
      "institution": "Extract school name OR use 'Academic Institution'",
      "year": "Extract graduation year OR use 'Recent Graduate' OR omit",
      "location": "Extract if mentioned OR omit",
      "gpa": "Only if mentioned and above 3.5",
      "honors": "Only if mentioned"
    }
  ],
  "projects": [
    "Only include if projects are specifically mentioned in responses"
  ],
  "certifications": ["Only include if certifications are mentioned"],
  "achievements": ["Only include if specific achievements are mentioned"],
  "volunteer": ["Only include if volunteer work is mentioned"]
}

Guidelines for Limited Information:
- Make the resume look professional and complete even with minimal input
- Use industry-standard language and formatting
- Focus on what IS available rather than what's missing
- Create reasonable professional-sounding content
- Ensure every section that's included has meaningful content
- Remove empty arrays/objects from the final JSON

Return ONLY the JSON structure above:`;

    const resumeData = await callDeepSeek(resumePrompt, { 
      temperature: 0.4,
      max_tokens: 2000
    });

    // Validate and clean the resume data
    if (!resumeData || typeof resumeData !== 'object') {
      throw new Error("AI returned invalid resume data structure");
    }

    // Ensure minimum required fields exist
    if (!resumeData.personalInfo) {
      resumeData.personalInfo = {
        name: "Professional Candidate",
        email: "professional.candidate@email.com",
        phone: "+1 (555) 123-4567",
        location: "City, State"
      };
    }

    if (!resumeData.summary) {
      resumeData.summary = "Dedicated professional with strong analytical and communication skills seeking to contribute to a dynamic organization.";
    }

    // Generate HTML using the enhanced generator
    const layout = generateResumeLayout(resumeData);

    if (!layout || !layout.htmlContent) {
      throw new Error("Failed to generate resume layout");
    }

    // Store globally for modifications
    resumeLayout = layout;

    console.log("Resume generated successfully:", {
      hasPersonalInfo: !!resumeData.personalInfo,
      hasSummary: !!resumeData.summary,
      experienceCount: resumeData.experience?.length || 0,
      skillsCount: Object.keys(resumeData.skills || {}).length,
      htmlLength: layout.htmlContent.length
    });

    res.json({ success: true, layout: layout });
    
  } catch (err) {
    console.error("Resume generation error:", err);
    
    // Enhanced error handling with more specific messages
    let errorMessage = "Resume generation failed";
    let errorType = "resume_generation_error";
    
    if (err.message.includes('parse')) {
      errorMessage = "AI response formatting error - please try again";
      errorType = "ai_parse_error";
    } else if (err.message.includes('missing')) {
      errorMessage = "Critical information missing for resume generation";
      errorType = "missing_info_error";
    } else if (err.message.includes('layout')) {
      errorMessage = "Resume layout generation failed";
      errorType = "layout_error";
    }
    
    res.status(500).json({ 
      success: false, 
      error: `${errorMessage}: ${err.message}`,
      type: errorType,
      canRetry: true
    });
  }
});


app.post("/api/checkMissingInfo", async (req, res) => {
  try {
    const { additionalInfo } = req.body;
    
    // If additional info provided, add it to interview state
    if (additionalInfo && additionalInfo.trim()) {
      interviewState.qa.push({
        question: "Additional information provided for resume completion",
        answer: additionalInfo,
        category: 'supplementary',
        type: 'text'
      });
    }
    
    // Use AI to analyze what's actually missing and needed
    const missingInfoPrompt = `
You are an AI resume analyzer. Analyze the interview responses to determine if there are any CRITICAL gaps that would prevent creating a professional resume.

Interview Responses:
${JSON.stringify(interviewState.qa, null, 2)}

Rules for Analysis:
1. Only flag as missing if it's CRITICAL for a professional resume
2. Don't ask for information that can be reasonably inferred or is optional
3. Don't ask for information that's already provided in some form
4. Focus on absolutely essential resume components only

Essential Components to Check:
- Contact Information: Full name, professional email, phone number
- Professional Experience: At least one job/internship/project with specific details
- Skills: Technical or professional capabilities relevant to job seeking
- Education: Basic educational background (degree level, field, institution)

Analyze and respond with JSON:

{
  "hasIssues": boolean,
  "needsUserInput": boolean,
  "question": "specific question if user input needed",
  "missingItems": ["array of what's actually missing"],
  "canProceed": boolean,
  "reasoning": "why we need/don't need additional info"
}

Guidelines:
- hasIssues: true if any critical gaps exist
- needsUserInput: true only if we absolutely need user to provide missing info
- canProceed: true if we can build a reasonable resume with current data
- If needsUserInput is false, we should proceed with what we have

If missing info is needed, create ONE comprehensive question that asks for all missing items together.

Respond with JSON only:`;

    const analysis = await callDeepSeek(missingInfoPrompt, { temperature: 0.3 });
    
    // Validate the AI response
    const hasRealIssues = analysis.hasIssues && analysis.needsUserInput;
    const shouldProceed = analysis.canProceed !== false; // Default to true if not specified
    
    // Log for debugging
    console.log('Missing info analysis:', {
      hasIssues: analysis.hasIssues,
      needsUserInput: analysis.needsUserInput,
      canProceed: analysis.canProceed,
      questionLength: analysis.question?.length || 0,
      totalResponses: interviewState.qa.length,
      missingItems: analysis.missingItems
    });

    res.json({
      success: true,
      missingInfo: {
        hasIssues: hasRealIssues,
        needsUserInput: analysis.needsUserInput || false,
        question: hasRealIssues ? analysis.question : null,
        fields: analysis.missingItems || [],
        canProceed: shouldProceed,
        reasoning: analysis.reasoning
      }
    });
    
  } catch (error) {
    console.error("Missing info check error:", error);
    
    // Fallback to simple logic if AI analysis fails
    const responses = interviewState.qa.map(qa => qa.answer || '').join(' ').toLowerCase();
    
    // Basic fallback checks
    const hasContact = responses.includes('@') || responses.includes('phone');
    const hasExperience = responses.includes('work') || responses.includes('job') || responses.includes('experience');
    const hasSkills = responses.includes('skill') || responses.includes('python') || responses.includes('javascript');
    
    const needsBasicInfo = !hasContact || !hasExperience || !hasSkills;
    
    res.json({
      success: true,
      missingInfo: {
        hasIssues: needsBasicInfo,
        needsUserInput: needsBasicInfo,
        question: needsBasicInfo ? "To create a comprehensive resume, please provide your contact information (email, phone), work experience, and key skills in a structured format." : null,
        fields: needsBasicInfo ? ['contact', 'experience', 'skills'] : [],
        canProceed: !needsBasicInfo,
        reasoning: "Fallback analysis used due to AI processing error"
      }
    });
  }
});


app.post("/api/generatePDF", async (req, res) => {
  try {
    const { resumeData, theme, format } = req.body;
    
    if (!resumeData) {
      return res.status(400).json({
        success: false,
        error: "Resume data is required"
      });
    }

    console.log("Generating PDF with React-PDF...");
    
    // Generate PDF buffer using React-PDF
    const pdfBuffer = await generatePDFBuffer(resumeData, theme);
    
    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${resumeData.personalInfo?.name || 'Resume'}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({
      success: false,
      error: `PDF generation failed: ${error.message}`
    });
  }
});


app.post("/api/modifyResume", async (req, res) => {
  try {
    if (!resumeLayout) {
      return res.status(400).json({ 
        success: false, 
        error: "No resume exists to modify. Please generate a resume first." 
      });
    }

    const { request, section } = req.body;
    
    if (!request || !request.trim()) {
      return res.status(400).json({
        success: false,
        error: "Modification request is required"
      });
    }

    const modificationPrompt = `
You are an AI resume editor. Modify the existing resume based on the user's request.

Current Resume Data:
${JSON.stringify(resumeLayout.data, null, 2)}

User Request: "${request}"
${section ? `Focused Section: "${section}"` : ''}

Rules:
1. Return ONLY the complete updated JSON resume structure
2. Make targeted changes based on the request
3. Preserve all existing information unless specifically requested to change/remove
4. Maintain professional language and ATS optimization
5. Keep the same JSON structure as the original
6. If adding new information, ensure it's relevant and professional

Return the complete updated resume JSON:`;

    const modified = await callDeepSeek(modificationPrompt, { 
      temperature: 0.4,
      max_tokens: 1500
    });

    // Update layout with new data
    resumeLayout.data = modified;
    resumeLayout.htmlContent = generateResumeLayout(modified).htmlContent;

    res.json({ success: true, layout: resumeLayout });
    
  } catch (err) {
    console.error("Resume modification error:", err);
    res.status(500).json({ 
      success: false, 
      error: `Modification failed: ${err.message}` 
    });
  }
});



app.post("/api/resetInterview", (req, res) => {
  interviewState = {
    qa: [],
    finished: false,
    maxQuestions: 5,
    level: "basic"
  };
  
  resumeAnalysis = null;
  resumeLayout = null;
  
  res.json({
    success: true,
    message: "Interview state reset successfully"
  });
});



// Get current resume data endpoint
app.get("/api/getCurrentResume", (req, res) => {
  if (!resumeLayout) {
    return res.status(404).json({
      success: false,
      error: "No resume data available"
    });
  }

  res.json({
    success: true,
    layout: resumeLayout
  });
});


app.get("/api/getInterviewProgress", (req, res) => {
  res.json({
    success: true,
    progress: {
      current: interviewState.qa.length,
      max: interviewState.maxQuestions,
      finished: interviewState.finished,
      level: interviewState.level
    },
    qa: interviewState.qa.map(item => ({
      question: item.question,
      category: item.category,
      hasAnswer: !!item.answer
    }))
  });
});

app.post("/api/analyzeProfile", async (req, res) => {
  try {
    let { method, industry } = req.body;
    
    industry = industry || "ai";
    method = method || "star";

    const selectedMethod = RESUME_METHODS[method] || RESUME_METHODS.star;
    const selectedIndustry = INDUSTRY_STANDARDS[industry] || INDUSTRY_STANDARDS.ai;

    // Enhanced analysis prompt with statistical insights
    const analysisPrompt = `
You are a professional career analyst. Analyze the interview responses and provide detailed insights with statistical comparisons.

Interview Data:
${JSON.stringify(interviewState.qa, null, 2)}

Method: ${method}
Industry: ${industry}

Create a comprehensive analysis with the following structure:

{
  "profileSummary": "2-3 sentence professional summary of the candidate",
  "strengths": ["strength1", "strength2", "strength3"],
  "skillsAnalysis": {
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"],
    "leadership": ["skill1", "skill2"]
  },
  "experienceLevel": {
    "category": "entry|mid|senior|expert",
    "yearsEstimate": "1-2|3-5|6-10|10+",
    "confidence": 85
  },
  "industryFit": {
    "score": 85,
    "reasoning": "Why this score based on responses"
  },
  "benchmarkComparisons": [
    {
      "metric": "Technical Skills Breadth",
      "userScore": 85,
      "averageScore": 60,
      "percentile": 75,
      "description": "You demonstrate stronger technical skills than 75% of professionals"
    },
    {
      "metric": "Communication Skills",
      "userScore": 90,
      "averageScore": 70,
      "percentile": 80,
      "description": "Your communication abilities exceed 80% of candidates"
    },
    {
      "metric": "Problem Solving",
      "userScore": 80,
      "averageScore": 65,
      "percentile": 70,
      "description": "You rank in the top 30% for analytical thinking"
    }
  ],
  "improvementAreas": [
    "Area for development based on responses",
    "Another potential improvement area"
  ],
  "resumeRecommendations": {
    "suggestedTemplate": "ats_friendly|modern|creative",
    "keyHighlights": ["What to emphasize in resume"],
    "sectionsToFocus": ["skills", "experience", "projects"]
  },
  "marketInsights": {
    "demandLevel": "high|medium|low",
    "salaryRange": "$X - $Y based on level and location",
    "trendingSkills": ["skill1", "skill2"]
  }
}

Provide realistic but encouraging benchmarks. Base percentiles on actual industry standards where possible.
`;

    const analysis = await callDeepSeek(analysisPrompt, { temperature: 0.4 });
    
    // Store the detailed analysis
    resumeAnalysis = analysis;

    res.json({
      success: true,
      analysis: analysis,
      method: selectedMethod,
      industry: selectedIndustry
    });

  } catch (error) {
    console.error("Profile analysis error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// New endpoint to get HTML resume for PDF conversion
app.post("/api/getResumeHTML", (req, res) => {
  if (!resumeLayout) {
    return res.status(400).json({ 
      success: false, 
      error: "No resume available" 
    });
  }

  res.json({
    success: true,
    html: resumeLayout.htmlContent,
    data: resumeLayout.data
  });
});

// Error handling
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Resume Builder Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

module.exports = app;