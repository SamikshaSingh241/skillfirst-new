const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  jobTitle: { type: String, required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  candidateName: { type: String, required: true },
  candidateEmail: { type: String, required: true },
  resumeFileName: { type: String, default: 'resume.pdf' },
  resumeText: { type: String, default: '' },
  score: { type: Number, default: 0 },
  assessmentSummary: { type: String, default: '' },
  questions: { type: Array, default: [] },
  interviewQuestions: { type: Array, default: [] },
  interviewResponses: { type: Array, default: [] },
  status: {
    type: String,
    enum: ['In Progress', 'Shortlisted', 'Rejected'],
    default: 'In Progress'
  },
  appliedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', applicationSchema);
