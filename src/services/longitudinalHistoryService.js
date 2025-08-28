const { format, parseISO, differenceInDays, addDays } = require('date-fns');
const LongitudinalAnalytics = require('./longitudinalAnalytics');

class LongitudinalHistoryService {
  constructor() {
    this.analytics = new LongitudinalAnalytics();
    this.eventTypes = {
      DIAGNOSIS: 'diagnosis',
      SYMPTOM: 'symptom',
      LAB_RESULT: 'lab_result',
      IMAGING: 'imaging',
      PATHOLOGY: 'pathology',
      GENOMICS: 'genomics',
      TREATMENT_START: 'treatment_start',
      TREATMENT_END: 'treatment_end',
      TREATMENT_RESPONSE: 'treatment_response',
      ADMISSION: 'admission',
      DISCHARGE: 'discharge',
      CLINICAL_TRIAL: 'clinical_trial',
      PROGRESSION: 'progression',
      REMISSION: 'remission',
      ADVERSE_EVENT: 'adverse_event',
      FOLLOW_UP: 'follow_up'
    };
  }

  generateComprehensiveLongitudinalHistory(patientData) {
    const events = this.extractAllEvents(patientData);
    const sortedEvents = this.sortEventsByDate(events);
    const enrichedEvents = this.enrichEventsWithContext(sortedEvents);
    const timeline = this.createDetailedTimeline(enrichedEvents);
    const insights = this.generateLongitudinalInsights(enrichedEvents, patientData);
    
    return {
      patientId: patientData.abhaId,
      totalEvents: sortedEvents.length,
      timespan: this.calculateTimespan(sortedEvents),
      timeline,
      insights,
      keyMilestones: this.identifyKeyMilestones(enrichedEvents),
      treatmentJourney: this.mapTreatmentJourney(enrichedEvents),
      diseaseProgression: this.analyzeDiseaseProgression(enrichedEvents),
      careTeamInvolvement: this.mapCareTeamInvolvement(enrichedEvents),
      dataQuality: this.assessDataQuality(sortedEvents, patientData),
      clinicalDecisionPoints: this.identifyClinicalDecisionPoints(enrichedEvents)
    };
  }

  extractAllEvents(patientData) {
    const events = [];
    const baseDate = this.determineBaseDate(patientData);

    // Extract diagnosis events
    if (patientData.cancerType?.diagnosisDate) {
      events.push({
        id: `diagnosis-${Date.now()}`,
        type: this.eventTypes.DIAGNOSIS,
        date: new Date(patientData.cancerType.diagnosisDate),
        title: 'Cancer Diagnosis',
        description: `Diagnosed with ${patientData.cancerType.primary}`,
        details: {
          primary: patientData.cancerType.primary,
          stage: patientData.cancerType.stage,
          histology: patientData.cancerType.histology,
          grade: patientData.cancerType.grade
        },
        source: 'EMR',
        category: 'diagnosis',
        importance: 'critical'
      });
    }

    // Extract medical history events
    patientData.medicalHistory?.forEach((history, index) => {
      const eventDate = new Date(history.date);
      events.push({
        id: `history-${index}`,
        type: history.type === 'diagnosis' ? this.eventTypes.DIAGNOSIS : this.eventTypes.SYMPTOM,
        date: eventDate,
        title: this.formatEventTitle(history.type, history.description),
        description: history.description,
        details: {
          provider: history.provider,
          type: history.type
        },
        source: history.sourceSystem || 'EMR',
        category: 'clinical',
        importance: history.type === 'diagnosis' ? 'high' : 'medium'
      });
    });

    // Extract lab results with timeline interpretation
    patientData.labResults?.forEach((lab, index) => {
      const eventDate = this.parseLabDate(lab.timestamp || lab.testDate);
      
      // Handle multiple observations within a lab result
      if (lab.observations) {
        Object.entries(lab.observations).forEach(([testName, value], obsIndex) => {
          events.push({
            id: `lab-${index}-${obsIndex}`,
            type: this.eventTypes.LAB_RESULT,
            date: eventDate,
            title: `${testName} Result`,
            description: `${testName}: ${value}`,
            details: {
              testName: testName,
              value: value,
              unit: this.getLabUnit(testName),
              timestamp: lab.timestamp,
              abnormal: this.isAbnormalResult({testName, value})
            },
            source: lab.sourceSystem || 'LIS',
            category: 'laboratory',
            importance: this.assessLabImportance(testName, value)
          });
        });
      } else {
        // Handle single observation format
        events.push({
          id: `lab-${index}`,
          type: this.eventTypes.LAB_RESULT,
          date: eventDate,
          title: `${lab.testName} Results`,
          description: `${lab.testName}: ${lab.value} ${lab.unit}`,
          details: {
            testName: lab.testName,
            value: lab.value,
            unit: lab.unit,
            referenceRange: lab.referenceRange,
            interpretation: lab.interpretation,
            abnormal: this.isAbnormalResult(lab)
          },
          source: lab.sourceSystem || 'LIS',
          category: 'laboratory',
          importance: this.isAbnormalResult(lab) ? 'high' : 'low',
          trend: this.calculateLabTrend(lab, patientData.labResults, index)
        });
      }
    });

    // Extract imaging events with detailed findings
    patientData.imaging?.forEach((imaging, index) => {
      const eventDate = new Date(imaging.date || imaging.studyDate);
      events.push({
        id: `imaging-${index}`,
        type: this.eventTypes.IMAGING,
        date: eventDate,
        title: `${imaging.modality} Study`,
        description: imaging.description || `${imaging.modality} imaging study`,
        details: {
          modality: imaging.modality,
          studyId: imaging.studyId,
          findings: imaging.findings,
          bodyRegion: this.extractBodyRegion(imaging.description),
          comparison: this.determineImagingComparison(imaging, patientData.imaging, index)
        },
        source: imaging.sourceSystem || 'PACS',
        category: 'imaging',
        importance: this.assessImagingImportance(imaging),
        imageUrl: imaging.dicomUrl
      });
    });

    // Extract pathology events
    patientData.pathologyReports?.forEach((report, index) => {
      const collectionDate = new Date(report.collectionDate);
      const reportDate = new Date(report.reportDate);
      
      // Collection event
      events.push({
        id: `pathology-collection-${index}`,
        type: this.eventTypes.PATHOLOGY,
        date: collectionDate,
        title: 'Tissue Sample Collection',
        description: `${report.specimenType} collected for pathological analysis`,
        details: {
          specimenType: report.specimenType,
          reportId: report.reportId,
          phase: 'collection'
        },
        source: report.sourceSystem || 'PATHOLOGY',
        category: 'pathology',
        importance: 'medium'
      });

      // Report event
      events.push({
        id: `pathology-report-${index}`,
        type: this.eventTypes.PATHOLOGY,
        date: reportDate,
        title: 'Pathology Report Available',
        description: report.diagnosis,
        details: {
          specimenType: report.specimenType,
          findings: report.findings,
          diagnosis: report.diagnosis,
          reportId: report.reportId,
          phase: 'report',
          processingTime: differenceInDays(reportDate, collectionDate)
        },
        source: report.sourceSystem || 'PATHOLOGY',
        category: 'pathology',
        importance: 'high'
      });
    });

    // Extract genomics events
    if (patientData.genomics?.reportDate) {
      events.push({
        id: `genomics-${Date.now()}`,
        type: this.eventTypes.GENOMICS,
        date: new Date(patientData.genomics.reportDate),
        title: 'Genomic Profile Available',
        description: `Molecular analysis completed - ${patientData.genomics.mutationProfile?.length || 0} mutations identified`,
        details: {
          mutations: patientData.genomics.mutationProfile,
          tmb: patientData.genomics.tmb,
          msi: patientData.genomics.msi,
          actionableMutations: this.identifyActionableMutations(patientData.genomics.mutationProfile)
        },
        source: 'GENOMICS',
        category: 'molecular',
        importance: 'high'
      });
    }

    // Extract treatment events
    patientData.treatments?.forEach((treatment, index) => {
      const startDate = new Date(treatment.startDate);
      
      // Treatment start event
      events.push({
        id: `treatment-start-${index}`,
        type: this.eventTypes.TREATMENT_START,
        date: startDate,
        title: `${this.formatTreatmentType(treatment.type)} Started`,
        description: `Initiated ${treatment.regimen}`,
        details: {
          treatmentId: treatment.treatmentId,
          type: treatment.type,
          regimen: treatment.regimen,
          intent: this.determineTreatmentIntent(treatment, patientData),
          line: this.determineTreatmentLine(treatment, patientData.treatments, index)
        },
        source: treatment.sourceSystem || 'EMR',
        category: 'treatment',
        importance: 'critical'
      });

      // Treatment end event (if applicable)
      if (treatment.endDate) {
        const endDate = new Date(treatment.endDate);
        events.push({
          id: `treatment-end-${index}`,
          type: this.eventTypes.TREATMENT_END,
          date: endDate,
          title: `${this.formatTreatmentType(treatment.type)} Completed`,
          description: `Completed ${treatment.regimen} - ${treatment.response}`,
          details: {
            treatmentId: treatment.treatmentId,
            type: treatment.type,
            regimen: treatment.regimen,
            response: treatment.response,
            duration: differenceInDays(endDate, startDate),
            adverseEvents: treatment.adverseEvents
          },
          source: treatment.sourceSystem || 'EMR',
          category: 'treatment',
          importance: 'high'
        });
      }

      // Add adverse events
      treatment.adverseEvents?.forEach((ae, aeIndex) => {
        const aeDate = addDays(startDate, Math.floor(Math.random() * 30) + 7); // Simulate AE timing
        events.push({
          id: `adverse-event-${index}-${aeIndex}`,
          type: this.eventTypes.ADVERSE_EVENT,
          date: aeDate,
          title: 'Adverse Event Reported',
          description: ae,
          details: {
            treatmentId: treatment.treatmentId,
            event: ae,
            severity: this.estimateAESeverity(ae),
            action: 'monitoring'
          },
          source: treatment.sourceSystem || 'EMR',
          category: 'safety',
          importance: 'medium'
        });
      });
    });

    // Extract clinical trial events
    patientData.clinicalTrials?.forEach((trial, index) => {
      events.push({
        id: `trial-${index}`,
        type: this.eventTypes.CLINICAL_TRIAL,
        date: new Date(trial.enrollmentDate),
        title: 'Clinical Trial Enrollment',
        description: `Enrolled in ${trial.trialName}`,
        details: {
          trialId: trial.trialId,
          trialName: trial.trialName,
          status: trial.status,
          arm: trial.arm,
          phase: this.extractTrialPhase(trial.trialName)
        },
        source: 'CLINICAL_TRIALS',
        category: 'research',
        importance: 'high'
      });
    });

    return events;
  }

  sortEventsByDate(events) {
    return events.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  enrichEventsWithContext(events) {
    return events.map((event, index) => {
      const enrichedEvent = { ...event };
      
      // Add temporal context
      enrichedEvent.dayFromDiagnosis = this.calculateDaysFromDiagnosis(event, events);
      enrichedEvent.sequentialIndex = index;
      
      // Add related events
      enrichedEvent.relatedEvents = this.findRelatedEvents(event, events, index);
      
      // Add clinical context
      enrichedEvent.clinicalPhase = this.determineClinicalPhase(event, events, index);
      
      // Add trend information
      enrichedEvent.trend = this.calculateEventTrend(event, events, index);
      
      return enrichedEvent;
    });
  }

  createDetailedTimeline(events) {
    const groupedEvents = this.groupEventsByPeriod(events);
    
    return Object.entries(groupedEvents).map(([period, periodEvents]) => ({
      period,
      periodType: this.determinePeriodType(period),
      eventCount: periodEvents.length,
      events: periodEvents.map(event => ({
        ...event,
        relativeTime: this.calculateRelativeTime(event.date, periodEvents[0].date),
        clinicalSignificance: this.assessClinicalSignificance(event, periodEvents)
      })),
      summary: this.generatePeriodSummary(periodEvents),
      keyFindings: this.extractKeyFindingsFromPeriod(periodEvents),
      clinicalDecisions: this.identifyPeriodDecisions(periodEvents)
    }));
  }

  generateLongitudinalInsights(events, patientData) {
    return {
      diseaseTrajectory: this.analytics.analyzeDiseaseTrajectory(events),
      treatmentEffectiveness: this.analytics.analyzeTreatmentEffectiveness(events),
      careCoordination: this.analyzeCareCoordination(events),
      dataCompleteness: this.analyzeDataCompleteness(events, patientData),
      riskFactors: this.identifyRiskFactors(events, patientData),
      prognosticIndicators: this.identifyPrognosticIndicators(events, patientData),
      qualityMetrics: this.calculateQualityMetrics(events),
      careContinuity: this.assessCareContinuity(events),
      outcomesPrediction: this.analytics.generateOutcomesPrediction(events, patientData)
    };
  }

  identifyKeyMilestones(events) {
    const milestones = events.filter(event => 
      event.importance === 'critical' || 
      event.type === this.eventTypes.DIAGNOSIS ||
      event.type === this.eventTypes.TREATMENT_START ||
      event.type === this.eventTypes.GENOMICS ||
      event.type === this.eventTypes.CLINICAL_TRIAL
    );

    return milestones.map(milestone => ({
      ...milestone,
      milestone: true,
      impact: this.assessMilestoneImpact(milestone, events),
      clinicalRationale: this.generateMilestoneRationale(milestone)
    }));
  }

  mapTreatmentJourney(events) {
    const treatmentEvents = events.filter(event => 
      event.category === 'treatment' || 
      event.type === this.eventTypes.TREATMENT_RESPONSE
    );

    const treatments = [];
    let currentTreatment = null;

    treatmentEvents.forEach(event => {
      if (event.type === this.eventTypes.TREATMENT_START) {
        currentTreatment = {
          startEvent: event,
          endEvent: null,
          responses: [],
          adverseEvents: [],
          duration: null,
          outcome: null
        };
        treatments.push(currentTreatment);
      } else if (event.type === this.eventTypes.TREATMENT_END && currentTreatment) {
        currentTreatment.endEvent = event;
        currentTreatment.duration = differenceInDays(event.date, currentTreatment.startEvent.date);
        currentTreatment.outcome = event.details.response;
      } else if (event.type === this.eventTypes.ADVERSE_EVENT && currentTreatment) {
        currentTreatment.adverseEvents.push(event);
      }
    });

    return {
      treatments,
      totalTreatments: treatments.length,
      treatmentLines: this.calculateTreatmentLines(treatments),
      treatmentTypes: [...new Set(treatments.map(t => t.startEvent.details.type))],
      averageDuration: this.calculateAverageTreatmentDuration(treatments),
      responseRates: this.calculateResponseRates(treatments)
    };
  }

  analyzeDiseaseProgression(events) {
    const imagingEvents = events.filter(e => e.type === this.eventTypes.IMAGING);
    const labEvents = events.filter(e => e.type === this.eventTypes.LAB_RESULT);
    
    return {
      imagingProgression: this.analyzeImagingProgression(imagingEvents),
      biomarkerProgression: this.analyzeBiomarkerProgression(labEvents),
      overallTrajectory: this.determineOverallTrajectory(events),
      progressionEvents: this.identifyProgressionEvents(events),
      stablePeriodsAnalysis: this.identifyStablePeriods(events)
    };
  }

  // Helper methods for event processing
  determineBaseDate(patientData) {
    const dates = [];
    
    if (patientData.cancerType?.diagnosisDate) {
      dates.push(new Date(patientData.cancerType.diagnosisDate));
    }
    
    patientData.medicalHistory?.forEach(h => dates.push(new Date(h.date)));
    
    return dates.length > 0 ? new Date(Math.min(...dates)) : new Date();
  }

  formatEventTitle(type, description) {
    const titles = {
      'symptom': 'Symptom Report',
      'diagnosis': 'Clinical Diagnosis',
      'admission': 'Hospital Admission',
      'discharge': 'Hospital Discharge',
      'follow_up': 'Follow-up Visit'
    };
    return titles[type] || description;
  }

  isAbnormalResult(lab) {
    if (!lab.interpretation) return false;
    const abnormalKeywords = ['high', 'low', 'elevated', 'decreased', 'abnormal', 'positive'];
    return abnormalKeywords.some(keyword => 
      lab.interpretation.toLowerCase().includes(keyword)
    );
  }

  calculateLabTrend(currentLab, allLabs, currentIndex) {
    if (currentIndex === 0) return 'baseline';
    
    const previousLab = allLabs[currentIndex - 1];
    if (previousLab.testName !== currentLab.testName) return 'new';
    
    const currentValue = parseFloat(currentLab.value);
    const previousValue = parseFloat(previousLab.value);
    
    if (isNaN(currentValue) || isNaN(previousValue)) return 'stable';
    
    const changePercent = ((currentValue - previousValue) / previousValue) * 100;
    
    if (changePercent > 20) return 'increasing';
    if (changePercent < -20) return 'decreasing';
    return 'stable';
  }

  extractBodyRegion(description) {
    const regions = {
      'head': ['head', 'brain', 'skull', 'cranial'],
      'neck': ['neck', 'cervical', 'throat'],
      'chest': ['chest', 'thorax', 'lung', 'pulmonary'],
      'abdomen': ['abdomen', 'abdominal', 'liver', 'kidney'],
      'pelvis': ['pelvis', 'pelvic', 'bladder'],
      'extremities': ['arm', 'leg', 'extremity']
    };

    const desc = description?.toLowerCase() || '';
    for (const [region, keywords] of Object.entries(regions)) {
      if (keywords.some(keyword => desc.includes(keyword))) {
        return region;
      }
    }
    return 'unspecified';
  }

  assessImagingImportance(imaging) {
    if (!imaging.findings) return 'medium';
    
    const findings = imaging.findings.toLowerCase();
    const highImportanceKeywords = ['mass', 'tumor', 'metastas', 'progression', 'recurrence', 'new'];
    const mediumImportanceKeywords = ['stable', 'unchanged', 'improvement'];
    
    if (highImportanceKeywords.some(keyword => findings.includes(keyword))) {
      return 'high';
    }
    if (mediumImportanceKeywords.some(keyword => findings.includes(keyword))) {
      return 'medium';
    }
    return 'low';
  }

  identifyActionableMutations(mutations) {
    if (!mutations) return [];
    
    const actionableGenes = ['EGFR', 'ALK', 'ROS1', 'BRAF', 'HER2', 'MET', 'RET', 'NTRK', 'BRCA1', 'BRCA2'];
    
    return mutations.filter(mutation => 
      actionableGenes.includes(mutation.gene)
    ).map(mutation => ({
      ...mutation,
      therapyOptions: this.getTherapyOptions(mutation.gene)
    }));
  }

  getTherapyOptions(gene) {
    const therapies = {
      'EGFR': ['Osimertinib', 'Erlotinib', 'Gefitinib'],
      'ALK': ['Alectinib', 'Crizotinib', 'Brigatinib'],
      'BRAF': ['Dabrafenib + Trametinib'],
      'HER2': ['Trastuzumab', 'Pertuzumab'],
      'BRCA1': ['PARP inhibitors', 'Platinum-based therapy'],
      'BRCA2': ['PARP inhibitors', 'Platinum-based therapy']
    };
    return therapies[gene] || [];
  }

  formatTreatmentType(type) {
    const formatted = {
      'chemotherapy': 'Chemotherapy',
      'radiation': 'Radiation Therapy',
      'surgery': 'Surgical Intervention',
      'immunotherapy': 'Immunotherapy',
      'targeted_therapy': 'Targeted Therapy',
      'hormone_therapy': 'Hormone Therapy'
    };
    return formatted[type] || type.charAt(0).toUpperCase() + type.slice(1);
  }

  determineTreatmentIntent(treatment, patientData) {
    const stage = patientData.cancerType?.stage;
    if (!stage) return 'unknown';
    
    if (stage.includes('IV') || stage.includes('M1')) return 'palliative';
    if (stage.includes('III')) return 'curative';
    if (stage.includes('II')) return 'curative';
    if (stage.includes('I')) return 'curative';
    return 'unknown';
  }

  determineTreatmentLine(treatment, allTreatments, currentIndex) {
    return currentIndex + 1; // Simple line numbering
  }

  estimateAESeverity(adverseEvent) {
    const severeAEs = ['neutropenia', 'thrombocytopenia', 'anemia', 'neuropathy'];
    const moderateAEs = ['nausea', 'fatigue', 'diarrhea', 'rash'];
    
    const ae = adverseEvent.toLowerCase();
    if (severeAEs.some(severe => ae.includes(severe))) return 'severe';
    if (moderateAEs.some(moderate => ae.includes(moderate))) return 'moderate';
    return 'mild';
  }

  extractTrialPhase(trialName) {
    const phaseMatch = trialName.match(/phase\s+(i{1,3}|[1-3])/i);
    return phaseMatch ? phaseMatch[1].toUpperCase() : 'Unknown';
  }

  calculateDaysFromDiagnosis(event, allEvents) {
    const diagnosisEvent = allEvents.find(e => e.type === this.eventTypes.DIAGNOSIS);
    if (!diagnosisEvent) return 0;
    
    return differenceInDays(event.date, diagnosisEvent.date);
  }

  findRelatedEvents(event, allEvents, currentIndex) {
    const related = [];
    const timeWindow = 7; // 7 days
    
    allEvents.forEach((otherEvent, otherIndex) => {
      if (otherIndex === currentIndex) return;
      
      const daysDiff = Math.abs(differenceInDays(event.date, otherEvent.date));
      if (daysDiff <= timeWindow) {
        related.push({
          eventId: otherEvent.id,
          type: otherEvent.type,
          daysDifference: daysDiff,
          relationship: this.determineEventRelationship(event, otherEvent)
        });
      }
    });
    
    return related;
  }

  determineEventRelationship(event1, event2) {
    // Define relationships between different event types
    const relationships = {
      'lab_result-treatment_start': 'pre_treatment_assessment',
      'imaging-treatment_start': 'staging',
      'pathology-treatment_start': 'diagnostic_confirmation',
      'treatment_start-adverse_event': 'treatment_toxicity',
      'imaging-treatment_end': 'response_assessment'
    };
    
    const key = `${event1.type}-${event2.type}`;
    return relationships[key] || 'temporal_proximity';
  }

  determineClinicalPhase(event, allEvents, currentIndex) {
    const diagnosisEvent = allEvents.find(e => e.type === this.eventTypes.DIAGNOSIS);
    if (!diagnosisEvent) return 'unknown';
    
    const daysFromDiagnosis = differenceInDays(event.date, diagnosisEvent.date);
    
    if (daysFromDiagnosis < 0) return 'pre_diagnosis';
    if (daysFromDiagnosis <= 30) return 'initial_workup';
    if (daysFromDiagnosis <= 90) return 'primary_treatment';
    if (daysFromDiagnosis <= 365) return 'active_treatment';
    return 'long_term_follow_up';
  }

  calculateEventTrend(event, allEvents, currentIndex) {
    if (event.type !== this.eventTypes.LAB_RESULT) return null;
    
    const sameTestEvents = allEvents.filter(e => 
      e.type === this.eventTypes.LAB_RESULT && 
      e.details.testName === event.details.testName
    );
    
    const currentEventIndex = sameTestEvents.findIndex(e => e.id === event.id);
    if (currentEventIndex <= 0) return 'baseline';
    
    const previousEvent = sameTestEvents[currentEventIndex - 1];
    const currentValue = parseFloat(event.details.value);
    const previousValue = parseFloat(previousEvent.details.value);
    
    if (isNaN(currentValue) || isNaN(previousValue)) return 'stable';
    
    const changePercent = ((currentValue - previousValue) / previousValue) * 100;
    
    if (changePercent > 10) return 'improving';
    if (changePercent < -10) return 'declining';
    return 'stable';
  }

  groupEventsByPeriod(events) {
    const grouped = {};
    
    events.forEach(event => {
      const monthYear = format(event.date, 'MMMM yyyy');
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(event);
    });
    
    return grouped;
  }

  calculateTimespan(events) {
    if (events.length === 0) return null;
    
    const firstEvent = events[0];
    const lastEvent = events[events.length - 1];
    
    return {
      startDate: firstEvent.date,
      endDate: lastEvent.date,
      totalDays: differenceInDays(lastEvent.date, firstEvent.date),
      totalMonths: Math.round(differenceInDays(lastEvent.date, firstEvent.date) / 30)
    };
  }

  // Export functionality
  exportLongitudinalHistory(history, format = 'json') {
    switch (format) {
      case 'json':
        return JSON.stringify(history, null, 2);
      case 'csv':
        return this.convertToCSV(history);
      case 'timeline':
        return this.generateTimelineHTML(history);
      default:
        return history;
    }
  }

  convertToCSV(history) {
    const headers = ['Date', 'Type', 'Title', 'Description', 'Category', 'Importance', 'Source'];
    const rows = [headers.join(',')];
    
    history.timeline.forEach(period => {
      period.events.forEach(event => {
        const row = [
          format(event.date, 'yyyy-MM-dd'),
          event.type,
          `"${event.title}"`,
          `"${event.description}"`,
          event.category,
          event.importance,
          event.source
        ];
        rows.push(row.join(','));
      });
    });
    
    return rows.join('\n');
  }

  generateTimelineHTML(history) {
    let html = `
      <div class="longitudinal-timeline">
        <h2>Longitudinal Patient History: ${history.patientId}</h2>
        <div class="timeline-stats">
          <p>Total Events: ${history.totalEvents}</p>
          <p>Timespan: ${history.timespan?.totalMonths} months</p>
        </div>
    `;
    
    history.timeline.forEach(period => {
      html += `
        <div class="timeline-period">
          <h3>${period.period}</h3>
          <div class="period-summary">${period.summary}</div>
      `;
      
      period.events.forEach(event => {
        html += `
          <div class="timeline-event ${event.importance}">
            <div class="event-date">${format(event.date, 'MMM dd, yyyy')}</div>
            <div class="event-content">
              <h4>${event.title}</h4>
              <p>${event.description}</p>
              <div class="event-meta">
                <span class="event-type">${event.type}</span>
                <span class="event-source">${event.source}</span>
              </div>
            </div>
          </div>
        `;
      });
      
      html += '</div>';
    });
    
    html += '</div>';
    return html;
  }

  // Additional helper methods
  determinePeriodType(period) {
    const [month, year] = period.split(' ');
    const date = new Date(`${month} 1, ${year}`);
    const now = new Date();
    const monthsAgo = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
    
    if (monthsAgo <= 1) return 'current';
    if (monthsAgo <= 6) return 'recent';
    if (monthsAgo <= 12) return 'past_year';
    return 'historical';
  }

  calculateRelativeTime(eventDate, periodStartDate) {
    const days = differenceInDays(eventDate, periodStartDate);
    if (days === 0) return 'same_day';
    if (days <= 7) return 'same_week';
    if (days <= 14) return 'mid_month';
    return 'late_month';
  }

  assessClinicalSignificance(event, periodEvents) {
    // Assess significance based on event type and context
    if (event.importance === 'critical') return 'high';
    
    const relatedEvents = periodEvents.filter(e => 
      e.category === event.category && e.id !== event.id
    );
    
    if (relatedEvents.length > 2) return 'high'; // Multiple related events
    if (event.type === 'imaging' || event.type === 'pathology') return 'medium';
    return 'low';
  }

  generatePeriodSummary(events) {
    const categories = [...new Set(events.map(e => e.category))];
    const criticalEvents = events.filter(e => e.importance === 'critical').length;
    
    let summary = `${events.length} events across ${categories.length} categories`;
    if (criticalEvents > 0) {
      summary += ` (${criticalEvents} critical)`;
    }
    return summary;
  }

  extractKeyFindingsFromPeriod(events) {
    return events
      .filter(e => e.importance === 'high' || e.importance === 'critical')
      .map(e => e.title)
      .slice(0, 3);
  }

  identifyPeriodDecisions(events) {
    const decisions = [];
    
    const treatmentStarts = events.filter(e => e.type === 'treatment_start');
    treatmentStarts.forEach(t => {
      decisions.push({
        type: 'treatment_initiation',
        description: `Started ${t.details?.regimen}`,
        rationale: 'Based on staging and molecular profile'
      });
    });
    
    return decisions;
  }

  analyzeCareCoordination(events) {
    const sources = [...new Set(events.map(e => e.source))];
    const sourceInteractions = this.calculateSourceInteractions(events);
    
    return {
      dataSources: sources.length,
      sourceTypes: sources,
      interactions: sourceInteractions,
      coordinationScore: this.calculateCoordinationScore(sourceInteractions),
      gaps: this.identifyCoordinationGaps(events)
    };
  }

  calculateSourceInteractions(events) {
    const interactions = {};
    const sources = [...new Set(events.map(e => e.source))];
    
    sources.forEach(source1 => {
      sources.forEach(source2 => {
        if (source1 !== source2) {
          const key = `${source1}-${source2}`;
          interactions[key] = this.countTemporalProximity(events, source1, source2);
        }
      });
    });
    
    return interactions;
  }

  countTemporalProximity(events, source1, source2) {
    let count = 0;
    const source1Events = events.filter(e => e.source === source1);
    const source2Events = events.filter(e => e.source === source2);
    
    source1Events.forEach(e1 => {
      source2Events.forEach(e2 => {
        const daysDiff = Math.abs(differenceInDays(e1.date, e2.date));
        if (daysDiff <= 7) count++; // Within a week
      });
    });
    
    return count;
  }

  calculateCoordinationScore(interactions) {
    const values = Object.values(interactions);
    const totalInteractions = values.reduce((sum, val) => sum + val, 0);
    const maxPossible = values.length * 10; // Assume max 10 interactions per pair
    
    return Math.min(1, totalInteractions / maxPossible);
  }

  identifyCoordinationGaps(events) {
    const gaps = [];
    
    // Look for long periods without events
    for (let i = 1; i < events.length; i++) {
      const daysBetween = differenceInDays(events[i].date, events[i-1].date);
      if (daysBetween > 30) {
        gaps.push({
          type: 'temporal_gap',
          duration: daysBetween,
          startDate: events[i-1].date,
          endDate: events[i].date
        });
      }
    }
    
    return gaps;
  }

  analyzeDataCompleteness(events, patientData) {
    const expectedSources = ['EMR', 'PACS', 'LIS', 'PATHOLOGY', 'GENOMICS'];
    const actualSources = [...new Set(events.map(e => e.source))];
    const completenessRatio = actualSources.length / expectedSources.length;
    
    const missingDataTypes = this.identifyMissingDataTypes(events, patientData);
    
    return {
      completenessRatio,
      availableSources: actualSources,
      missingSources: expectedSources.filter(s => !actualSources.includes(s)),
      missingDataTypes,
      dataQualityScore: this.calculateDataQualityScore(events, patientData)
    };
  }

  identifyMissingDataTypes(events, patientData) {
    const missing = [];
    
    if (!events.find(e => e.type === 'imaging')) missing.push('imaging_studies');
    if (!events.find(e => e.type === 'lab_result')) missing.push('laboratory_results');
    if (!events.find(e => e.type === 'pathology')) missing.push('pathology_reports');
    if (!patientData.genomics?.mutationProfile?.length) missing.push('genomic_data');
    
    return missing;
  }

  calculateDataQualityScore(events, patientData) {
    let score = 0.5; // Base score
    
    // Bonus for complete data types
    if (events.find(e => e.type === 'imaging')) score += 0.1;
    if (events.find(e => e.type === 'lab_result')) score += 0.1;
    if (events.find(e => e.type === 'pathology')) score += 0.1;
    if (patientData.genomics?.mutationProfile?.length) score += 0.1;
    
    // Bonus for data richness
    const avgDetails = events.reduce((sum, e) => sum + Object.keys(e.details || {}).length, 0) / events.length;
    score += Math.min(0.2, avgDetails / 10);
    
    return Math.min(1, score);
  }

  identifyRiskFactors(events, patientData) {
    const riskFactors = [];
    
    // Age-related risk
    const age = this.calculateAge(patientData.demographics?.dateOfBirth);
    if (age && age > 65) {
      riskFactors.push({
        factor: 'Advanced Age',
        value: age,
        risk: 'moderate',
        impact: 'Increased treatment toxicity risk'
      });
    }
    
    // Stage-related risk
    const stage = patientData.cancerType?.stage;
    if (stage?.includes('IV')) {
      riskFactors.push({
        factor: 'Metastatic Disease',
        value: stage,
        risk: 'high',
        impact: 'Poor prognosis, limited treatment options'
      });
    }
    
    // Treatment-related risk
    const adverseEvents = events.filter(e => e.type === 'adverse_event');
    if (adverseEvents.length > 5) {
      riskFactors.push({
        factor: 'Multiple Adverse Events',
        value: adverseEvents.length,
        risk: 'moderate',
        impact: 'Treatment tolerance concerns'
      });
    }
    
    return riskFactors;
  }

  identifyPrognosticIndicators(events, patientData) {
    const indicators = [];
    
    // Response to treatment
    const responseEvents = events.filter(e => 
      e.type === 'treatment_end' && e.details?.response
    );
    
    responseEvents.forEach(event => {
      const response = event.details.response.toLowerCase();
      if (response.includes('complete')) {
        indicators.push({
          indicator: 'Complete Response',
          prognostic: 'favorable',
          strength: 'high',
          evidence: event.description
        });
      } else if (response.includes('partial')) {
        indicators.push({
          indicator: 'Partial Response',
          prognostic: 'favorable',
          strength: 'moderate',
          evidence: event.description
        });
      }
    });
    
    // Molecular markers
    if (patientData.genomics?.mutationProfile) {
      const actionableMutations = patientData.genomics.mutationProfile.filter(m =>
        ['EGFR', 'ALK', 'ROS1', 'BRAF', 'HER2'].includes(m.gene)
      );
      
      if (actionableMutations.length > 0) {
        indicators.push({
          indicator: 'Actionable Mutations',
          prognostic: 'favorable',
          strength: 'moderate',
          evidence: `${actionableMutations.length} targetable mutations identified`
        });
      }
    }
    
    return indicators;
  }

  calculateQualityMetrics(events) {
    return {
      temporalConsistency: this.assessTemporalConsistency(events),
      dataCompleteness: this.assessEventDataCompleteness(events),
      sourceReliability: this.assessSourceReliability(events),
      clinicalRelevance: this.assessClinicalRelevance(events)
    };
  }

  assessTemporalConsistency(events) {
    let inconsistencies = 0;
    
    for (let i = 1; i < events.length; i++) {
      const current = events[i];
      const previous = events[i-1];
      
      // Check for logical temporal order
      if (current.type === 'treatment_end' && previous.type === 'treatment_start') {
        if (current.details?.treatmentId === previous.details?.treatmentId) {
          // This is expected
          continue;
        }
      }
      
      // Check for impossible sequences
      if (current.date < previous.date) {
        inconsistencies++;
      }
    }
    
    return {
      score: Math.max(0, 1 - (inconsistencies / events.length)),
      inconsistencies
    };
  }

  assessEventDataCompleteness(events) {
    const completeEvents = events.filter(e => 
      e.title && e.description && e.details && Object.keys(e.details).length > 0
    );
    
    return {
      score: completeEvents.length / events.length,
      completeEvents: completeEvents.length,
      totalEvents: events.length
    };
  }

  assessSourceReliability(events) {
    const sourceScores = {
      'EMR': 0.9,
      'PACS': 0.95,
      'LIS': 0.85,
      'PATHOLOGY': 0.9,
      'GENOMICS': 0.8
    };
    
    let totalScore = 0;
    let totalEvents = 0;
    
    events.forEach(event => {
      const score = sourceScores[event.source] || 0.5;
      totalScore += score;
      totalEvents++;
    });
    
    return {
      score: totalEvents > 0 ? totalScore / totalEvents : 0,
      sourceBreakdown: this.calculateSourceBreakdown(events, sourceScores)
    };
  }

  calculateSourceBreakdown(events, sourceScores) {
    const breakdown = {};
    
    events.forEach(event => {
      if (!breakdown[event.source]) {
        breakdown[event.source] = {
          count: 0,
          reliability: sourceScores[event.source] || 0.5
        };
      }
      breakdown[event.source].count++;
    });
    
    return breakdown;
  }

  assessClinicalRelevance(events) {
    const clinicallyRelevant = events.filter(e => 
      e.importance === 'high' || e.importance === 'critical' ||
      e.category === 'treatment' || e.category === 'diagnosis'
    );
    
    return {
      score: clinicallyRelevant.length / events.length,
      relevantEvents: clinicallyRelevant.length,
      totalEvents: events.length
    };
  }

  assessCareContinuity(events) {
    const careGaps = this.identifyCoordinationGaps(events);
    const providerChanges = this.identifyProviderChanges(events);
    
    return {
      continuityScore: Math.max(0, 1 - (careGaps.length * 0.1)),
      careGaps: careGaps.length,
      providerChanges: providerChanges.length,
      averageGapDuration: careGaps.length > 0 ? 
        careGaps.reduce((sum, gap) => sum + gap.duration, 0) / careGaps.length : 0
    };
  }

  identifyProviderChanges(events) {
    const providers = [];
    const changes = [];
    
    events.forEach(event => {
      const provider = event.details?.provider;
      if (provider && !providers.includes(provider)) {
        providers.push(provider);
        if (providers.length > 1) {
          changes.push({
            date: event.date,
            from: providers[providers.length - 2],
            to: provider
          });
        }
      }
    });
    
    return changes;
  }

  calculateAge(dateOfBirth) {
    if (!dateOfBirth) return null;
    const birth = new Date(dateOfBirth);
    const now = new Date();
    return now.getFullYear() - birth.getFullYear();
  }

  assessMilestoneImpact(milestone, allEvents) {
    // Assess how this milestone affected subsequent events
    const subsequentEvents = allEvents.filter(e => e.date > milestone.date);
    const impactPeriod = subsequentEvents.slice(0, 5); // Next 5 events
    
    let impactScore = 0;
    impactPeriod.forEach(event => {
      if (event.importance === 'critical') impactScore += 0.3;
      else if (event.importance === 'high') impactScore += 0.2;
      else impactScore += 0.1;
    });
    
    return {
      score: Math.min(1, impactScore),
      affectedEvents: impactPeriod.length,
      impactType: milestone.type === 'diagnosis' ? 'diagnostic' : 
                 milestone.type === 'treatment_start' ? 'therapeutic' : 'other'
    };
  }

  generateMilestoneRationale(milestone) {
    const rationales = {
      'diagnosis': 'Critical for treatment planning and prognosis',
      'treatment_start': 'Marks beginning of therapeutic intervention',
      'genomics': 'Enables precision medicine approach',
      'clinical_trial': 'Access to experimental therapies',
      'treatment_end': 'Assessment of treatment efficacy'
    };
    
    return rationales[milestone.type] || 'Significant clinical event';
  }

  calculateTreatmentLines(treatments) {
    let lines = {};
    treatments.forEach((treatment, index) => {
      const line = treatment.startEvent.details?.line || (index + 1);
      if (!lines[line]) lines[line] = [];
      lines[line].push(treatment);
    });
    return lines;
  }

  calculateAverageTreatmentDuration(treatments) {
    const completedTreatments = treatments.filter(t => t.duration !== null);
    if (completedTreatments.length === 0) return 0;
    
    const totalDuration = completedTreatments.reduce((sum, t) => sum + t.duration, 0);
    return totalDuration / completedTreatments.length;
  }

  calculateResponseRates(treatments) {
    const treatementsWithResponse = treatments.filter(t => t.outcome);
    if (treatementsWithResponse.length === 0) return {};
    
    const responses = {};
    treatementsWithResponse.forEach(t => {
      const response = t.outcome.toLowerCase();
      if (!responses[response]) responses[response] = 0;
      responses[response]++;
    });
    
    // Convert to percentages
    Object.keys(responses).forEach(response => {
      responses[response] = (responses[response] / treatementsWithResponse.length) * 100;
    });
    
    return responses;
  }

  determineImagingComparison(currentImaging, allImaging, currentIndex) {
    if (!allImaging || currentIndex === 0) {
      return { status: 'baseline', description: 'Baseline study' };
    }
    
    const previousImaging = allImaging[currentIndex - 1];
    if (!previousImaging) {
      return { status: 'no_comparison', description: 'No prior study for comparison' };
    }
    
    const currentFindings = currentImaging.findings?.toLowerCase() || '';
    const previousFindings = previousImaging.findings?.toLowerCase() || '';
    
    // Simple keyword-based comparison
    const progressionKeywords = ['progression', 'increase', 'enlargement', 'new', 'worsening'];
    const improvementKeywords = ['improvement', 'reduction', 'decrease', 'response', 'resolution'];
    const stableKeywords = ['stable', 'unchanged', 'similar', 'no change'];
    
    if (progressionKeywords.some(keyword => currentFindings.includes(keyword))) {
      return { 
        status: 'progression', 
        description: 'Imaging shows disease progression compared to prior study',
        confidence: 0.8
      };
    } else if (improvementKeywords.some(keyword => currentFindings.includes(keyword))) {
      return { 
        status: 'improvement', 
        description: 'Imaging shows improvement compared to prior study',
        confidence: 0.8
      };
    } else if (stableKeywords.some(keyword => currentFindings.includes(keyword))) {
      return { 
        status: 'stable', 
        description: 'Imaging shows stable disease compared to prior study',
        confidence: 0.9
      };
    }
    
    return { 
      status: 'indeterminate', 
      description: 'Unable to determine comparison with prior study',
      confidence: 0.3
    };
  }

  parseLabDate(timestamp) {
    if (!timestamp) return new Date();
    
    // Handle "day_X" format
    if (typeof timestamp === 'string' && timestamp.includes('day_')) {
      const dayNumber = parseInt(timestamp.replace('day_', ''));
      const baseDate = new Date('2024-01-01'); // Use a base date
      baseDate.setDate(baseDate.getDate() + dayNumber);
      return baseDate;
    }
    
    // Handle standard date formats
    return new Date(timestamp);
  }

  getLabUnit(testName) {
    const units = {
      'RBC': '10^6/μL',
      'WBC': '10^3/μL', 
      'Platelets': '10^3/μL',
      'CA-125': 'U/mL',
      'Hemoglobin': 'g/dL',
      'Hematocrit': '%',
      'Squamous Cell Carcinoma Antigen': 'ng/mL'
    };
    return units[testName] || '';
  }

  assessLabImportance(testName, value) {
    // Tumor markers are high importance
    if (testName.includes('CA-') || testName.includes('Antigen')) {
      return 'high';
    }
    
    // Blood counts are medium importance
    if (['RBC', 'WBC', 'Platelets', 'Hemoglobin'].includes(testName)) {
      return 'medium';
    }
    
    return 'low';
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
}

module.exports = LongitudinalHistoryService;