const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  department: { type: String, required: true },
  type: { type: String, default: 'Full-time' }, // Full-time, Part-time, Contract, Remote
  description: { type: String, default: '' },
  jdPdfText: { type: String, default: '' },      // Extracted text from uploaded JD PDF
  jdFileName: { type: String, default: '' },     // Original filename of JD PDF
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recruiterName: { type: String, default: 'Hiring Team' },
  applicantsCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Job', jobSchema);
