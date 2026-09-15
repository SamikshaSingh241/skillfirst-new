const express = require('express');
const router = express.Router();
const multer = require('multer');
const { PDFParse } = require('pdf-parse');
const { GoogleGenAI } = require('@google/genai');
const Job = require('../models/Job');
const Application = require('../models/Application');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// POST Apply to a Job with Resume PDF
router.post('/apply', upload.single('resume'), async (req, res) => {
  try {
    const { jobId, candidateId, candidateName, candidateEmail } = req.body;

    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Please upload your resume PDF to apply.' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    // 1. Extract text from Candidate's Resume PDF
    let resumeText = '';
    try {
      const parser = new PDFParse({ data: req.file.buffer });
      const parsed = await parser.getText();
      resumeText = (parsed && parsed.text) ? parsed.text.trim() : '';
    } catch (parseErr) {
      console.warn('Resume PDF parse note:', parseErr.message);
    }

    // 2. Build Job Description context (text + extracted JD PDF text)
    const jdDetails = [
      `Job Title: ${job.title}`,
      `Department: ${job.department}`,
      `Employment Type: ${job.type}`,
      job.description ? `Job Overview:\n${job.description}` : '',
      job.jdPdfText ? `Official Job Description Document (JD PDF):\n${job.jdPdfText}` : ''
    ].filter(Boolean).join('\n\n');

    // 3. Prompt Gemini to evaluate Resume + JD alignment and generate tailored questions
    const promptText = `
You are an expert technical interviewer, assessment architect, and hiring manager.

RECRUITER JOB DESCRIPTION & REQUIREMENTS:
"""
${jdDetails}
"""

CANDIDATE'S RESUME:
"""
${resumeText ? resumeText.substring(0, 7000) : 'Evaluate attached resume document.'}
"""

TASK:
1. Deeply analyze the candidate's resume credentials against the recruiter's exact Job Description.
2. Generate exactly 15 MEDIUM-TO-HARD difficulty multiple choice questions (MCQs).
   - Questions must be calibrated directly to the intersection of the Candidate's background and the Job Description.
   - Challenge the candidate on real-world engineering trade-offs, architecture, edge cases, and practical problem solving.
   - NO easy trivia or simple definitions.
   - Each question must have exactly 4 options and 1 clear correct answer.
3. Generate exactly 10 open-ended technical and behavioral interview questions specifically testing the candidate's alignment with this role.

Return STRICT JSON matching this schema only (no markdown wrapping, no extra text):
{
  "summary": "2-3 sentences evaluating the candidate's alignment with this specific Job Description.",
  "questions": [
    {
      "id": 1,
      "question": "Scenario-based technical problem question?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option A"
    }
  ],
  "interviewQuestions": [
    "Role-specific interview question 1",
    "Role-specific interview question 2"
  ]
}
`;

    let contents;
    if (resumeText && resumeText.length > 50) {
      contents = promptText;
    } else {
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
        responseMimeType: 'application/json',
      }
    });

    const aiText = response.text || '{}';
    let cleaned = aiText.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }

    const assessment = JSON.parse(cleaned);

    // 4. Save Application
    const application = new Application({
      jobId: job._id,
      jobTitle: job.title,
      candidateId: candidateId || null,
      candidateName: candidateName || 'Candidate',
      candidateEmail: candidateEmail || 'candidate@example.com',
      resumeFileName: req.file.originalname || 'resume.pdf',
      resumeText: resumeText.substring(0, 3000),
      score: 0,
      assessmentSummary: assessment.summary || 'Assessment generated from Resume + Job Description.',
      questions: assessment.questions || [],
      interviewQuestions: assessment.interviewQuestions || [],
      status: 'In Progress'
    });

    await application.save();

    // Increment applicantsCount on the Job
    await Job.findByIdAndUpdate(job._id, { $inc: { applicantsCount: 1 } });

    res.status(201).json({
      application,
      assessment
    });

  } catch (err) {
    console.error('Job Application Error:', err);
    res.status(500).json({ error: err.message || 'Failed to process application and generate assessment.' });
  }
});

// GET all applications for a specific candidate
router.get('/candidate/:candidateId', async (req, res) => {
  try {
    const applications = await Application.find({ candidateId: req.params.candidateId })
      .sort({ appliedAt: -1 })
      .populate('jobId', 'title department type');
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all applications for a specific job (Recruiter view)
router.get('/job/:jobId', async (req, res) => {
  try {
    const applications = await Application.find({ jobId: req.params.jobId }).sort({ appliedAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all applications across all jobs (Recruiter overview)
router.get('/', async (req, res) => {
  try {
    const applications = await Application.find()
      .sort({ appliedAt: -1 })
      .populate('jobId', 'title department type');
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update status: In Progress, Shortlisted, Rejected
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['In Progress', 'Shortlisted', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be In Progress, Shortlisted, or Rejected' });
    }

    const updated = await Application.findByIdAndUpdate(
      req.params.id,
      { $set: { status, updatedAt: new Date() } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update quiz score on an application
router.put('/:id/score', async (req, res) => {
  try {
    const { score } = req.body;
    const updated = await Application.findByIdAndUpdate(
      req.params.id,
      { $set: { score: Number(score) || 0, updatedAt: new Date() } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
