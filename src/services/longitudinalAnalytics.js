const { differenceInDays, format } = require('date-fns');

class LongitudinalAnalytics {
  constructor() {
    this.analysisTypes = {
      DISEASE_TRAJECTORY: 'disease_trajectory',
      TREATMENT_EFFECTIVENESS: 'treatment_effectiveness',
      CARE_COORDINATION: 'care_coordination',
      OUTCOMES_PREDICTION: 'outcomes_prediction'
    };
  }

  analyzeDiseaseTrajectory(events) {
    const imagingEvents = events.filter(e => e.type === 'imaging');
    const labEvents = events.filter(e => e.type === 'lab_result');
    const treatmentEvents = events.filter(e => e.category === 'treatment');

    return {
      overallTrajectory: this.determineOverallTrajectory(events),
      imagingProgression: this.analyzeImagingProgression(imagingEvents),
      biomarkerTrends: this.analyzeBiomarkerTrends(labEvents),
      treatmentResponse: this.analyzeTreatmentResponse(treatmentEvents, imagingEvents),
      progressionFreeIntervals: this.calculateProgressionFreeIntervals(events),
      diseasePhases: this.identifyDiseasePhases(events)
    };
  }

  determineOverallTrajectory(events) {
    const progressionMarkers = this.identifyProgressionMarkers(events);
    const responseMarkers = this.identifyResponseMarkers(events);
    
    if (responseMarkers.length > progressionMarkers.length) {
      return {
        status: 'improving',
        confidence: 0.8,
        evidence: responseMarkers,
        trend: 'positive'
      };
    } else if (progressionMarkers.length > responseMarkers.length) {
      return {
        status: 'progressing',
        confidence: 0.7,
        evidence: progressionMarkers,
        trend: 'negative'
      };
    } else {
      return {
        status: 'stable',
        confidence: 0.6,
        evidence: [...responseMarkers, ...progressionMarkers],
        trend: 'neutral'
      };
    }
  }

  identifyProgressionMarkers(events) {
    const markers = [];
    
    events.forEach(event => {
      if (event.type === 'imaging' && event.details?.findings) {
        const findings = event.details.findings.toLowerCase();
        if (findings.includes('progression') || 
            findings.includes('increase') || 
            findings.includes('new') ||
            findings.includes('metastas')) {
          markers.push({
            event: event,
            type: 'imaging_progression',
            strength: 'high'
          });
        }
      }
      
      if (event.type === 'lab_result' && event.trend === 'declining') {
        markers.push({
          event: event,
          type: 'biomarker_decline',
          strength: 'medium'
        });
      }
    });
    
    return markers;
  }

  identifyResponseMarkers(events) {
    const markers = [];
    
    events.forEach(event => {
      if (event.type === 'imaging' && event.details?.findings) {
        const findings = event.details.findings.toLowerCase();
        if (findings.includes('improvement') || 
            findings.includes('reduction') || 
            findings.includes('response') ||
            findings.includes('stable')) {
          markers.push({
            event: event,
            type: 'imaging_response',
            strength: 'high'
          });
        }
      }
      
      if (event.type === 'treatment_end' && event.details?.response) {
        const response = event.details.response.toLowerCase();
        if (response.includes('complete') || response.includes('partial')) {
          markers.push({
            event: event,
            type: 'treatment_response',
            strength: 'high'
          });
        }
      }
    });
    
    return markers;
  }

  analyzeImagingProgression(imagingEvents) {
    if (imagingEvents.length < 2) {
      return {
        status: 'insufficient_data',
        totalStudies: imagingEvents.length
      };
    }

    const progressionAnalysis = [];
    
    for (let i = 1; i < imagingEvents.length; i++) {
      const current = imagingEvents[i];
      const previous = imagingEvents[i - 1];
      
      const comparison = {
        currentDate: current.date,
        previousDate: previous.date,
        interval: differenceInDays(current.date, previous.date),
        modality: current.details?.modality,
        findings: current.details?.findings,
        assessment: this.compareImagingFindings(previous.details?.findings, current.details?.findings)
      };
      
      progressionAnalysis.push(comparison);
    }
    
    return {
      status: 'analyzed',
      totalStudies: imagingEvents.length,
      comparisons: progressionAnalysis,
      overallTrend: this.calculateOverallImagingTrend(progressionAnalysis)
    };
  }

  compareImagingFindings(previousFindings, currentFindings) {
    if (!previousFindings || !currentFindings) {
      return { assessment: 'incomplete_data', confidence: 0.3 };
    }
    
    const prev = previousFindings.toLowerCase();
    const curr = currentFindings.toLowerCase();
    
    // Look for progression keywords
    const progressionKeywords = ['progression', 'increase', 'enlargement', 'new', 'worsening'];
    const improvementKeywords = ['improvement', 'reduction', 'decrease', 'resolution', 'response'];
    const stableKeywords = ['stable', 'unchanged', 'similar'];
    
    if (progressionKeywords.some(keyword => curr.includes(keyword))) {
      return { assessment: 'progression', confidence: 0.8 };
    } else if (improvementKeywords.some(keyword => curr.includes(keyword))) {
      return { assessment: 'improvement', confidence: 0.8 };
    } else if (stableKeywords.some(keyword => curr.includes(keyword))) {
      return { assessment: 'stable', confidence: 0.9 };
    }
    
    return { assessment: 'indeterminate', confidence: 0.4 };
  }

  calculateOverallImagingTrend(comparisons) {
    if (comparisons.length === 0) return 'unknown';
    
    const assessments = comparisons.map(c => c.assessment.assessment);
    const progressionCount = assessments.filter(a => a === 'progression').length;
    const improvementCount = assessments.filter(a => a === 'improvement').length;
    const stableCount = assessments.filter(a => a === 'stable').length;
    
    if (progressionCount > improvementCount && progressionCount > stableCount) {
      return 'progressive';
    } else if (improvementCount > progressionCount && improvementCount > stableCount) {
      return 'improving';
    } else {
      return 'stable';
    }
  }

  analyzeBiomarkerTrends(labEvents) {
    const biomarkerGroups = this.groupLabEventsByTest(labEvents);
    const trends = {};
    
    Object.entries(biomarkerGroups).forEach(([testName, events]) => {
      trends[testName] = this.calculateBiomarkerTrend(events);
    });
    
    return {
      totalBiomarkers: Object.keys(trends).length,
      trends,
      clinicalSignificance: this.assessBiomarkerClinicalSignificance(trends)
    };
  }

  groupLabEventsByTest(labEvents) {
    const groups = {};
    
    labEvents.forEach(event => {
      const testName = event.details?.testName || 'unknown';
      if (!groups[testName]) {
        groups[testName] = [];
      }
      groups[testName].push(event);
    });
    
    // Sort each group by date
    Object.keys(groups).forEach(testName => {
      groups[testName].sort((a, b) => new Date(a.date) - new Date(b.date));
    });
    
    return groups;
  }

  calculateBiomarkerTrend(events) {
    if (events.length < 2) {
      return {
        status: 'insufficient_data',
        dataPoints: events.length
      };
    }
    
    const values = events.map(e => parseFloat(e.details?.value)).filter(v => !isNaN(v));
    if (values.length < 2) {
      return {
        status: 'non_numeric_data',
        dataPoints: values.length
      };
    }
    
    const trend = this.calculateLinearTrend(values);
    const changePercent = ((values[values.length - 1] - values[0]) / values[0]) * 100;
    
    return {
      status: 'analyzed',
      dataPoints: values.length,
      trend: trend.slope > 0 ? 'increasing' : trend.slope < 0 ? 'decreasing' : 'stable',
      slope: trend.slope,
      correlation: trend.correlation,
      changePercent: changePercent,
      firstValue: values[0],
      lastValue: values[values.length - 1],
      clinicalInterpretation: this.interpretBiomarkerChange(events[0].details?.testName, changePercent)
    };
  }

  calculateLinearTrend(values) {
    const n = values.length;
    const x = Array.from({length: n}, (_, i) => i);
    const y = values;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate correlation coefficient
    const meanX = sumX / n;
    const meanY = sumY / n;
    const numerator = x.reduce((sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY), 0);
    const denomX = Math.sqrt(x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0));
    const denomY = Math.sqrt(y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0));
    const correlation = numerator / (denomX * denomY);
    
    return { slope, intercept, correlation };
  }

  interpretBiomarkerChange(testName, changePercent) {
    const interpretations = {
      'Complete Blood Count': {
        improving: changePercent > 20 ? 'Recovery of blood counts' : 'Stable hematology',
        declining: changePercent < -20 ? 'Concerning blood count decline' : 'Mild hematologic changes'
      },
      'Squamous Cell Carcinoma Antigen': {
        improving: changePercent < -30 ? 'Excellent tumor response' : 'Good tumor response',
        declining: changePercent > 50 ? 'Possible disease progression' : 'Stable tumor markers'
      }
    };
    
    const testInterpretation = interpretations[testName];
    if (!testInterpretation) return 'Unknown clinical significance';
    
    if (changePercent > 0) {
      return testInterpretation.declining || 'Increasing trend noted';
    } else {
      return testInterpretation.improving || 'Decreasing trend noted';
    }
  }

  assessBiomarkerClinicalSignificance(trends) {
    const significance = [];
    
    Object.entries(trends).forEach(([testName, trend]) => {
      if (trend.status === 'analyzed') {
        if (Math.abs(trend.changePercent) > 50) {
          significance.push({
            testName,
            significance: 'high',
            reason: `Significant change of ${trend.changePercent.toFixed(1)}%`,
            trend: trend.trend
          });
        } else if (Math.abs(trend.changePercent) > 20) {
          significance.push({
            testName,
            significance: 'moderate',
            reason: `Moderate change of ${trend.changePercent.toFixed(1)}%`,
            trend: trend.trend
          });
        }
      }
    });
    
    return significance;
  }

  analyzeTreatmentEffectiveness(events) {
    const treatmentPeriods = this.identifyTreatmentPeriods(events);
    const effectiveness = [];
    
    treatmentPeriods.forEach(period => {
      const analysis = this.analyzeTreatmentPeriod(period, events);
      effectiveness.push(analysis);
    });
    
    return {
      totalTreatments: treatmentPeriods.length,
      effectiveness,
      overallEffectiveness: this.calculateOverallEffectiveness(effectiveness),
      bestResponse: this.identifyBestResponse(effectiveness),
      treatmentSequence: this.analyzeTreatmentSequence(effectiveness)
    };
  }

  identifyTreatmentPeriods(events) {
    const periods = [];
    let currentPeriod = null;
    
    events.forEach(event => {
      if (event.type === 'treatment_start') {
        currentPeriod = {
          startEvent: event,
          endEvent: null,
          relatedEvents: []
        };
        periods.push(currentPeriod);
      } else if (event.type === 'treatment_end' && currentPeriod) {
        currentPeriod.endEvent = event;
      } else if (currentPeriod && !currentPeriod.endEvent) {
        // Add events that occur during treatment
        const daysSinceStart = differenceInDays(event.date, currentPeriod.startEvent.date);
        if (daysSinceStart >= 0 && daysSinceStart <= 365) { // Within a year
          currentPeriod.relatedEvents.push(event);
        }
      }
    });
    
    return periods;
  }

  analyzeTreatmentPeriod(period, allEvents) {
    const startDate = period.startEvent.date;
    const endDate = period.endEvent?.date || new Date();
    const duration = differenceInDays(endDate, startDate);
    
    // Analyze imaging during treatment
    const treatmentImaging = period.relatedEvents.filter(e => e.type === 'imaging');
    const imagingResponse = this.assessImagingDuringTreatment(treatmentImaging);
    
    // Analyze biomarkers during treatment
    const treatmentLabs = period.relatedEvents.filter(e => e.type === 'lab_result');
    const biomarkerResponse = this.assessBiomarkersDuringTreatment(treatmentLabs);
    
    // Analyze adverse events
    const adverseEvents = period.relatedEvents.filter(e => e.type === 'adverse_event');
    
    return {
      treatment: {
        type: period.startEvent.details?.type,
        regimen: period.startEvent.details?.regimen,
        startDate,
        endDate: period.endEvent?.date,
        duration
      },
      response: {
        clinical: period.endEvent?.details?.response || 'ongoing',
        imaging: imagingResponse,
        biomarker: biomarkerResponse
      },
      toxicity: {
        adverseEvents: adverseEvents.length,
        severity: this.assessToxicitySeverity(adverseEvents)
      },
      effectiveness: this.calculateTreatmentEffectiveness(period, imagingResponse, biomarkerResponse)
    };
  }

  assessImagingDuringTreatment(imagingEvents) {
    if (imagingEvents.length === 0) {
      return { status: 'no_imaging', assessment: 'unknown' };
    }
    
    const assessments = imagingEvents.map(event => 
      this.compareImagingFindings('', event.details?.findings || '')
    );
    
    const responses = assessments.filter(a => a.assessment === 'improvement').length;
    const progressions = assessments.filter(a => a.assessment === 'progression').length;
    const stable = assessments.filter(a => a.assessment === 'stable').length;
    
    if (responses > progressions) {
      return { status: 'response', assessment: 'responding', confidence: 0.8 };
    } else if (progressions > responses) {
      return { status: 'progression', assessment: 'progressing', confidence: 0.8 };
    } else {
      return { status: 'stable', assessment: 'stable_disease', confidence: 0.7 };
    }
  }

  assessBiomarkersDuringTreatment(labEvents) {
    if (labEvents.length === 0) {
      return { status: 'no_biomarkers', assessment: 'unknown' };
    }
    
    const biomarkerGroups = this.groupLabEventsByTest(labEvents);
    const responses = [];
    
    Object.entries(biomarkerGroups).forEach(([testName, events]) => {
      const trend = this.calculateBiomarkerTrend(events);
      if (trend.status === 'analyzed') {
        responses.push({
          testName,
          trend: trend.trend,
          changePercent: trend.changePercent
        });
      }
    });
    
    const improvingCount = responses.filter(r => r.changePercent < -20).length;
    const decliningCount = responses.filter(r => r.changePercent > 20).length;
    
    if (improvingCount > decliningCount) {
      return { status: 'improving', assessment: 'biomarker_response', confidence: 0.7 };
    } else if (decliningCount > improvingCount) {
      return { status: 'declining', assessment: 'biomarker_progression', confidence: 0.7 };
    } else {
      return { status: 'stable', assessment: 'stable_biomarkers', confidence: 0.6 };
    }
  }

  assessToxicitySeverity(adverseEvents) {
    if (adverseEvents.length === 0) return 'none';
    
    const severities = adverseEvents.map(ae => ae.details?.severity || 'mild');
    const severeCount = severities.filter(s => s === 'severe').length;
    const moderateCount = severities.filter(s => s === 'moderate').length;
    
    if (severeCount > 0) return 'severe';
    if (moderateCount > adverseEvents.length / 2) return 'moderate';
    return 'mild';
  }

  calculateTreatmentEffectiveness(period, imagingResponse, biomarkerResponse) {
    let effectivenessScore = 0.5; // Baseline
    
    // Clinical response
    const clinicalResponse = period.endEvent?.details?.response;
    if (clinicalResponse?.includes('complete')) effectivenessScore += 0.4;
    else if (clinicalResponse?.includes('partial')) effectivenessScore += 0.3;
    else if (clinicalResponse?.includes('stable')) effectivenessScore += 0.1;
    
    // Imaging response
    if (imagingResponse.assessment === 'responding') effectivenessScore += 0.2;
    else if (imagingResponse.assessment === 'stable_disease') effectivenessScore += 0.1;
    
    // Biomarker response
    if (biomarkerResponse.assessment === 'biomarker_response') effectivenessScore += 0.1;
    
    return Math.min(1.0, Math.max(0.0, effectivenessScore));
  }

  calculateOverallEffectiveness(effectiveness) {
    if (effectiveness.length === 0) return { score: 0, interpretation: 'no_data' };
    
    const scores = effectiveness.map(e => e.effectiveness);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    let interpretation;
    if (averageScore >= 0.8) interpretation = 'highly_effective';
    else if (averageScore >= 0.6) interpretation = 'moderately_effective';
    else if (averageScore >= 0.4) interpretation = 'limited_effectiveness';
    else interpretation = 'poor_effectiveness';
    
    return { score: averageScore, interpretation };
  }

  generateOutcomesPrediction(events, patientData) {
    const features = this.extractPredictiveFeatures(events, patientData);
    const riskScore = this.calculateRiskScore(features);
    const prognosticFactors = this.identifyPrognosticFactors(features);
    
    return {
      riskScore,
      riskCategory: this.categorizeRisk(riskScore),
      prognosticFactors,
      predictiveFeatures: features,
      recommendations: this.generateRiskBasedRecommendations(riskScore, prognosticFactors),
      confidence: this.calculatePredictionConfidence(features)
    };
  }

  extractPredictiveFeatures(events, patientData) {
    const features = {};
    
    // Demographics
    features.age = this.calculateAge(patientData.demographics?.dateOfBirth);
    features.gender = patientData.demographics?.gender;
    
    // Disease characteristics
    features.stage = patientData.cancerType?.stage;
    features.histology = patientData.cancerType?.histology;
    features.grade = patientData.cancerType?.grade;
    
    // Treatment features
    const treatments = events.filter(e => e.type === 'treatment_start');
    features.numberOfTreatments = treatments.length;
    features.treatmentTypes = [...new Set(treatments.map(t => t.details?.type))];
    
    // Molecular features
    if (patientData.genomics?.mutationProfile) {
      features.mutationCount = patientData.genomics.mutationProfile.length;
      features.actionableMutations = patientData.genomics.mutationProfile.filter(m => 
        ['EGFR', 'ALK', 'ROS1', 'BRAF', 'HER2'].includes(m.gene)
      ).length;
      features.tmb = patientData.genomics.tmb;
      features.msi = patientData.genomics.msi;
    }
    
    // Response features
    const responses = events.filter(e => e.type === 'treatment_end' && e.details?.response);
    features.bestResponse = this.determineBestResponse(responses);
    
    return features;
  }

  calculateAge(dateOfBirth) {
    if (!dateOfBirth) return null;
    const birth = new Date(dateOfBirth);
    const now = new Date();
    return now.getFullYear() - birth.getFullYear();
  }

  determineBestResponse(responses) {
    if (responses.length === 0) return 'unknown';
    
    const responseHierarchy = {
      'complete response': 4,
      'partial response': 3,
      'stable disease': 2,
      'progressive disease': 1
    };
    
    let bestScore = 0;
    let bestResponse = 'unknown';
    
    responses.forEach(response => {
      const responseText = response.details.response.toLowerCase();
      Object.entries(responseHierarchy).forEach(([resp, score]) => {
        if (responseText.includes(resp) && score > bestScore) {
          bestScore = score;
          bestResponse = resp;
        }
      });
    });
    
    return bestResponse;
  }

  calculateRiskScore(features) {
    let score = 0.5; // Baseline risk
    
    // Age factor
    if (features.age) {
      if (features.age > 65) score += 0.1;
      else if (features.age < 50) score -= 0.05;
    }
    
    // Stage factor
    if (features.stage) {
      if (features.stage.includes('IV')) score += 0.3;
      else if (features.stage.includes('III')) score += 0.2;
      else if (features.stage.includes('II')) score += 0.1;
    }
    
    // Treatment response factor
    if (features.bestResponse === 'complete response') score -= 0.2;
    else if (features.bestResponse === 'partial response') score -= 0.1;
    else if (features.bestResponse === 'progressive disease') score += 0.2;
    
    // Molecular factors
    if (features.actionableMutations > 0) score -= 0.1;
    if (features.tmb > 10) score -= 0.05;
    
    return Math.min(1.0, Math.max(0.0, score));
  }

  categorizeRisk(riskScore) {
    if (riskScore >= 0.8) return 'high';
    if (riskScore >= 0.6) return 'moderate-high';
    if (riskScore >= 0.4) return 'moderate';
    if (riskScore >= 0.2) return 'low-moderate';
    return 'low';
  }

  identifyPrognosticFactors(features) {
    const factors = [];
    
    if (features.stage?.includes('IV')) {
      factors.push({
        factor: 'Advanced Stage',
        impact: 'negative',
        strength: 'high',
        description: 'Metastatic disease associated with poorer prognosis'
      });
    }
    
    if (features.actionableMutations > 0) {
      factors.push({
        factor: 'Actionable Mutations',
        impact: 'positive',
        strength: 'moderate',
        description: 'Targetable mutations may improve treatment options'
      });
    }
    
    if (features.bestResponse === 'complete response') {
      factors.push({
        factor: 'Complete Response',
        impact: 'positive',
        strength: 'high',
        description: 'Excellent treatment response indicates better outcomes'
      });
    }
    
    return factors;
  }

  generateRiskBasedRecommendations(riskScore, prognosticFactors) {
    const recommendations = [];
    
    if (riskScore >= 0.7) {
      recommendations.push({
        priority: 'high',
        category: 'treatment',
        recommendation: 'Consider aggressive multimodal therapy',
        rationale: 'High risk score indicates need for intensive treatment approach'
      });
      
      recommendations.push({
        priority: 'high',
        category: 'monitoring',
        recommendation: 'Frequent imaging and biomarker monitoring',
        rationale: 'Close surveillance needed for high-risk patients'
      });
    }
    
    const hasActionableMutations = prognosticFactors.some(f => 
      f.factor === 'Actionable Mutations' && f.impact === 'positive'
    );
    
    if (hasActionableMutations) {
      recommendations.push({
        priority: 'medium',
        category: 'treatment',
        recommendation: 'Evaluate for targeted therapy options',
        rationale: 'Actionable mutations present - consider precision medicine approach'
      });
    }
    
    if (riskScore <= 0.3) {
      recommendations.push({
        priority: 'low',
        category: 'monitoring',
        recommendation: 'Standard follow-up protocol',
        rationale: 'Low risk score allows for routine monitoring schedule'
      });
    }
    
    return recommendations;
  }

  calculatePredictionConfidence(features) {
    let confidence = 0.5;
    
    // More data points increase confidence
    const dataPoints = Object.values(features).filter(v => v !== null && v !== undefined).length;
    confidence += (dataPoints / 20) * 0.3; // Max 0.3 boost for data completeness
    
    // Key prognostic factors increase confidence
    if (features.stage) confidence += 0.1;
    if (features.bestResponse && features.bestResponse !== 'unknown') confidence += 0.1;
    if (features.mutationCount > 0) confidence += 0.05;
    
    return Math.min(0.95, confidence); // Cap at 95% confidence
  }

  analyzeTreatmentResponse(treatmentEvents, imagingEvents) {
    if (treatmentEvents.length === 0) {
      return { status: 'no_treatments', assessment: 'No treatments recorded' };
    }

    // Simple analysis - look for imaging changes after treatments
    let responseCount = 0;
    let progressionCount = 0;

    treatmentEvents.forEach(treatment => {
      // Find imaging studies after this treatment
      const postTreatmentImaging = imagingEvents.filter(img => 
        img.date > treatment.date
      );

      postTreatmentImaging.forEach(imaging => {
        const findings = imaging.details?.findings?.toLowerCase() || '';
        if (findings.includes('improvement') || findings.includes('response')) {
          responseCount++;
        } else if (findings.includes('progression') || findings.includes('worsening')) {
          progressionCount++;
        }
      });
    });

    let overallResponse = 'stable';
    if (responseCount > progressionCount) {
      overallResponse = 'responding';
    } else if (progressionCount > responseCount) {
      overallResponse = 'progressing';
    }

    return {
      status: 'analyzed',
      overallResponse,
      responseCount,
      progressionCount,
      confidence: responseCount + progressionCount > 0 ? 0.7 : 0.3
    };
  }

  calculateProgressionFreeIntervals(events) {
    const intervals = [];
    let lastProgressionDate = null;
    
    events.forEach(event => {
      if (event.type === 'treatment_start') {
        lastProgressionDate = event.date;
      }
      
      if (event.type === 'imaging' && event.details?.findings) {
        const findings = event.details.findings.toLowerCase();
        if (findings.includes('progression')) {
          if (lastProgressionDate) {
            const intervalDays = Math.floor((event.date - lastProgressionDate) / (1000 * 60 * 60 * 24));
            intervals.push({
              startDate: lastProgressionDate,
              endDate: event.date,
              intervalDays,
              intervalMonths: Math.round(intervalDays / 30)
            });
          }
          lastProgressionDate = event.date;
        }
      }
    });
    
    return {
      intervals,
      medianPFS: this.calculateMedianPFS(intervals),
      totalIntervals: intervals.length
    };
  }

  calculateMedianPFS(intervals) {
    if (intervals.length === 0) return null;
    
    const days = intervals.map(i => i.intervalDays).sort((a, b) => a - b);
    const middle = Math.floor(days.length / 2);
    
    if (days.length % 2 === 0) {
      return (days[middle - 1] + days[middle]) / 2;
    } else {
      return days[middle];
    }
  }

  identifyDiseasePhases(events) {
    const phases = [];
    let currentPhase = null;
    
    events.forEach(event => {
      if (event.type === 'diagnosis') {
        currentPhase = {
          phase: 'diagnosis',
          startDate: event.date,
          events: [event]
        };
      } else if (event.type === 'treatment_start') {
        if (currentPhase) phases.push(currentPhase);
        currentPhase = {
          phase: 'treatment',
          startDate: event.date,
          events: [event]
        };
      } else if (event.type === 'imaging' && event.details?.findings?.toLowerCase().includes('progression')) {
        if (currentPhase) phases.push(currentPhase);
        currentPhase = {
          phase: 'progression',
          startDate: event.date,
          events: [event]
        };
      } else if (currentPhase) {
        currentPhase.events.push(event);
      }
    });
    
    if (currentPhase) phases.push(currentPhase);
    return phases;
  }

  identifyBestResponse(effectiveness) {
    if (effectiveness.length === 0) {
      return { response: 'unknown', confidence: 0 };
    }

    // Find treatment with highest effectiveness score
    const bestTreatment = effectiveness.reduce((best, current) => 
      current.effectiveness > best.effectiveness ? current : best
    );

    let response = 'progressive_disease';
    if (bestTreatment.effectiveness >= 0.8) {
      response = 'complete_response';
    } else if (bestTreatment.effectiveness >= 0.6) {
      response = 'partial_response';
    } else if (bestTreatment.effectiveness >= 0.4) {
      response = 'stable_disease';
    }

    return {
      response,
      effectiveness: bestTreatment.effectiveness,
      treatment: bestTreatment.treatment,
      confidence: bestTreatment.effectiveness
    };
  }

  analyzeTreatmentSequence(effectiveness) {
    if (effectiveness.length <= 1) {
      return { 
        pattern: 'single_treatment',
        description: 'Single treatment regimen',
        sequenceEffectiveness: effectiveness[0]?.effectiveness || 0
      };
    }

    const effectivenessScores = effectiveness.map(e => e.effectiveness);
    let pattern = 'declining';
    
    // Check if effectiveness is improving, declining, or fluctuating
    let improving = 0;
    let declining = 0;

    for (let i = 1; i < effectivenessScores.length; i++) {
      if (effectivenessScores[i] > effectivenessScores[i-1]) improving++;
      else if (effectivenessScores[i] < effectivenessScores[i-1]) declining++;
    }

    if (improving > declining) pattern = 'improving';
    else if (improving === declining) pattern = 'fluctuating';

    return {
      pattern,
      description: this.getSequenceDescription(pattern),
      totalTreatments: effectiveness.length,
      averageEffectiveness: effectivenessScores.reduce((a, b) => a + b, 0) / effectivenessScores.length,
      bestResponse: Math.max(...effectivenessScores),
      worstResponse: Math.min(...effectivenessScores)
    };
  }

  getSequenceDescription(pattern) {
    const descriptions = {
      'improving': 'Treatment effectiveness improving over time',
      'declining': 'Treatment effectiveness declining over time', 
      'fluctuating': 'Variable treatment effectiveness',
      'single_treatment': 'Single treatment approach'
    };
    return descriptions[pattern] || 'Unknown pattern';
  }
}

module.exports = LongitudinalAnalytics;