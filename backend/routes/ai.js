const express = require('express');
const router = express.Router();
const multer = require('multer');
const { GoogleGenAI } = require('@google/genai');

const upload = multer({ storage: multer.memoryStorage() });

// Initialize Gemini client (ensure GEMINI_API_KEY is in .env)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post('/analyze-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded' });
    }

    const { targetRole } = req.body;
    if (!targetRole) {
      return res.status(400).json({ error: 'Please provide the target role you are preparing for.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is missing from environment.' });
    }

    // Prompt for assessment generation based on both Resume and Target Role
    const prompt = `
      You are an expert technical recruiter and strict assessor. 
      Attached is the candidate's resume (PDF). 
      The candidate is applying and preparing for the role of: "${targetRole}".
      
      First, scan and analyze their resume. Then, based STRICTLY on their resume AND the target role of "${targetRole}", generate:
      
      1. Exactly 10 HIGHLY ADVANCED, expert-level multiple-choice questions to deeply test this candidate's proficiency. 
         These must NOT be basic trivia. They must be medium-to-hard, scenario-based technical questions. It should be considerably hard even for freshers.
      2. 10 EXTREMELY DIFFICULT open-ended technical and behavioral interview questions for verbal practice, focusing on edge cases, architecture, and advanced problem-solving related to the role and their resume.
      
      IMPORTANT: Return the output strictly as a JSON object with this shape:
      {
        "summary": "1 sentence summarizing their core strength based on the resume",
        "questions": [
          {
            "id": 1,
            "question": "Question text here?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "answer": "Option B"
          }
        ],
        "interviewQuestions": [
          "1st open-ended verbal question",
          "2nd open-ended verbal question",
          "...",
          "10th open-ended verbal question"
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: req.file.buffer.toString('base64'),
                mimeType: req.file.mimetype || 'application/pdf'
              }
            },
            { text: prompt }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    const aiText = response.text;
    
    let generatedAssessment;
    try {
      generatedAssessment = JSON.parse(aiText);
    } catch (parseErr) {
      console.error("AI JSON Parse Error:", aiText);
      return res.status(500).json({ error: 'AI failed to generate a valid JSON assessment.' });
    }

    res.json(generatedAssessment);

  } catch (err) {
    console.error('AI Route Error:', err);
    res.status(500).json({ error: err.message || 'Something went wrong processing the resume.' });
  }
});

router.post('/generate-from-skills', async (req, res) => {
  try {
    const { jobTitle, skills } = req.body;
    
    if (!jobTitle || !skills) {
      return res.status(400).json({ error: 'Job title and skills are required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is missing from environment.' });
    }

    const prompt = `
      You are an expert technical recruiter and strict assessor. 
      The candidate has the following profile:
      Job Title/Role: ${jobTitle}
      Key Skills/Experience: ${skills}
      
      Based entirely on these skills and the role context, generate:
      1. exactly 10 HIGHLY ADVANCED, expert-level multiple-choice questions to deeply test this candidate's proficiency. These should not be basic trivia. They must be medium-to-hard, scenario-based technical questions. It should be considerably hard even for freshers.
      2. 10 EXTREMELY DIFFICULT open-ended technical and behavioral interview questions for verbal practice, focusing on edge cases, architecture, and advanced problem-solving.
      
      IMPORTANT: Return the output strictly as a JSON object with this shape:
      {
        "summary": "1 sentence summarizing their core strength",
        "questions": [
          {
            "id": 1,
            "question": "Question text here?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "answer": "Option B"
          }
        ],
        "interviewQuestions": [
          "1st open-ended verbal question",
          "2nd open-ended verbal question",
          "...",
          "10th open-ended verbal question"
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const aiText = response.text;
    
    let generatedAssessment;
    try {
      generatedAssessment = JSON.parse(aiText);
    } catch (parseErr) {
      return res.status(500).json({ error: 'AI failed to generate a valid JSON assessment.' });
    }

    res.json(generatedAssessment);

  } catch (err) {
    console.error('AI Route Error:', err);
    res.status(500).json({ error: err.message || 'Something went wrong generating assessment.' });
  }
});

// New Endpoint for Interview Speech Evaluation
router.post('/evaluate-answer', async (req, res) => {
  try {
    const { question, answer } = req.body;
    
    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and answer are required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is missing from environment.' });
    }

    const prompt = `
      You are an expert HR Manager and Technical Interviewer.
      The candidate was asked the following interview question:
      "${question}"
      
      The candidate provided this spoken answer (transcribed):
      "${answer}"
      
      Please evaluate their answer in an HR interview style. 
      Analyze their speech/transcript for:
      - Clarity and conciseness
      - Technical accuracy (if applicable)
      - STAR method usage (Situation, Task, Action, Result)
      - Confidence (based on phrasing)
      
      Return a STRICT JSON response with this shape:
      {
        "score": 85, // integer out of 100
        "feedback": "A short, constructive paragraph of feedback",
        "strengths": ["Strength 1", "Strength 2"],
        "improvements": ["Area to improve 1", "Area to improve 2"]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const aiText = response.text;
    
    let evaluation;
    try {
      evaluation = JSON.parse(aiText);
    } catch (parseErr) {
      return res.status(500).json({ error: 'AI failed to generate a valid JSON evaluation.' });
    }

    res.json(evaluation);

  } catch (err) {
    console.error('AI Route Error:', err);
    res.status(500).json({ error: err.message || 'Something went wrong evaluating answer.' });
  }
});

module.exports = router;
