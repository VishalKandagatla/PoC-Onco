require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const patientRoutes = require('./routes/patientRoutes');
const reportRoutes = require('./routes/reportRoutes');
const dataSourceRoutes = require('./routes/dataSourceRoutes');
const longitudinalRoutes = require('./routes/longitudinalRoutes');
const searchRoutes = require('./routes/searchRoutes');
const InteroperabilityService = require('./services/interoperabilityService');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle root route BEFORE static files to override index.html
app.get('/', (req, res) => {
  // Prevent caching to ensure fresh loads
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(__dirname, '../public/clinician-dashboard.html'));
});

app.use(express.static('public'));
app.use('/data', express.static(path.join(__dirname, 'data')));

app.use('/api/patients', patientRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/datasources', dataSourceRoutes);
app.use('/api/longitudinal', longitudinalRoutes);
app.use('/api', searchRoutes);

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working', timestamp: new Date() });
});

app.get('/api/health', async (req, res) => {
  try {
    const interopService = new InteroperabilityService();
    const health = await interopService.getSystemHealth();
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint for longitudinal history without MongoDB
app.get('/api/test/longitudinal/:patientId', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Load processed patient data
    const processedDataPath = path.join(__dirname, 'data', 'processed_patients.json');
    const processedData = JSON.parse(fs.readFileSync(processedDataPath, 'utf8'));
    
    const patientId = req.params.patientId;
    const patient = processedData.find(p => p.abhaId === patientId);
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    // Create simplified longitudinal timeline
    const timeline = [];
    
    // Add basic patient information
    timeline.push({
      date: '2024-01-01',
      type: 'diagnosis',
      title: `${patient.cancerType.primary} Diagnosis`,
      description: `Patient diagnosed with ${patient.cancerType.primary}, Stage ${patient.cancerType.stage}`,
      category: 'diagnosis'
    });
    
    // Add imaging events
    if (patient.imaging) {
      patient.imaging.forEach((img, index) => {
        timeline.push({
          date: img.date,
          type: 'imaging',
          title: `${img.modality} Study`,
          description: `${img.modality} imaging of ${img.bodySite}`,
          category: 'imaging',
          details: img
        });
      });
    }
    
    // Add lab results
    if (patient.labResults) {
      patient.labResults.forEach((lab, index) => {
        const baseDate = new Date('2024-01-01');
        if (lab.timestamp && lab.timestamp.includes('day_')) {
          const dayNumber = parseInt(lab.timestamp.replace('day_', ''));
          baseDate.setDate(baseDate.getDate() + dayNumber);
        }
        
        if (lab.observations) {
          Object.entries(lab.observations).forEach(([testName, value]) => {
            timeline.push({
              date: baseDate.toISOString().split('T')[0],
              type: 'lab_result',
              title: `${testName} Result`,
              description: `${testName}: ${value}`,
              category: 'laboratory',
              details: { testName, value, timestamp: lab.timestamp }
            });
          });
        }
      });
    }
    
    // Add treatments
    if (patient.treatments) {
      patient.treatments.forEach((treatment, index) => {
        timeline.push({
          date: treatment.startDate || '2024-02-01',
          type: 'treatment_start',
          title: `${treatment.treatmentType} Started`,
          description: treatment.description || `${treatment.treatmentType} treatment initiated`,
          category: 'treatment',
          details: treatment
        });
      });
    }
    
    // Sort timeline by date
    timeline.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const longitudinalHistory = {
      patientId: patient.abhaId,
      patientName: `${patient.demographics.firstName} ${patient.demographics.lastName}`,
      diagnosis: patient.cancerType.primary,
      stage: patient.cancerType.stage,
      totalEvents: timeline.length,
      timespan: {
        earliest: timeline[0]?.date,
        latest: timeline[timeline.length - 1]?.date
      },
      timeline: timeline,
      summary: {
        demographics: patient.demographics,
        cancer: patient.cancerType,
        cancerType: patient.cancerType, // Keep for backward compatibility
        clinicalInfo: patient.clinicalInfo,
        therapy: patient.therapy,
        hospital: patient.hospital,
        pathology: patient.pathology,
        genomics: patient.genomics,
        treatmentCount: patient.treatments?.length || 0,
        imagingStudies: patient.imaging?.length || 0,
        labResults: patient.labResults?.length || 0
      },
      labResults: patient.labResults,
      imaging: patient.imaging,
      fullData: patient
    };
    
    res.json({
      success: true,
      data: longitudinalHistory,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating longitudinal history:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get full patient data by ID
app.get('/api/test/patient/:patientId/full', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const processedDataPath = path.join(__dirname, 'data', 'processed_patients.json');
    const processedData = JSON.parse(fs.readFileSync(processedDataPath, 'utf8'));
    
    const patientId = req.params.patientId;
    const patient = processedData.find(p => p.abhaId === patientId);
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    res.json({
      success: true,
      data: patient,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting full patient data:', error);
    res.status(500).json({ error: error.message });
  }
});

// List all available patients
app.get('/api/test/patients', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const processedDataPath = path.join(__dirname, 'data', 'processed_patients.json');
    const processedData = JSON.parse(fs.readFileSync(processedDataPath, 'utf8'));
    
    const patientsList = processedData.map(patient => ({
      abhaId: patient.abhaId,
      name: `${patient.demographics.firstName} ${patient.demographics.lastName}`,
      diagnosis: patient.cancerType.primary,
      stage: patient.cancerType.stage,
      age: patient.demographics.age,
      gender: patient.demographics.gender,
      state: patient.demographics.state
    }));
    
    res.json({
      success: true,
      count: patientsList.length,
      patients: patientsList
    });
  } catch (error) {
    console.error('Error listing patients:', error);
    res.status(500).json({ error: error.message });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

async function startServer() {
  try {
    // Initialize file-based data service instead of MongoDB
    console.log('Using file-based data service (MongoDB disabled)');
    const interopService = new InteroperabilityService();
    await interopService.initializeDataSources();
    console.log('File-based data sources initialized successfully');
  } catch (error) {
    console.error('Error initializing data sources:', error.message);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`Open your browser and navigate to: http://localhost:${PORT}`);
    console.log(`Using file-based data service - no MongoDB required`);
  });
}

startServer();

module.exports = app;