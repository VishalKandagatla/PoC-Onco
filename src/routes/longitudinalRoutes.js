const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const LongitudinalHistoryService = require('../services/longitudinalHistoryService');

const longitudinalService = new LongitudinalHistoryService();

// Get comprehensive longitudinal history for a patient
router.get('/patient/:abhaId/comprehensive', async (req, res) => {
  try {
    const patient = await Patient.findOne({ abhaId: req.params.abhaId });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const comprehensiveHistory = longitudinalService.generateComprehensiveLongitudinalHistory(patient);
    
    res.json({
      success: true,
      data: comprehensiveHistory,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating comprehensive history:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get longitudinal insights for a patient
router.get('/patient/:abhaId/insights', async (req, res) => {
  try {
    const patient = await Patient.findOne({ abhaId: req.params.abhaId });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const events = longitudinalService.extractAllEvents(patient);
    const sortedEvents = longitudinalService.sortEventsByDate(events);
    const enrichedEvents = longitudinalService.enrichEventsWithContext(sortedEvents);
    const insights = longitudinalService.generateLongitudinalInsights(enrichedEvents, patient);
    
    res.json({
      success: true,
      data: insights,
      eventCount: sortedEvents.length,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get treatment journey analysis
router.get('/patient/:abhaId/treatment-journey', async (req, res) => {
  try {
    const patient = await Patient.findOne({ abhaId: req.params.abhaId });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const events = longitudinalService.extractAllEvents(patient);
    const sortedEvents = longitudinalService.sortEventsByDate(events);
    const enrichedEvents = longitudinalService.enrichEventsWithContext(sortedEvents);
    const treatmentJourney = longitudinalService.mapTreatmentJourney(enrichedEvents);
    
    res.json({
      success: true,
      data: treatmentJourney,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error analyzing treatment journey:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get disease progression analysis
router.get('/patient/:abhaId/disease-progression', async (req, res) => {
  try {
    const patient = await Patient.findOne({ abhaId: req.params.abhaId });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const events = longitudinalService.extractAllEvents(patient);
    const sortedEvents = longitudinalService.sortEventsByDate(events);
    const enrichedEvents = longitudinalService.enrichEventsWithContext(sortedEvents);
    const diseaseProgression = longitudinalService.analyzeDiseaseProgression(enrichedEvents);
    
    res.json({
      success: true,
      data: diseaseProgression,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error analyzing disease progression:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get key milestones for a patient
router.get('/patient/:abhaId/milestones', async (req, res) => {
  try {
    const patient = await Patient.findOne({ abhaId: req.params.abhaId });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const events = longitudinalService.extractAllEvents(patient);
    const sortedEvents = longitudinalService.sortEventsByDate(events);
    const enrichedEvents = longitudinalService.enrichEventsWithContext(sortedEvents);
    const milestones = longitudinalService.identifyKeyMilestones(enrichedEvents);
    
    res.json({
      success: true,
      data: milestones,
      count: milestones.length,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error identifying milestones:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export longitudinal history in different formats
router.get('/patient/:abhaId/export', async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    const patient = await Patient.findOne({ abhaId: req.params.abhaId });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const comprehensiveHistory = longitudinalService.generateComprehensiveLongitudinalHistory(patient);
    const exportedData = longitudinalService.exportLongitudinalHistory(comprehensiveHistory, format);
    
    // Set appropriate content type
    switch (format) {
      case 'csv':
        res.type('text/csv');
        res.attachment(`longitudinal-history-${req.params.abhaId}.csv`);
        break;
      case 'timeline':
        res.type('text/html');
        res.attachment(`timeline-${req.params.abhaId}.html`);
        break;
      default:
        res.type('application/json');
        if (format === 'download') {
          res.attachment(`longitudinal-history-${req.params.abhaId}.json`);
        }
    }
    
    res.send(exportedData);
  } catch (error) {
    console.error('Error exporting history:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get care coordination analysis
router.get('/patient/:abhaId/care-coordination', async (req, res) => {
  try {
    const patient = await Patient.findOne({ abhaId: req.params.abhaId });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const events = longitudinalService.extractAllEvents(patient);
    const sortedEvents = longitudinalService.sortEventsByDate(events);
    const careCoordination = longitudinalService.analyzeCareCoordination(sortedEvents);
    
    res.json({
      success: true,
      data: careCoordination,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error analyzing care coordination:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get data quality assessment
router.get('/patient/:abhaId/data-quality', async (req, res) => {
  try {
    const patient = await Patient.findOne({ abhaId: req.params.abhaId });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const events = longitudinalService.extractAllEvents(patient);
    const sortedEvents = longitudinalService.sortEventsByDate(events);
    const dataQuality = longitudinalService.assessDataQuality(sortedEvents, patient);
    
    res.json({
      success: true,
      data: dataQuality,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error assessing data quality:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get clinical decision points
router.get('/patient/:abhaId/decision-points', async (req, res) => {
  try {
    const patient = await Patient.findOne({ abhaId: req.params.abhaId });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const events = longitudinalService.extractAllEvents(patient);
    const sortedEvents = longitudinalService.sortEventsByDate(events);
    const enrichedEvents = longitudinalService.enrichEventsWithContext(sortedEvents);
    const decisionPoints = longitudinalService.identifyClinicalDecisionPoints(enrichedEvents);
    
    res.json({
      success: true,
      data: decisionPoints,
      count: decisionPoints.length,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error identifying decision points:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get longitudinal summary for multiple patients (for population analysis)
router.post('/population/summary', async (req, res) => {
  try {
    const { patientIds } = req.body;
    
    if (!patientIds || !Array.isArray(patientIds)) {
      return res.status(400).json({ error: 'Patient IDs array required' });
    }

    const patients = await Patient.find({ abhaId: { $in: patientIds } });
    const populationSummary = {
      totalPatients: patients.length,
      averageEvents: 0,
      commonPatterns: [],
      treatmentOutcomes: {},
      dataCompleteness: {},
      generatedAt: new Date().toISOString()
    };

    let totalEvents = 0;
    const treatmentResponses = {};
    const dataCompletenessSummary = { complete: 0, partial: 0, minimal: 0 };

    for (const patient of patients) {
      const events = longitudinalService.extractAllEvents(patient);
      totalEvents += events.length;

      // Analyze treatment responses
      const treatments = events.filter(e => e.type === 'treatment_end' && e.details?.response);
      treatments.forEach(t => {
        const response = t.details.response.toLowerCase();
        treatmentResponses[response] = (treatmentResponses[response] || 0) + 1;
      });

      // Assess data completeness
      const completeness = longitudinalService.analyzeDataCompleteness(events, patient);
      if (completeness.completenessRatio >= 0.8) dataCompletenessSummary.complete++;
      else if (completeness.completenessRatio >= 0.5) dataCompletenessSummary.partial++;
      else dataCompletenessSummary.minimal++;
    }

    populationSummary.averageEvents = totalEvents / patients.length;
    populationSummary.treatmentOutcomes = treatmentResponses;
    populationSummary.dataCompleteness = dataCompletenessSummary;

    res.json({
      success: true,
      data: populationSummary
    });
  } catch (error) {
    console.error('Error generating population summary:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;