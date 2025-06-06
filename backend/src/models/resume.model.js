import mongoose from 'mongoose'

const ResumeSchema = new mongoose.Schema({
  username: String,
  linkedinUrl: String,
  repositories: Array,
  skillAnalysis: Object,
  resumeData: Object,
  overallScore: Number,
  createdAt: { type: Date, default: Date.now }
});

export const Resume = mongoose.model('Resume', ResumeSchema);