const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/analyze-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded' });
    }

    // 1. Parse PDF
    let resumeText = "";
    try {
      const pdfData = await pdfParse(req.file.buffer);
      resumeText = pdfData.text;
    } catch (pdfErr) {
      console.error("PDF Parsing error:", pdfErr);
      return res.status(400).json({ error: 'The PDF parser function failed to read your file. Make sure it is a valid text-based PDF.' });
    }

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ error: 'Could not extract text from PDF (it might be an image/scanned PDF)' });
    }

    // 2. Setup AI
    if (!process.env.NVIDIA_API_KEY || process.env.NVIDIA_API_KEY.includes('your_')) {
      // Mock fallback if API key is not yet configured by the user
      console.warn("Using mock AI response because NVIDIA_API_KEY is not configured.");
      
      const mockQuestions = [
        {
          id: 1,
          question: "Based on the uploaded resume, what is the most prominent programming language mentioned?",
          options: ["Java", "Python", "JavaScript", "C++"],
          answer: "JavaScript"
        },
        {
          id: 2,
          question: "How do you rate the candidate's reported experience with cloud infrastructure?",
          options: ["Novice", "Intermediate", "Advanced", "Not Mentioned"],
          answer: "Intermediate"
        },
        {
          id: 3,
          question: "Which framework was consistently used throughout their recent projects?",
          options: ["React", "Angular", "Vue", "Svelte"],
          answer: "React"
        }
      ];
      
      return res.json({
        summary: "Extracted basic text, using mock questions.",
        questions: mockQuestions,
        interviewQuestions: [
          "Can you describe a time you had to optimize a slow SQL query in production?",
          "How do you handle disagreements on technical design with a senior engineer?",
          "Explain the difference between monoliths and microservices, and when you'd choose each."
        ]
      });
    }

    // 3. Prompt for assessment generation
    const prompt = `
      You are an expert technical recruiter and assessor. 
      Review the following text extracted from a candidate's resume:
      
      """
      ${resumeText.substring(0, 5000)}
      """
      
      Based entirely on the skills, technologies, and specific experiences mentioned in this resume, generate:
      1. exactly 20 HIGHLY ADVANCED, expert-level multiple-choice questions to deeply test this candidate's proficiency. These should not be basic trivia, but complex scenario-based technical questions.
      2. 25 to 30 EXTREMELY DIFFICULT open-ended technical and behavioral interview questions for verbal practice, focusing on edge cases, architecture, and advanced problem-solving.
      
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
          "7th open-ended verbal question"
        ]
      }
      Do not include any markdown backticks (like \`\`\`json) or extra text outside the JSON. Just the raw JSON string.
    `;

    const fetchResponse = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-70b-instruct",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 4000,
      })
    });

    if (!fetchResponse.ok) {
        const errorText = await fetchResponse.text();
        console.error("NVIDIA API Error:", fetchResponse.status, errorText);
        throw new Error("Failed to communicate with NVIDIA API");
    }

    const aiData = await fetchResponse.json();
    const aiText = aiData.choices[0]?.message?.content || "{}";
    
    // Safely extract the JSON block out of the AI's response text
    let cleanedText = aiText.trim();
    const jsonStart = cleanedText.indexOf('{');
    const jsonEnd = cleanedText.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
    }
    
    let generatedAssessment;
    try {
      generatedAssessment = JSON.parse(cleanedText);
    } catch (parseErr) {
      console.error("AI JSON Parse Error:", cleanedText);
      return res.status(500).json({ error: 'AI failed to generate a valid JSON assessment. The parser function could not read the output.' });
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

    if (!process.env.NVIDIA_API_KEY || process.env.NVIDIA_API_KEY.includes('your_')) {
      return res.json({
        summary: "Mock summary based on manual input.",
        questions: [
          {
            id: 1,
            question: `What is a core concept related to ${jobTitle}?`,
            options: ["Option A", "Option B", "Option C", "Option D"],
            answer: "Option B"
          }
        ],
        interviewQuestions: [
          `Describe a challenging problem you solved as a ${jobTitle}.`,
          "How do you ensure code quality and maintainability within your team?",
          "What is your approach to learning a completely new technical stack?"
        ]
      });
    }

    const prompt = `
      You are an expert technical recruiter and assessor. 
      The candidate has the following profile:
      Job Title/Role: ${jobTitle}
      Key Skills/Ideas: ${skills}
      
      Based entirely on these skills and the role context, generate:
      1. exactly 20 HIGHLY ADVANCED, expert-level multiple-choice questions to deeply test this candidate's proficiency. These should not be basic trivia, but complex scenario-based technical questions.
      2. 25 to 30 EXTREMELY DIFFICULT open-ended technical and behavioral interview questions for verbal practice, focusing on edge cases, architecture, and advanced problem-solving.
      
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
          "7th open-ended verbal question"
        ]
      }
      Do not include any markdown backticks. Just the raw JSON string.
    `;

    const fetchResponse = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-70b-instruct",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 4000,
      })
    });

    if (!fetchResponse.ok) {
        throw new Error("Failed to communicate with NVIDIA API");
    }

    const aiData = await fetchResponse.json();
    const aiText = aiData.choices[0]?.message?.content || "{}";
    
    let cleanedText = aiText.trim();
    const jsonStart = cleanedText.indexOf('{');
    const jsonEnd = cleanedText.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
    }
    
    let generatedAssessment;
    try {
      generatedAssessment = JSON.parse(cleanedText);
    } catch (parseErr) {
      return res.status(500).json({ error: 'AI failed to generate a valid JSON assessment.' });
    }

    res.json(generatedAssessment);

  } catch (err) {
    console.error('AI Route Error:', err);
    res.status(500).json({ error: err.message || 'Something went wrong generating assessment.' });
  }
});

module.exports = router;
