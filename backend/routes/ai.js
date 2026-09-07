const express = require('express');
const router = express.Router();
const multer = require('multer');
const { PDFParse } = require('pdf-parse');
const { GoogleGenAI } = require('@google/genai');

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Initialize Gemini client with API key from environment
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post('/analyze-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded. Please select a PDF file.' });
    }

    const targetRole = (req.body.targetRole && req.body.targetRole.trim()) 
      || (req.body.jobTitle && req.body.jobTitle.trim()) 
      || "Software Developer";

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in the backend environment.' });
    }

    // 1. Extract text from PDF using PDFParse
    let resumeText = "";
    try {
      const parser = new PDFParse({ data: req.file.buffer });
      const parsed = await parser.getText();
      resumeText = (parsed && parsed.text) ? parsed.text.trim() : "";
    } catch (parseErr) {
      console.warn("PDFParse text extraction note:", parseErr.message);
    }

    // 2. Build Gemini contents: text-based if extracted, or native PDF inlineData if extraction returned minimal text
    const promptText = `
You are an elite technical interviewer, hiring manager, and assessment designer.
Target Role for this assessment: "${targetRole}"

Candidate Resume Information:
"""
${resumeText ? resumeText.substring(0, 8000) : "Review the attached PDF document thoroughly."}
"""

Instructions:
1. Deeply analyze the candidate's experience, technologies, and depth from their resume, aligned with the Target Role: "${targetRole}".
2. Generate exactly 15 MEDIUM-TO-HARD difficulty level multiple-choice questions (MCQs).
   - Difficulty standard: Considerably challenging even for freshers/juniors, requiring conceptual mastery, debugging intuition, system architecture understanding, and practical scenario-solving.
   - Absolutely NO easy questions, trivia, or simple definition memorization.
   - Every question must have exactly 4 plausible, high-quality options, and 1 clear correct answer.
3. Generate 10 challenging technical & behavioral interview questions focusing on real-world architecture, trade-offs, and edge cases for verbal practice.

You MUST respond strictly with a valid JSON object matching this schema without any markdown wrapping or extra text:
{
  "summary": "1-2 sentences summarizing the candidate's core strengths and technical readiness for ${targetRole}",
  "questions": [
    {
      "id": 1,
      "question": "Clear scenario or technical problem statement here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option A"
    }
  ],
  "interviewQuestions": [
    "Challenging scenario question 1",
    "Challenging scenario question 2"
  ]
}
`;

    let contents;
    if (resumeText && resumeText.length > 50) {
      contents = promptText;
    } else {
      // Fallback to inline PDF sending
      contents = [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: req.file.buffer.toString('base64'),
                mimeType: req.file.mimetype || 'application/pdf'
              }
            },
            { text: promptText }
          ]
        }
      ];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        responseMimeType: "application/json",
      }
    });

    const aiText = response.text || "{}";
    let cleaned = aiText.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```/, "").replace(/```$/, "").trim();
    }

    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }

    const assessment = JSON.parse(cleaned);
    res.json(assessment);

  } catch (err) {
    console.error('Analyze Resume Error:', err);
    res.status(500).json({ error: err.message || 'Failed to process resume and generate quiz.' });
  }
});

router.post('/generate-from-skills', async (req, res) => {
  try {
    const jobTitle = req.body.jobTitle?.trim() || "Software Developer";
    const skills = req.body.skills?.trim() || "";
    
    if (!skills) {
      return res.status(400).json({ error: 'Skills description is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in the backend environment.' });
    }

    const promptText = `
You are an elite technical interviewer and assessment designer.
Target Role: "${jobTitle}"
Key Skills & Experience: "${skills}"

Generate a strictly MEDIUM-TO-HARD difficulty assessment:
1. Exactly 15 challenging scenario-based multiple-choice questions (MCQs) testing deep knowledge, edge-cases, and debugging in ${jobTitle} / ${skills}. Considerably hard even for freshers. No easy trivia.
2. 10 deep open-ended technical & behavioral interview questions for practice.

Return STRICT JSON only:
{
  "summary": "Concise profile assessment for ${jobTitle}",
  "questions": [
    {
      "id": 1,
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option A"
    }
  ],
  "interviewQuestions": [
    "Question 1",
    "Question 2"
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText,
      config: {
        responseMimeType: "application/json",
      }
    });

    const aiText = response.text || "{}";
    let cleaned = aiText.trim();
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }

    const assessment = JSON.parse(cleaned);
    res.json(assessment);

  } catch (err) {
    console.error('Generate from skills Error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate assessment.' });
  }
});

router.post('/evaluate-answer', async (req, res) => {
  try {
    const { question, answer } = req.body;
    
    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and answer are required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is missing from environment.' });
    }

    const promptText = `
You are an expert HR Manager and Senior Technical Interviewer.
Interview Question: "${question}"
Candidate's Spoken Answer: "${answer}"

Evaluate the candidate's answer thoroughly for:
1. Technical accuracy & depth
2. Structure (STAR format - Situation, Task, Action, Result)
3. Communication clarity, tone, and confidence
4. Conciseness without rambling

Return STRICT JSON only:
{
  "score": 82,
  "feedback": "Constructive 2-3 sentence overall evaluation",
  "strengths": ["Strength 1", "Strength 2"],
  "improvements": ["Improvement point 1", "Improvement point 2"]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText,
      config: {
        responseMimeType: "application/json",
      }
    });

    const aiText = response.text || "{}";
    let cleaned = aiText.trim();
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }

    const evaluation = JSON.parse(cleaned);
    res.json(evaluation);

  } catch (err) {
    console.error('Evaluate Answer Error:', err);
    res.status(500).json({ error: err.message || 'Failed to evaluate answer.' });
  }
});

module.exports = router;
