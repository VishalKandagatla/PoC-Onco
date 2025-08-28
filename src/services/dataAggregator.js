const Patient = require('../models/Patient');
const DataSource = require('../models/DataSource');
const FHIRPatientConverter = require('../fhir/patientConverter');

class DataAggregator {
  constructor() {
    this.sourceAdapters = new Map();
    this.initializeAdapters();
  }

  initializeAdapters() {
    this.sourceAdapters.set('EMR', new EMRAdapter());
    this.sourceAdapters.set('PACS', new PACSAdapter());
    this.sourceAdapters.set('LIS', new LISAdapter());
    this.sourceAdapters.set('HIMS', new HIMSAdapter());
    this.sourceAdapters.set('PATHOLOGY', new PathologyAdapter());
    this.sourceAdapters.set('GENOMICS', new GenomicsAdapter());
  }

  async aggregatePatientData(abhaId) {
    try {
      const dataSources = await DataSource.find({ syncStatus: 'active' });
      const aggregatedData = {
        abhaId,
        demographics: {},
        medicalHistory: [],
        imaging: [],
        labResults: [],
        pathologyReports: [],
        genomics: {},
        treatments: []
      };

      for (const source of dataSources) {
        const adapter = this.sourceAdapters.get(source.type);
        if (!adapter) continue;

        try {
          const sourceData = await adapter.fetchPatientData(abhaId, source);
          this.mergeData(aggregatedData, sourceData, source.type);
        } catch (error) {
          console.error(`Error fetching data from ${source.name}:`, error);
        }
      }

      return aggregatedData;
    } catch (error) {
      throw new Error(`Data aggregation failed: ${error.message}`);
    }
  }

  mergeData(target, source, sourceType) {
    switch (sourceType) {
      case 'EMR':
        Object.assign(target.demographics, source.demographics || {});
        target.medicalHistory.push(...(source.medicalHistory || []));
        target.treatments.push(...(source.treatments || []));
        break;
      case 'PACS':
        target.imaging.push(...(source.imaging || []));
        break;
      case 'LIS':
        target.labResults.push(...(source.labResults || []));
        break;
      case 'PATHOLOGY':
        target.pathologyReports.push(...(source.pathologyReports || []));
        break;
      case 'GENOMICS':
        Object.assign(target.genomics, source.genomics || {});
        break;
    }
  }

  async syncPatientData(abhaId) {
    const aggregatedData = await this.aggregatePatientData(abhaId);
    
    let patient = await Patient.findOne({ abhaId });
    if (!patient) {
      patient = new Patient(aggregatedData);
    } else {
      Object.assign(patient, aggregatedData);
    }
    
    await patient.save();
    return patient;
  }

  convertToFHIR(patientData) {
    return FHIRPatientConverter.toFHIRBundle(patientData);
  }
}

class BaseAdapter {
  async fetchPatientData(abhaId, dataSource) {
    throw new Error('fetchPatientData must be implemented by subclass');
  }

  mapToInternalFormat(externalData) {
    throw new Error('mapToInternalFormat must be implemented by subclass');
  }
}

class EMRAdapter extends BaseAdapter {
  async fetchPatientData(abhaId, dataSource) {
    const mockData = {
      demographics: {
        firstName: 'Demo',
        lastName: 'Patient',
        dateOfBirth: new Date('1970-01-01'),
        gender: 'male',
        address: {
          street: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001'
        },
        contact: {
          phone: '+919876543210',
          email: 'demo@example.com'
        }
      },
      medicalHistory: [{
        date: new Date(),
        type: 'diagnosis',
        description: 'Squamous cell carcinoma',
        provider: 'Dr. Smith',
        sourceSystem: 'EMR'
      }],
      treatments: [{
        treatmentId: 'T001',
        type: 'chemotherapy',
        regimen: 'Cisplatin + 5-FU',
        startDate: new Date('2024-01-01'),
        response: 'partial',
        sourceSystem: 'EMR'
      }]
    };
    return mockData;
  }
}

class PACSAdapter extends BaseAdapter {
  async fetchPatientData(abhaId, dataSource) {
    const mockData = {
      imaging: [{
        studyId: 'IMG001',
        modality: 'CT',
        studyDate: new Date(),
        description: 'Head CT - baseline',
        findings: 'Mass in oral cavity',
        sourceSystem: 'PACS'
      }]
    };
    return mockData;
  }
}

class LISAdapter extends BaseAdapter {
  async fetchPatientData(abhaId, dataSource) {
    const mockData = {
      labResults: [{
        testId: 'LAB001',
        testName: 'Complete Blood Count',
        testDate: new Date(),
        value: '12.5',
        unit: 'g/dL',
        referenceRange: '12-16 g/dL',
        interpretation: 'Normal',
        sourceSystem: 'LIS'
      }]
    };
    return mockData;
  }
}

class HIMSAdapter extends BaseAdapter {
  async fetchPatientData(abhaId, dataSource) {
    return {};
  }
}

class PathologyAdapter extends BaseAdapter {
  async fetchPatientData(abhaId, dataSource) {
    const mockData = {
      pathologyReports: [{
        reportId: 'PATH001',
        specimenType: 'Biopsy',
        collectionDate: new Date(),
        reportDate: new Date(),
        findings: 'Moderately differentiated squamous cell carcinoma',
        diagnosis: 'Squamous cell carcinoma, Grade 2',
        sourceSystem: 'PATHOLOGY'
      }]
    };
    return mockData;
  }
}

class GenomicsAdapter extends BaseAdapter {
  async fetchPatientData(abhaId, dataSource) {
    const mockData = {
      genomics: {
        mutationProfile: [{
          gene: 'TP53',
          variant: 'p.R273H',
          vaf: 0.35,
          interpretation: 'Pathogenic'
        }],
        tmb: 7.5,
        msi: 'MSS',
        reportDate: new Date()
      }
    };
    return mockData;
  }
}

module.exports = DataAggregator;