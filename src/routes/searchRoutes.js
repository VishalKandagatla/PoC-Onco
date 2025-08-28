const express = require('express');
const router = express.Router();
const PerplexityReportService = require('../services/perplexityReportService');

const perplexityService = new PerplexityReportService();

// Medical search with patient context
router.post('/medical-search', async (req, res) => {
  try {
    const { query, patientContext } = req.body;
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    let patientData = null;
    let patientContextString = null;

    // If patient context is provided, load patient data
    if (patientContext) {
      // Load patient data from the frontend data structure
      const fs = require('fs');
      const path = require('path');
      
      // Try to load from processed_patients.json first
      try {
        const processedDataPath = path.join(__dirname, '../data', 'processed_patients.json');
        const processedData = JSON.parse(fs.readFileSync(processedDataPath, 'utf8'));
        patientData = processedData.find(p => p.abhaId === patientContext);
      } catch (error) {
        console.log('Could not load processed_patients.json, using frontend data structure');
      }
      
      // If not found, use the frontend patient data structure
      if (!patientData) {
        // Load from the frontend patient data structure
        const frontendDataPath = path.join(__dirname, '../../public/js/patientData.js');
        try {
          const frontendDataContent = fs.readFileSync(frontendDataPath, 'utf8');
          // Extract the patient data from the JS file
          const match = frontendDataContent.match(/window\.PATIENT_DATA\s*=\s*(\[.*?\]);/s);
          if (match) {
            const patientDataArray = JSON.parse(match[1]);
            patientData = patientDataArray.find(p => p.id === patientContext);
          }
        } catch (error) {
          console.log('Could not load frontend patient data');
        }
      }
      
      if (patientData) {
        // Handle both data structures (frontend vs processed)
        let patientInfo;
        
        if (patientData.demographics) {
          // Processed data structure
          const demographics = patientData.demographics || {};
          const cancerType = patientData.cancerType || {};
          const genomics = patientData.genomics || {};
          const mutations = genomics.mutatedGenes?.map(m => `${m.gene} ${m.variant}`).join(', ') || '';
          
          patientInfo = {
            age: demographics.age,
            gender: demographics.gender,
            location: demographics.state,
            diagnosis: cancerType.primary,
            stage: cancerType.stage,
            histology: cancerType.histology,
            mutations: mutations,
            tmb: genomics.tmb,
            msi: genomics.msi,
            pdl1: genomics.pdl1,
            treatments: patientData.treatments?.length || 0
          };
        } else {
          // Frontend data structure
          const genomics = patientData.genomics || {};
          const somaticMutations = genomics.somaticMutations || [];
          const mutations = somaticMutations.map(m => `${m.gene} ${m.mutation}`).join(', ') || '';
          const msiTmb = genomics.msiTmb || [];
          const tmb = msiTmb.find(t => t.test && t.test.includes('TMB'))?.result || 'Not assessed';
          const msi = msiTmb.find(t => t.test && t.test.includes('MSI'))?.result || 'Not assessed';
          const pdl1 = msiTmb.find(t => t.test && t.test.includes('PD-L1'))?.result || 'Not assessed';
          
          patientInfo = {
            age: patientData.age,
            gender: patientData.gender,
            location: 'Unknown',
            diagnosis: patientData.diagnosis,
            stage: patientData.stage,
            histology: 'Unknown',
            mutations: mutations,
            tmb: tmb,
            msi: msi,
            pdl1: pdl1,
            treatments: patientData.treatmentResponse?.responses?.length || 0
          };
        }
        
        patientContextString = `
Patient Demographics:
- Age: ${patientInfo.age || 'Unknown'} years old
- Gender: ${patientInfo.gender || 'Unknown'}
- Location: ${patientInfo.location || 'Unknown'}

Cancer Details:
- Primary Diagnosis: ${patientInfo.diagnosis || 'Unknown'}
- Stage: ${patientInfo.stage || 'Unknown'}
- Histology: ${patientInfo.histology || 'Unknown'}

Molecular Profile:
- Mutations: ${patientInfo.mutations || 'No mutations identified'}
- TMB: ${patientInfo.tmb || 'Not assessed'}
- MSI: ${patientInfo.msi || 'Not assessed'}
- PD-L1: ${patientInfo.pdl1 || 'Not assessed'}

Treatment History:
- ${patientInfo.treatments} prior treatments documented
        `.trim();
      }
    }

    // Perform search with patient context
    let searchResults;
    try {
      searchResults = await perplexityService.searchMedicalKnowledgeWithContext(query, patientContextString);
    } catch (error) {
      // If Perplexity API fails, provide a helpful fallback response
      console.log('Perplexity API error:', error.message);
      
      searchResults = {
        query: query,
        summary: `Search results for "${query}" - API currently unavailable`,
        sections: [{
          name: 'API Configuration Notice',
          content: `The medical search functionality requires a valid Perplexity API key. 
          
To enable full search capabilities:
1. Sign up at https://docs.perplexity.ai/
2. Get your API key
3. Add it to your .env file as PERPLEXITY_API_KEY=your_key_here
4. Restart the server

Current search query: "${query}"
${patientContext ? `Patient context: ${patientContext}` : 'No patient context selected'}

This is a demo message showing that the search interface is working correctly.`
        }],
        citations: [],
        confidence: 0,
        searchMetadata: {
          model: 'demo-fallback',
          usage: { total_tokens: 0 },
          searchDate: new Date(),
          sourceCount: 0,
          error: error.message
        }
      };
    }
    
    // Add patient context to results
    const response = {
      success: true,
      query: query,
      patientContext: patientContext,
      patientData: patientData ? {
        name: patientData.demographics ? 
          `${patientData.demographics?.firstName} ${patientData.demographics?.lastName}` : 
          patientData.name,
        diagnosis: patientData.cancerType?.primary || patientData.diagnosis,
        stage: patientData.cancerType?.stage || patientData.stage
      } : null,
      results: searchResults,
      timestamp: new Date().toISOString()
    };
    
    // Store search in history (if we had a database)
    // For now, this is handled client-side
    
    res.json(response);
    
  } catch (error) {
    console.error('Medical search error:', error);
    
    // Return user-friendly error messages
    let statusCode = 500;
    let errorMessage = error.message;
    
    if (error.message.includes('rate limit')) {
      statusCode = 429;
    } else if (error.message.includes('API key')) {
      statusCode = 401;
    } else if (error.message.includes('timeout')) {
      statusCode = 408;
    }
    
    res.status(statusCode).json({ 
      success: false,
      error: errorMessage 
    });
  }
});

// Get search history (placeholder for future database implementation)
router.get('/search-history', async (req, res) => {
  try {
    // In a real implementation, this would fetch from database
    res.json({
      success: true,
      history: [],
      message: 'Search history is currently stored client-side'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;