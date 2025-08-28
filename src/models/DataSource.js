const mongoose = require('mongoose');

const dataSourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['EMR', 'PACS', 'LIS', 'HIMS', 'PATHOLOGY', 'GENOMICS', 'BILLING', 'TELEMEDICINE'],
    required: true
  },
  hospital: {
    name: String,
    location: String,
    tier: String
  },
  connectionDetails: {
    protocol: String,
    endpoint: String,
    authentication: {
      type: String,
      credentials: Object
    }
  },
  dataFormat: {
    type: String,
    enum: ['FHIR', 'HL7', 'DICOM', 'JSON', 'XML', 'CSV']
  },
  lastSync: Date,
  syncStatus: {
    type: String,
    enum: ['active', 'inactive', 'error'],
    default: 'inactive'
  },
  mappingRules: [{
    sourceField: String,
    targetField: String,
    transformation: String
  }],
  metadata: {
    version: String,
    vendor: String,
    compliance: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DataSource', dataSourceSchema);