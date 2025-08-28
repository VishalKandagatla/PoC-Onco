const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  abhaId: {
    type: String,
    required: true,
    unique: true
  },
  demographics: {
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    gender: String,
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String
    },
    contact: {
      phone: String,
      email: String
    }
  },
  cancerType: {
    primary: String,
    stage: String,
    histology: String,
    grade: String,
    diagnosisDate: Date
  },
  medicalHistory: [{
    date: Date,
    type: String,
    description: String,
    provider: String,
    sourceSystem: String
  }],
  imaging: [{
    studyId: String,
    modality: String,
    studyDate: Date,
    description: String,
    findings: String,
    sourceSystem: String,
    dicomUrl: String
  }],
  labResults: [{
    testId: String,
    testName: String,
    testDate: Date,
    value: String,
    unit: String,
    referenceRange: String,
    interpretation: String,
    sourceSystem: String
  }],
  pathologyReports: [{
    reportId: String,
    specimenType: String,
    collectionDate: Date,
    reportDate: Date,
    findings: String,
    diagnosis: String,
    sourceSystem: String
  }],
  genomics: {
    mutationProfile: [{
      gene: String,
      variant: String,
      vaf: Number,
      interpretation: String
    }],
    tmb: Number,
    msi: String,
    reportDate: Date
  },
  treatments: [{
    treatmentId: String,
    type: String,
    regimen: String,
    startDate: Date,
    endDate: Date,
    response: String,
    adverseEvents: [String],
    sourceSystem: String
  }],
  clinicalTrials: [{
    trialId: String,
    trialName: String,
    enrollmentDate: Date,
    status: String,
    arm: String
  }],
  tumorBoardReports: [{
    reportId: String,
    generatedDate: Date,
    recommendations: [String],
    participants: [String],
    citations: [{
      source: String,
      title: String,
      authors: [String],
      year: Number,
      doi: String,
      relevance: String
    }]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

patientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Patient', patientSchema);