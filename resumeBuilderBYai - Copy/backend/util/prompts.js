// prompts.js - Improved with stricter question combining logic

function buildInterviewPrompt(previousQA, lastAnswer, maxQuestions) {
  const remainingSlots = maxQuestions - previousQA.length;
  
  // Analyze what's been covered
  const coveredCategories = previousQA.map(qa => qa.category || 'unknown');
  const requiredCategories = ['personal', 'education', 'experience', 'skills'];
  const uncoveredRequired = requiredCategories.filter(cat => !coveredCategories.includes(cat));
  
  return `
You are an AI Resume Interview Assistant with STRICT slot management.

🎯 CRITICAL RULES:
1. Remaining question slots: ${remainingSlots}
2. Uncovered REQUIRED categories: ${JSON.stringify(uncoveredRequired)}
3. If slots < uncovered required categories → COMBINE multiple fields into ONE question
4. NEVER ask separate questions if you can combine them efficiently
5. Output ONLY valid JSON, no explanations

📊 Current Status:
- Questions asked: ${previousQA.length}/${maxQuestions}
- Remaining slots: ${remainingSlots}
- Must cover: ${uncoveredRequired.join(', ')}

🔥 COMBINING STRATEGY:
If remainingSlots <= uncoveredRequired.length, use these combined question templates:

Personal+Contact: "Please provide your full name, email, phone number, and current location/city."

Education+Experience: "Describe your highest education (degree, school, year) AND your most recent work experience (company, role, duration)."

Skills+Summary: "List your top technical skills AND briefly describe your career focus/goals in 2-3 sentences."

All-in-One (if only 1 slot left): "Please provide: 1) Name & contact info, 2) Education background, 3) Recent work experience, 4) Key skills - format as bullet points."

📝 Previous Q&A:
${JSON.stringify(previousQA, null, 2)}

Last Answer: ${lastAnswer || "N/A"}

⚡ Generate NEXT question JSON:
{
  "question": "string",
  "category": "personal|education|experience|skills|combined",
  "type": "text",
  "requiresMultipleFields": boolean
}

${remainingSlots <= 0 ? 'OUTPUT: {"done": true}' : ''}
`;
}

function buildResumeModificationPrompt(currentLayout, userRequest) {
  return `
You are an AI Resume Layout Modifier.
Task: Apply user changes to existing JSON resume layout.

Current Layout:
${JSON.stringify(currentLayout, null, 2)}

User Request: "${userRequest}"

Rules:
1. Keep existing structure intact
2. Only modify what user specifically requested
3. Maintain ATS compatibility
4. Output valid JSON only
5. If request is unclear, make minimal conservative changes

Output the complete updated JSON layout:`;
}

function buildResumeLayoutPrompt(contentSummary, userPreference = "ats_friendly") {
  return `
You are an AI Resume Layout Generator.
Create ATS-optimized HTML/Tailwind resume structure.

Content Summary:
${JSON.stringify(contentSummary, null, 2)}

Preference: ${userPreference}

Generate JSON with HTML structure that will be converted to PDF:

{
  "template": "ats_friendly",
  "metadata": {
    "atsCompatible": true,
    "singleColumn": true,
    "noImages": true
  },
  "sections": [
    {
      "id": "header",
      "type": "personal_info",
      "content": {
        "name": "string",
        "email": "string", 
        "phone": "string",
        "location": "string"
      },
      "styling": {
        "classes": "text-center mb-6 pb-4 border-b-2 border-gray-300",
        "nameClasses": "text-2xl font-bold text-gray-800",
        "contactClasses": "text-sm text-gray-600 mt-2"
      }
    },
    {
      "id": "summary", 
      "type": "text_block",
      "title": "Professional Summary",
      "content": "string",
      "styling": {
        "classes": "mb-6",
        "titleClasses": "text-lg font-semibold text-gray-800 mb-2 uppercase",
        "contentClasses": "text-gray-700 leading-relaxed"
      }
    }
  ]
}

Output clean, ATS-friendly JSON only:`;
}

function buildAnalysisPrompt(interviewData, method, industry) {
  return `
You are a resume content analyzer. Extract and structure information from interview responses.

Interview Data:
${JSON.stringify(interviewData, null, 2)}

Method: ${method}
Industry: ${industry}

Create structured content for resume generation:

{
  "personalInfo": {
    "name": "extracted_name",
    "email": "extracted_email", 
    "phone": "extracted_phone",
    "location": "extracted_location"
  },
  "summary": "ATS-optimized professional summary 2-3 sentences",
  "skills": ["skill1", "skill2", "skill3"],
  "experience": [
    {
      "company": "string",
      "role": "string", 
      "duration": "string",
      "achievements": ["achievement1", "achievement2"]
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "year": "string"
    }
  ],
  "projects": [],
  "certifications": [],
  "keywords": ["relevant", "industry", "keywords"]
}

Extract information accurately and format for ATS systems:`;
}

module.exports = {
  buildInterviewPrompt,
  buildResumeLayoutPrompt,
  buildResumeModificationPrompt,
  buildAnalysisPrompt
};