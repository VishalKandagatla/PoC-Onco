const express = require('express');
const router = express.Router();
const TumorBoardReport = require('../models/TumorBoardReport');
const Patient = require('../models/Patient');
const TumorBoardReportGenerator = require('../services/tumorBoardReportGenerator');
const PerplexityReportService = require('../services/perplexityReportService');

const reportGenerator = new TumorBoardReportGenerator();
const perplexityService = new PerplexityReportService();

router.get('/', async (req, res) => {
  try {
    const reports = await TumorBoardReport.find()
      .populate('patientId', 'abhaId demographics cancerType')
      .sort('-generatedDate');
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:reportId', async (req, res) => {
  try {
    const report = await TumorBoardReport.findOne({ reportId: req.params.reportId })
      .populate('patientId');
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/generate', async (req, res) => {
  try {
    const { abhaId, reportType = 'initial' } = req.body;
    
    const patient = await Patient.findOne({ abhaId });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const report = await reportGenerator.generateReport(patient, reportType);
    
    res.status(201).json({
      message: 'Tumor board report generated successfully',
      reportId: report.reportId,
      report
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/generate-perplexity', async (req, res) => {
  try {
    const { abhaId, reportType = 'comprehensive' } = req.body;
    
    // Use file-based data service instead of MongoDB
    const fs = require('fs');
    const path = require('path');
    const processedDataPath = path.join(__dirname, '../data', 'processed_patients.json');
    const processedData = JSON.parse(fs.readFileSync(processedDataPath, 'utf8'));
    
    const patient = processedData.find(p => p.abhaId === abhaId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const aiReport = await perplexityService.generateTumorBoardReport(patient, reportType);
    
    // Create report object without MongoDB save
    const savedReport = {
      reportId: aiReport.reportId,
      patientId: patient.abhaId,
      reportType: 'ai_generated',
      generatedDate: aiReport.generatedDate,
      summary: {
        clinicalPresentation: `AI-Generated Report for ${patient.demographics?.gender || 'patient'}`,
        diagnosticFindings: 'Generated using Perplexity AI with academic citations',
        currentStatus: 'AI analysis completed',
        treatmentHistory: 'Analyzed with current literature'
      },
      recommendations: [{
        priority: 'high',
        category: 'treatment',
        description: 'AI-generated evidence-based recommendations',
        rationale: 'Based on current academic literature and guidelines',
        evidenceLevel: 'AI-curated evidence',
        citations: aiReport.citations.map(citation => ({
          source: citation.journal,
          title: citation.title,
          authors: citation.authors,
          year: citation.year,
          doi: citation.doi,
          pmid: citation.pmid,
          relevanceScore: citation.relevanceScore,
          excerpt: citation.excerpt
        }))
      }],
      aiGeneratedInsights: {
        confidenceScore: 0.9,
        modelVersion: aiReport.metadata.generationModel,
        generationTimestamp: aiReport.generatedDate,
        contextSources: ['Perplexity AI', 'Academic Literature', 'Clinical Guidelines']
      },
      discussionNotes: `AI Report Content:\n\n${aiReport.content}`,
      approvalStatus: 'pending_review'
    };
    
    res.status(201).json({
      message: 'AI-powered tumor board report generated successfully',
      reportId: aiReport.reportId,
      report: savedReport,
      aiMetadata: aiReport.metadata,
      citations: aiReport.citations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/patient/:abhaId', async (req, res) => {
  try {
    const patient = await Patient.findOne({ abhaId: req.params.abhaId });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const reports = await TumorBoardReport.find({ patientId: patient._id })
      .sort('-generatedDate');
    
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:reportId/approve', async (req, res) => {
  try {
    const { approverName, approverDesignation } = req.body;
    
    const report = await TumorBoardReport.findOneAndUpdate(
      { reportId: req.params.reportId },
      {
        approvalStatus: 'approved',
        approvedBy: {
          name: approverName,
          designation: approverDesignation,
          timestamp: new Date()
        }
      },
      { new: true }
    );
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    res.json({
      message: 'Report approved successfully',
      report
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:reportId/notes', async (req, res) => {
  try {
    const { notes } = req.body;
    
    const report = await TumorBoardReport.findOneAndUpdate(
      { reportId: req.params.reportId },
      { discussionNotes: notes },
      { new: true }
    );
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    res.json({
      message: 'Discussion notes added successfully',
      report
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:reportId/export', async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    const report = await TumorBoardReport.findOne({ reportId: req.params.reportId })
      .populate('patientId');
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (format === 'pdf') {
      res.status(501).json({ 
        error: 'PDF export not yet implemented',
        message: 'Please use JSON format for now'
      });
    } else {
      res.json(report);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Knowledge base search with Perplexity API
router.post('/knowledge-search', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchResults = await perplexityService.searchMedicalKnowledge(query);
    
    res.json({
      success: true,
      query: query,
      results: searchResults,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Knowledge search error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;