const mongoose = require('mongoose');

const tumorBoardReportSchema = new mongoose.Schema({
  reportId: {
    type: String,
    required: true,
    unique: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  generatedDate: {
    type: Date,
    default: Date.now
  },
  reportType: {
    type: String,
    enum: ['initial', 'follow-up', 'progression', 'response'],
    default: 'initial'
  },
  summary: {
    clinicalPresentation: String,
    diagnosticFindings: String,
    currentStatus: String,
    treatmentHistory: String
  },
  recommendations: [{
    priority: {
      type: String,
      enum: ['high', 'medium', 'low']
    },
    category: {
      type: String,
      enum: ['treatment', 'diagnostic', 'supportive', 'clinical_trial']
    },
    description: String,
    rationale: String,
    evidenceLevel: String,
    citations: [{
      source: String,
      title: String,
      authors: [String],
      journal: String,
      year: Number,
      doi: String,
      pmid: String,
      relevanceScore: Number,
      excerpt: String
    }]
  }],
  molecularProfile: {
    summary: String,
    actionableAlterations: [{
      gene: String,
      alteration: String,
      therapyImplications: String,
      clinicalTrials: [String]
    }]
  },
  imagingFindings: {
    summary: String,
    keyFindings: [String],
    recistAssessment: String
  },
  pathologyReview: {
    diagnosis: String,
    immunohistochemistry: Object,
    molecularMarkers: Object
  },
  clinicalTrialMatches: [{
    trialId: String,
    title: String,
    phase: String,
    eligibilityCriteria: [String],
    matchScore: Number,
    location: String,
    contactInfo: Object
  }],
  participants: [{
    name: String,
    role: String,
    specialty: String,
    institution: String
  }],
  discussionNotes: String,
  nextSteps: [{
    action: String,
    timeline: String,
    responsible: String
  }],
  aiGeneratedInsights: {
    confidenceScore: Number,
    modelVersion: String,
    generationTimestamp: Date,
    contextSources: [String]
  },
  approvalStatus: {
    type: String,
    enum: ['draft', 'pending_review', 'approved', 'revised'],
    default: 'draft'
  },
  approvedBy: {
    name: String,
    designation: String,
    timestamp: Date
  },
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    version: Number,
    generatedDate: Date,
    changes: String
  }]
});

tumorBoardReportSchema.index({ patientId: 1, generatedDate: -1 });
tumorBoardReportSchema.index({ reportId: 1 });

module.exports = mongoose.model('TumorBoardReport', tumorBoardReportSchema);