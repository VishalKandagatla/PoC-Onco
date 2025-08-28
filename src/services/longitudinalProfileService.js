const { format } = require('date-fns');

class LongitudinalProfileService {
  generateTimeline(patientData) {
    const events = [];

    if (patientData.cancerType?.diagnosisDate) {
      events.push({
        date: patientData.cancerType.diagnosisDate,
        type: 'diagnosis',
        category: 'clinical',
        title: 'Cancer Diagnosis',
        description: `${patientData.cancerType.primary} - Stage ${patientData.cancerType.stage}`,
        details: {
          histology: patientData.cancerType.histology,
          grade: patientData.cancerType.grade
        }
      });
    }

    patientData.medicalHistory?.forEach(history => {
      events.push({
        date: history.date,
        type: history.type,
        category: 'clinical',
        title: history.type.charAt(0).toUpperCase() + history.type.slice(1),
        description: history.description,
        provider: history.provider,
        source: history.sourceSystem
      });
    });

    patientData.imaging?.forEach(imaging => {
      events.push({
        date: imaging.studyDate,
        type: 'imaging',
        category: 'diagnostic',
        title: `${imaging.modality} Scan`,
        description: imaging.description,
        findings: imaging.findings,
        studyId: imaging.studyId,
        source: imaging.sourceSystem
      });
    });

    patientData.labResults?.forEach(lab => {
      events.push({
        date: lab.testDate,
        type: 'lab',
        category: 'diagnostic',
        title: lab.testName,
        description: `${lab.value} ${lab.unit}`,
        interpretation: lab.interpretation,
        referenceRange: lab.referenceRange,
        source: lab.sourceSystem
      });
    });

    patientData.pathologyReports?.forEach(report => {
      events.push({
        date: report.reportDate,
        type: 'pathology',
        category: 'diagnostic',
        title: 'Pathology Report',
        description: report.diagnosis,
        specimen: report.specimenType,
        findings: report.findings,
        source: report.sourceSystem
      });
    });

    if (patientData.genomics?.reportDate) {
      events.push({
        date: patientData.genomics.reportDate,
        type: 'genomics',
        category: 'molecular',
        title: 'Genomic Profile',
        description: `TMB: ${patientData.genomics.tmb}, MSI: ${patientData.genomics.msi}`,
        mutations: patientData.genomics.mutationProfile
      });
    }

    patientData.treatments?.forEach(treatment => {
      events.push({
        date: treatment.startDate,
        type: 'treatment_start',
        category: 'therapeutic',
        title: `${treatment.type} Started`,
        description: treatment.regimen,
        treatmentId: treatment.treatmentId,
        source: treatment.sourceSystem
      });

      if (treatment.endDate) {
        events.push({
          date: treatment.endDate,
          type: 'treatment_end',
          category: 'therapeutic',
          title: `${treatment.type} Completed`,
          description: `Response: ${treatment.response}`,
          treatmentId: treatment.treatmentId,
          adverseEvents: treatment.adverseEvents
        });
      }
    });

    patientData.clinicalTrials?.forEach(trial => {
      events.push({
        date: trial.enrollmentDate,
        type: 'clinical_trial',
        category: 'research',
        title: 'Clinical Trial Enrollment',
        description: trial.trialName,
        trialId: trial.trialId,
        status: trial.status,
        arm: trial.arm
      });
    });

    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    return this.groupEventsByPeriod(events);
  }

  groupEventsByPeriod(events) {
    const grouped = {};
    
    events.forEach(event => {
      const monthYear = format(new Date(event.date), 'MMMM yyyy');
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(event);
    });

    return Object.entries(grouped).map(([period, periodEvents]) => ({
      period,
      events: periodEvents
    }));
  }

  generateSummary(patientData) {
    const timeline = this.generateTimeline(patientData);
    const summary = {
      totalEvents: timeline.reduce((sum, period) => sum + period.events.length, 0),
      timeSpan: this.calculateTimeSpan(timeline),
      keyMilestones: this.identifyKeyMilestones(timeline),
      treatmentJourney: this.summarizeTreatmentJourney(patientData),
      currentStatus: this.determineCurrentStatus(patientData, timeline)
    };

    return summary;
  }

  calculateTimeSpan(timeline) {
    if (timeline.length === 0) return null;

    const firstEvent = timeline[0].events[0];
    const lastPeriod = timeline[timeline.length - 1];
    const lastEvent = lastPeriod.events[lastPeriod.events.length - 1];

    const startDate = new Date(firstEvent.date);
    const endDate = new Date(lastEvent.date);
    const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                      (endDate.getMonth() - startDate.getMonth());

    return {
      start: format(startDate, 'MMM yyyy'),
      end: format(endDate, 'MMM yyyy'),
      durationMonths: monthsDiff
    };
  }

  identifyKeyMilestones(timeline) {
    const milestones = [];
    
    timeline.forEach(period => {
      period.events.forEach(event => {
        if (event.type === 'diagnosis' || 
            event.type === 'treatment_start' || 
            event.type === 'genomics' ||
            event.type === 'clinical_trial') {
          milestones.push({
            date: event.date,
            type: event.type,
            description: event.title
          });
        }
      });
    });

    return milestones.slice(0, 5);
  }

  summarizeTreatmentJourney(patientData) {
    const treatments = patientData.treatments || [];
    const journey = {
      totalTreatments: treatments.length,
      treatmentTypes: [...new Set(treatments.map(t => t.type))],
      currentTreatments: treatments.filter(t => !t.endDate).map(t => t.regimen),
      completedTreatments: treatments.filter(t => t.endDate).length,
      responses: treatments.filter(t => t.response).map(t => ({
        treatment: t.regimen,
        response: t.response
      }))
    };

    return journey;
  }

  determineCurrentStatus(patientData, timeline) {
    const recentEvents = [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    timeline.forEach(period => {
      period.events.forEach(event => {
        if (new Date(event.date) > thirtyDaysAgo) {
          recentEvents.push(event);
        }
      });
    });

    const activeTreatments = patientData.treatments?.filter(t => !t.endDate) || [];
    const activeTrials = patientData.clinicalTrials?.filter(t => t.status === 'active') || [];

    return {
      recentActivity: recentEvents.length,
      activeTreatments: activeTreatments.length,
      activeTrials: activeTrials.length,
      lastUpdate: recentEvents.length > 0 ? recentEvents[recentEvents.length - 1].date : null
    };
  }

  exportProfile(patientData, format = 'json') {
    const timeline = this.generateTimeline(patientData);
    const summary = this.generateSummary(patientData);

    const profile = {
      patient: {
        abhaId: patientData.abhaId,
        demographics: patientData.demographics,
        cancerType: patientData.cancerType
      },
      timeline,
      summary,
      generatedAt: new Date().toISOString()
    };

    switch (format) {
      case 'json':
        return JSON.stringify(profile, null, 2);
      case 'summary':
        return this.generateTextSummary(profile);
      default:
        return profile;
    }
  }

  generateTextSummary(profile) {
    const lines = [
      `Longitudinal Patient Profile`,
      `Generated: ${new Date(profile.generatedAt).toLocaleString()}`,
      ``,
      `Patient ID: ${profile.patient.abhaId}`,
      `Cancer Type: ${profile.patient.cancerType?.primary || 'N/A'}`,
      `Stage: ${profile.patient.cancerType?.stage || 'N/A'}`,
      ``,
      `Timeline Summary:`,
      `- Total Events: ${profile.summary.totalEvents}`,
      `- Time Span: ${profile.summary.timeSpan?.durationMonths || 0} months`,
      `- Active Treatments: ${profile.summary.currentStatus.activeTreatments}`,
      ``,
      `Key Milestones:`
    ];

    profile.summary.keyMilestones.forEach(milestone => {
      lines.push(`- ${format(new Date(milestone.date), 'MMM dd, yyyy')}: ${milestone.description}`);
    });

    return lines.join('\n');
  }
}

module.exports = LongitudinalProfileService;