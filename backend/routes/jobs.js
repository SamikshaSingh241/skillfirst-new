const express = require('express');
const router = express.Router();
const multer = require('multer');
const { PDFParse } = require('pdf-parse');
const Job = require('../models/Job');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// GET all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new job (Recruiter posts job with optional JD PDF)
router.post('/', upload.single('jdFile'), async (req, res) => {
  try {
    const { title, department, type, description, postedBy, recruiterName } = req.body;

    if (!title || !department) {
      return res.status(400).json({ error: 'Job title and department are required.' });
    }

    let jdPdfText = '';
    let jdFileName = '';

    if (req.file) {
      jdFileName = req.file.originalname;
      try {
        const parser = new PDFParse({ data: req.file.buffer });
        const parsed = await parser.getText();
        jdPdfText = (parsed && parsed.text) ? parsed.text.trim() : '';
      } catch (parseErr) {
        console.warn('JD PDF text extraction note:', parseErr.message);
      }
    }

    const newJob = new Job({
      title: title.trim(),
      department: department.trim(),
      type: type || 'Full-time',
      description: (description || '').trim(),
      jdPdfText,
      jdFileName,
      postedBy: postedBy || null,
      recruiterName: (recruiterName || 'Hiring Team').trim(),
      applicantsCount: 0
    });

    await newJob.save();
    res.status(201).json(newJob);
  } catch (err) {
    console.error('Create Job Error:', err);
    res.status(500).json({ error: err.message || 'Failed to create job posting.' });
  }
});

// DELETE job
router.delete('/:id', async (req, res) => {
  try {
    const deletedJob = await Job.findByIdAndDelete(req.params.id);
    if (!deletedJob) return res.status(404).json({ error: 'Job not found' });
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
