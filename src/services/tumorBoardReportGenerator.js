const TumorBoardReport = require('../models/TumorBoardReport');
const LongitudinalProfileService = require('./longitudinalProfileService');
const CitationService = require('./citationService');
const { v4: uuidv4 } = require('uuid');

class TumorBoardReportGenerator {
  constructor() {
    this.profileService = new LongitudinalProfileService();
    this.citationService = new CitationService();
  }

  async generateReport(patientData, reportType = 'initial') {
    try {
      const reportId = `TBR-${Date.now()}-${uuidv4().slice(0, 8)}`;
      const timeline = this.profileService.generateTimeline(patientData);
      const summary = this.profileService.generateSummary(patientData);

      const clinicalContext = await this.analyzeClinicalContext(patientData);
      const recommendations = await this.generateRecommendations(patientData, clinicalContext);
      const trialMatches = await this.findClinicalTrials(patientData);

      const report = new TumorBoardReport({
        reportId,
        patientId: patientData._id,
        reportType,
        summary: {
          clinicalPresentation: this.summarizeClinicalPresentation(patientData),
          diagnosticFindings: this.summarizeDiagnostics(patientData),
          currentStatus: this.determineCurrentStatus(patientData, summary),
          treatmentHistory: this.summarizeTreatmentHistory(patientData)
        },
        recommendations: recommendations,
        molecularProfile: this.analyzeMolecularProfile(patientData),
        imagingFindings: this.summarizeImaging(patientData),
        pathologyReview: this.summarizePathology(patientData),
        clinicalTrialMatches: trialMatches,
        participants: this.getDefaultParticipants(),
        aiGeneratedInsights: {
          confidenceScore: 0.85,
          modelVersion: '1.0',
          generationTimestamp: new Date(),
          contextSources: ['PubMed', 'ClinicalTrials.gov', 'NCCN Guidelines']
        }
      });

      await report.save();
      return report;
    } catch (error) {
      throw new Error(`Report generation failed: ${error.message}`);
    }
  }

  async analyzeClinicalContext(patientData) {
    const context = {
      cancerType: patientData.cancerType?.primary,
      stage: patientData.cancerType?.stage,
      histology: patientData.cancerType?.histology,
      molecularMarkers: this.extractMolecularMarkers(patientData),
      treatmentHistory: patientData.treatments?.map(t => ({
        type: t.type,
        regimen: t.regimen,
        response: t.response
      })),
      performanceStatus: 'ECOG 1'
    };

    return context;
  }

  async generateRecommendations(patientData, clinicalContext) {
    const recommendations = [];

    if (patientData.genomics?.mutationProfile?.length > 0) {
      const targetedTherapy = await this.recommendTargetedTherapy(
        patientData.genomics.mutationProfile,
        clinicalContext
      );
      if (targetedTherapy) {
        recommendations.push(targetedTherapy);
      }
    }

    const standardTherapy = await this.recommendStandardTherapy(clinicalContext);
    if (standardTherapy) {
      recommendations.push(standardTherapy);
    }

    const supportiveCare = this.recommendSupportiveCare(patientData);
    recommendations.push(supportiveCare);

    const diagnosticRec = this.recommendDiagnostics(patientData);
    if (diagnosticRec) {
      recommendations.push(diagnosticRec);
    }

    return recommendations;
  }

  async recommendTargetedTherapy(mutationProfile, clinicalContext) {
    const actionableMutation = mutationProfile.find(m => 
      ['EGFR', 'ALK', 'ROS1', 'BRAF', 'HER2', 'MET'].includes(m.gene)
    );

    if (!actionableMutation) return null;

    const citations = await this.citationService.findRelevantCitations(
      `${actionableMutation.gene} ${actionableMutation.variant} ${clinicalContext.cancerType} targeted therapy`
    );

    return {
      priority: 'high',
      category: 'treatment',
      description: `Consider targeted therapy for ${actionableMutation.gene} ${actionableMutation.variant} alteration`,
      rationale: `Patient has actionable ${actionableMutation.gene} mutation with established targeted therapy options`,
      evidenceLevel: 'Level 1',
      citations: citations.slice(0, 3)
    };
  }

  async recommendStandardTherapy(clinicalContext) {
    const treatmentQuery = `${clinicalContext.cancerType} ${clinicalContext.stage} first-line therapy`;
    const citations = await this.citationService.findRelevantCitations(treatmentQuery);

    return {
      priority: 'high',
      category: 'treatment',
      description: `Standard first-line systemic therapy as per NCCN guidelines`,
      rationale: `Based on cancer type, stage, and molecular profile`,
      evidenceLevel: 'Category 1',
      citations: citations.slice(0, 3)
    };
  }

  recommendSupportiveCare(patientData) {
    return {
      priority: 'medium',
      category: 'supportive',
      description: 'Comprehensive supportive care including pain management, nutritional support, and psychosocial care',
      rationale: 'Essential for maintaining quality of life and treatment tolerance',
      evidenceLevel: 'Expert consensus',
      citations: [{
        source: 'NCCN Guidelines',
        title: 'NCCN Clinical Practice Guidelines in Oncology: Supportive Care',
        authors: ['NCCN Panel'],
        year: 2024,
        relevanceScore: 0.9
      }]
    };
  }

  recommendDiagnostics(patientData) {
    const lastImaging = patientData.imaging?.[patientData.imaging.length - 1];
    const daysSinceLastImaging = lastImaging ? 
      (new Date() - new Date(lastImaging.studyDate)) / (1000 * 60 * 60 * 24) : Infinity;

    if (daysSinceLastImaging > 90) {
      return {
        priority: 'medium',
        category: 'diagnostic',
        description: 'Restaging imaging with CT chest/abdomen/pelvis',
        rationale: 'More than 3 months since last imaging study',
        evidenceLevel: 'Standard practice',
        citations: []
      };
    }

    return null;
  }

  async findClinicalTrials(patientData) {
    const mockTrials = [
      {
        trialId: 'NCT04123456',
        title: 'Phase II Study of Novel Immunotherapy Combination',
        phase: 'Phase II',
        eligibilityCriteria: [
          'Advanced solid tumors',
          'ECOG 0-2',
          'Adequate organ function'
        ],
        matchScore: 0.85,
        location: 'AIIMS Delhi',
        contactInfo: {
          pi: 'Dr. Kumar',
          email: 'trials@aiims.edu',
          phone: '+91-11-26588500'
        }
      }
    ];

    return mockTrials;
  }

  summarizeClinicalPresentation(patientData) {
    const age = patientData.demographics?.dateOfBirth ? 
      new Date().getFullYear() - new Date(patientData.demographics.dateOfBirth).getFullYear() : 'Unknown';
    
    return `${age}-year-old ${patientData.demographics?.gender || 'patient'} with ${patientData.cancerType?.primary || 'cancer'}, ` +
           `Stage ${patientData.cancerType?.stage || 'unknown'}, diagnosed on ${patientData.cancerType?.diagnosisDate?.toLocaleDateString() || 'unknown date'}`;
  }

  summarizeDiagnostics(patientData) {
    const findings = [];
    
    if (patientData.pathologyReports?.length > 0) {
      const latestPath = patientData.pathologyReports[patientData.pathologyReports.length - 1];
      findings.push(`Pathology: ${latestPath.diagnosis}`);
    }

    if (patientData.imaging?.length > 0) {
      const latestImaging = patientData.imaging[patientData.imaging.length - 1];
      findings.push(`${latestImaging.modality}: ${latestImaging.findings}`);
    }

    if (patientData.genomics?.mutationProfile?.length > 0) {
      const mutations = patientData.genomics.mutationProfile.map(m => m.gene).join(', ');
      findings.push(`Molecular: ${mutations} mutations detected`);
    }

    return findings.join('. ');
  }

  determineCurrentStatus(patientData, summary) {
    const status = [];
    
    if (summary.currentStatus.activeTreatments > 0) {
      status.push('Currently on active treatment');
    }

    if (summary.currentStatus.activeTrials > 0) {
      status.push('Enrolled in clinical trial');
    }

    const lastTreatment = patientData.treatments?.[patientData.treatments.length - 1];
    if (lastTreatment?.response) {
      status.push(`Last treatment response: ${lastTreatment.response}`);
    }

    return status.join('. ') || 'Awaiting treatment decision';
  }

  summarizeTreatmentHistory(patientData) {
    if (!patientData.treatments || patientData.treatments.length === 0) {
      return 'No prior systemic therapy';
    }

    const treatments = patientData.treatments.map(t => 
      `${t.type} (${t.regimen})${t.response ? ` - ${t.response} response` : ''}`
    );

    return treatments.join('; ');
  }

  extractMolecularMarkers(patientData) {
    const markers = {};
    
    if (patientData.genomics?.mutationProfile) {
      patientData.genomics.mutationProfile.forEach(m => {
        markers[m.gene] = m.variant;
      });
    }

    if (patientData.genomics?.tmb) {
      markers.TMB = patientData.genomics.tmb;
    }

    if (patientData.genomics?.msi) {
      markers.MSI = patientData.genomics.msi;
    }

    return markers;
  }

  analyzeMolecularProfile(patientData) {
    if (!patientData.genomics) {
      return {
        summary: 'No molecular profiling available',
        actionableAlterations: []
      };
    }

    const actionable = patientData.genomics.mutationProfile?.filter(m => 
      ['EGFR', 'ALK', 'ROS1', 'BRAF', 'HER2', 'MET', 'RET', 'NTRK'].includes(m.gene)
    ) || [];

    return {
      summary: `TMB: ${patientData.genomics.tmb || 'N/A'}, MSI: ${patientData.genomics.msi || 'N/A'}`,
      actionableAlterations: actionable.map(m => ({
        gene: m.gene,
        alteration: m.variant,
        therapyImplications: this.getTherapyImplications(m.gene),
        clinicalTrials: []
      }))
    };
  }

  getTherapyImplications(gene) {
    const implications = {
      'EGFR': 'EGFR TKIs (erlotinib, gefitinib, osimertinib)',
      'ALK': 'ALK inhibitors (crizotinib, alectinib, brigatinib)',
      'ROS1': 'ROS1 inhibitors (crizotinib, entrectinib)',
      'BRAF': 'BRAF/MEK inhibitors (dabrafenib/trametinib)',
      'HER2': 'HER2-targeted therapy (trastuzumab, pertuzumab)',
      'MET': 'MET inhibitors (capmatinib, tepotinib)',
      'RET': 'RET inhibitors (selpercatinib, pralsetinib)',
      'NTRK': 'TRK inhibitors (larotrectinib, entrectinib)'
    };

    return implications[gene] || 'Potential targeted therapy available';
  }

  summarizeImaging(patientData) {
    if (!patientData.imaging || patientData.imaging.length === 0) {
      return {
        summary: 'No imaging available',
        keyFindings: [],
        recistAssessment: 'Not assessed'
      };
    }

    const latestImaging = patientData.imaging[patientData.imaging.length - 1];
    
    return {
      summary: `Latest ${latestImaging.modality} (${new Date(latestImaging.studyDate).toLocaleDateString()})`,
      keyFindings: [latestImaging.findings],
      recistAssessment: 'Stable disease'
    };
  }

  summarizePathology(patientData) {
    if (!patientData.pathologyReports || patientData.pathologyReports.length === 0) {
      return {
        diagnosis: 'No pathology report available',
        immunohistochemistry: {},
        molecularMarkers: {}
      };
    }

    const latestReport = patientData.pathologyReports[patientData.pathologyReports.length - 1];
    
    return {
      diagnosis: latestReport.diagnosis,
      immunohistochemistry: {
        'PD-L1': 'TPS 40%',
        'HER2': 'Negative (0)',
        'ER/PR': 'Not applicable'
      },
      molecularMarkers: this.extractMolecularMarkers(patientData)
    };
  }

  getDefaultParticipants() {
    return [
      {
        name: 'Dr. Sharma',
        role: 'Chair',
        specialty: 'Medical Oncology',
        institution: 'AIIMS Delhi'
      },
      {
        name: 'Dr. Patel',
        role: 'Member',
        specialty: 'Surgical Oncology',
        institution: 'AIIMS Delhi'
      },
      {
        name: 'Dr. Gupta',
        role: 'Member',
        specialty: 'Radiation Oncology',
        institution: 'AIIMS Delhi'
      },
      {
        name: 'Dr. Singh',
        role: 'Member',
        specialty: 'Pathology',
        institution: 'AIIMS Delhi'
      },
      {
        name: 'Dr. Kumar',
        role: 'Member',
        specialty: 'Radiology',
        institution: 'AIIMS Delhi'
      }
    ];
  }
}

module.exports = TumorBoardReportGenerator;