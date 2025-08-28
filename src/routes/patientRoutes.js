const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const InteroperabilityService = require('../services/interoperabilityService');
const LongitudinalProfileService = require('../services/longitudinalProfileService');
const FileBasedDataService = require('../services/fileBasedDataService');

const interopService = new InteroperabilityService();
const profileService = new LongitudinalProfileService();
const fileDataService = new FileBasedDataService();

router.get('/', async (req, res) => {
  try {
    const patients = await fileDataService.getAllPatients();
    // Transform data to match expected format
    const transformedPatients = patients.map(patient => ({
      abhaId: patient.abhaId,
      demographics: patient.demographics,
      cancerType: patient.cancerType,
      createdAt: new Date() // Default date since file-based doesn't track creation
    }));
    res.json(transformedPatients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:abhaId', async (req, res) => {
  try {
    const { format } = req.query;
    const patientData = await interopService.getPatientData(req.params.abhaId, { format });
    
    if (!patientData.data) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    res.json(patientData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:abhaId/sync', async (req, res) => {
  try {
    const patientData = await interopService.getPatientData(req.params.abhaId, { forceSync: true });
    res.json({
      message: 'Patient data synchronized successfully',
      data: patientData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:abhaId/timeline', async (req, res) => {
  try {
    const patient = await fileDataService.getPatientByAbhaId(req.params.abhaId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const timeline = profileService.generateTimeline(patient);
    const summary = profileService.generateSummary(patient);

    res.json({
      timeline,
      summary
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:abhaId/profile/export', async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    const patient = await fileDataService.getPatientByAbhaId(req.params.abhaId);
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const profile = profileService.exportProfile(patient, format);
    
    if (format === 'summary') {
      res.type('text/plain');
    }
    
    res.send(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    // In file-based system, we don't support creating new patients via API
    // Patients are loaded from data files
    res.status(405).json({ error: 'Creating new patients not supported in file-based mode. Patients are loaded from data files.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:abhaId', async (req, res) => {
  try {
    // In file-based system, we don't support updating patients via API
    // Data comes from static files
    res.status(405).json({ error: 'Updating patients not supported in file-based mode. Data comes from static files.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;