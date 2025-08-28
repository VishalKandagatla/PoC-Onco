const fs = require('fs');
const path = require('path');

class FileBasedDataService {
  constructor() {
    this.dataPath = path.join(__dirname, '../data');
    this.processedPatientsPath = path.join(this.dataPath, 'processed_patients.json');
    this.patients = new Map();
    this.loadProcessedPatients();
  }

  loadProcessedPatients() {
    try {
      if (fs.existsSync(this.processedPatientsPath)) {
        const data = JSON.parse(fs.readFileSync(this.processedPatientsPath, 'utf8'));
        
        // Handle both array format and object format
        let patientsArray = [];
        if (Array.isArray(data)) {
          patientsArray = data;
        } else if (data && data.patients) {
          patientsArray = data.patients;
        }
        
        patientsArray.forEach(patient => {
          // Transform existing format to our expected format
          const transformedPatient = this.transformExistingPatient(patient);
          this.patients.set(transformedPatient.abhaId, transformedPatient);
        });
        
        console.log(`Loaded ${this.patients.size} patients from processed file`);
      } else {
        // If processed file doesn't exist, load and process raw data
        this.processAllRawData();
      }
    } catch (error) {
      console.error('Error loading processed patients:', error);
      this.processAllRawData();
    }
  }

  processAllRawData() {
    console.log('Processing raw data files...');
    
    // Load data from each source
    this.loadEMRData();
    this.loadPACSData();
    this.loadLISData();
    this.loadPathologyData();
    this.loadGenomicsData();
    this.loadHIMSData();
    this.loadTherapyData();
    
    // Save processed data
    this.saveProcessedPatients();
  }

  loadEMRData() {
    const emrPath = path.join(this.dataPath, 'EMR');
    const files = ['emr.json', 'emr2.json', 'emr3.json'];

    files.forEach((file, index) => {
      const filePath = path.join(emrPath, file);
      if (fs.existsSync(filePath)) {
        try {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          const patientId = data.patient_id || `PATIENT_${index + 1}`;
          const patient = this.getOrCreatePatient(patientId);

          // Map demographics
          patient.demographics = {
            firstName: data.name?.split(' ')[0] || 'Patient',
            lastName: data.name?.split(' ').slice(1).join(' ') || `${index + 1}`,
            dateOfBirth: this.calculateBirthDate(data.age),
            gender: data.gender?.toLowerCase() || 'unknown',
            address: {
              state: data.state || 'Unknown',
              city: data.state || 'Unknown',
              pincode: '000000'
            },
            contact: {
              phone: '+919876543210',
              email: `${patientId}@example.com`
            }
          };

          // Map cancer information
          patient.cancerType = {
            primary: data.diagnosis || 'Unknown Cancer',
            stage: data.stage || 'Unknown',
            histology: data.clinical_exam || '',
            diagnosisDate: new Date('2024-01-01')
          };

          // Map medical history
          patient.medicalHistory = [
            {
              date: new Date('2024-01-01'),
              type: 'diagnosis',
              description: data.diagnosis,
              provider: 'Dr. Primary',
              sourceSystem: 'EMR'
            },
            {
              date: new Date('2024-01-01'),
              type: 'presenting_complaint',
              description: data.presenting_complaint,
              provider: 'Dr. Primary',
              sourceSystem: 'EMR'
            }
          ];

          // Map treatments if available
          if (data.treatment_plan) {
            patient.treatments = [{
              treatmentId: `TX-${patientId}`,
              type: 'multimodal',
              regimen: data.treatment_plan,
              startDate: new Date('2024-02-01'),
              response: data.outcome || 'ongoing',
              sourceSystem: 'EMR'
            }];
          }

          this.patients.set(patient.abhaId, patient);
        } catch (error) {
          console.error(`Error processing ${file}:`, error);
        }
      }
    });
  }

  loadPACSData() {
    const pacsPath = path.join(this.dataPath, 'PACS');
    const files = ['pacs.json', 'pacs2.json', 'pacs3.json'];

    files.forEach((file, index) => {
      const filePath = path.join(pacsPath, file);
      if (fs.existsSync(filePath)) {
        try {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          const patientId = data.patient_id || `PATIENT_${index + 1}`;
          const patient = this.getOrCreatePatient(patientId);

          if (!patient.imaging) patient.imaging = [];

          data.imaging_studies?.forEach((study, studyIndex) => {
            patient.imaging.push({
              studyId: study.study_id || `IMG-${patientId}-${studyIndex}`,
              modality: study.modality || 'CT',
              studyDate: new Date(study.date || '2024-01-15'),
              description: `${study.modality} ${study.body_site}`,
              findings: data.notes || 'Imaging findings as per radiologist report',
              sourceSystem: 'PACS',
              dicomUrl: study.image_file || ''
            });
          });

          this.patients.set(patient.abhaId, patient);
        } catch (error) {
          console.error(`Error processing ${file}:`, error);
        }
      }
    });
  }

  loadLISData() {
    const lisPath = path.join(this.dataPath, 'lis');
    const files = ['lis.json', 'lis2.json', 'lis3.json'];

    files.forEach((file, index) => {
      const filePath = path.join(lisPath, file);
      if (fs.existsSync(filePath)) {
        try {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          const patientId = data.patient_id || `PATIENT_${index + 1}`;
          const patient = this.getOrCreatePatient(patientId);

          if (!patient.labResults) patient.labResults = [];

          data.lab_results?.forEach((result, resultIndex) => {
            const testDate = this.parseTimestamp(result.timestamp);
            
            // Create individual lab results for each observation
            Object.entries(result.observations).forEach(([testName, value]) => {
              patient.labResults.push({
                testId: `LAB-${patientId}-${testName}-${resultIndex}`,
                testName: this.expandTestName(testName),
                testDate: testDate,
                value: value.toString(),
                unit: this.getTestUnit(testName),
                referenceRange: this.getReferenceRange(testName),
                interpretation: this.interpretResult(testName, value),
                sourceSystem: 'LIS'
              });
            });
          });

          this.patients.set(patient.abhaId, patient);
        } catch (error) {
          console.error(`Error processing ${file}:`, error);
        }
      }
    });
  }

  loadPathologyData() {
    const pathPath = path.join(this.dataPath, 'Pathology');
    const files = ['pathology.json', 'pathology2.json', 'pathology3.json'];

    files.forEach((file, index) => {
      const filePath = path.join(pathPath, file);
      if (fs.existsSync(filePath)) {
        try {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          const patientId = data.patient_id || `PATIENT_${index + 1}`;
          const patient = this.getOrCreatePatient(patientId);

          if (!patient.pathologyReports) patient.pathologyReports = [];

          patient.pathologyReports.push({
            reportId: `PATH-${patientId}`,
            specimenType: data.specimen_type || 'Biopsy',
            collectionDate: new Date('2024-01-10'),
            reportDate: new Date('2024-01-12'),
            findings: data.findings || 'Pathological findings as per report',
            diagnosis: data.diagnosis || patient.cancerType?.primary || 'Cancer',
            sourceSystem: 'PATHOLOGY'
          });

          this.patients.set(patient.abhaId, patient);
        } catch (error) {
          console.error(`Error processing ${file}:`, error);
        }
      }
    });
  }

  loadGenomicsData() {
    const genomicsPath = path.join(this.dataPath, 'genomics');
    const files = ['genomics.json', 'genomics2.json', 'genomics3.json'];

    files.forEach((file, index) => {
      const filePath = path.join(genomicsPath, file);
      if (fs.existsSync(filePath)) {
        try {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          const patientId = data.patient_id || `PATIENT_${index + 1}`;
          const patient = this.getOrCreatePatient(patientId);

          patient.genomics = {
            mutationProfile: data.mutated_genes?.map(gene => ({
              gene: gene.gene,
              variant: gene.variant,
              vaf: Math.random() * 0.5 + 0.1,
              interpretation: 'Pathogenic'
            })) || [],
            tmb: Math.random() * 10 + 2,
            msi: Math.random() > 0.8 ? 'MSI-H' : 'MSS',
            reportDate: new Date('2024-01-20')
          };

          this.patients.set(patient.abhaId, patient);
        } catch (error) {
          console.error(`Error processing ${file}:`, error);
        }
      }
    });
  }

  loadHIMSData() {
    const himsPath = path.join(this.dataPath, 'hims');
    const files = ['hims.json', 'hims2.json', 'hims3.json'];

    files.forEach((file, index) => {
      const filePath = path.join(himsPath, file);
      if (fs.existsSync(filePath)) {
        try {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          const patientId = data.patient_id || `PATIENT_${index + 1}`;
          const patient = this.getOrCreatePatient(patientId);

          if (data.admission_date) {
            if (!patient.medicalHistory) patient.medicalHistory = [];
            patient.medicalHistory.push({
              date: new Date(data.admission_date),
              type: 'admission',
              description: 'Hospital admission',
              provider: data.attending_physician || 'Dr. Unknown',
              sourceSystem: 'HIMS'
            });
          }

          this.patients.set(patient.abhaId, patient);
        } catch (error) {
          console.error(`Error processing ${file}:`, error);
        }
      }
    });
  }

  loadTherapyData() {
    const therapyPath = path.join(this.dataPath, 'Therapy');
    const files = ['therapy.json', 'therapy2.json', 'therapy3.json'];

    files.forEach((file, index) => {
      const filePath = path.join(therapyPath, file);
      if (fs.existsSync(filePath)) {
        try {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          const patientId = data.patient_id || `PATIENT_${index + 1}`;
          const patient = this.getOrCreatePatient(patientId);

          if (!patient.treatments) patient.treatments = [];

          if (data.treatment_regimen) {
            patient.treatments.push({
              treatmentId: `THERAPY-${patientId}`,
              type: data.treatment_type || 'chemotherapy',
              regimen: data.treatment_regimen || 'Standard protocol',
              startDate: new Date(data.start_date || '2024-02-01'),
              endDate: data.end_date ? new Date(data.end_date) : null,
              response: data.response || 'ongoing',
              adverseEvents: data.side_effects || [],
              sourceSystem: 'THERAPY'
            });
          }

          this.patients.set(patient.abhaId, patient);
        } catch (error) {
          console.error(`Error processing ${file}:`, error);
        }
      }
    });
  }

  getOrCreatePatient(patientId) {
    const abhaId = `FILE-BASED-${patientId.toUpperCase()}`;
    if (!this.patients.has(abhaId)) {
      this.patients.set(abhaId, {
        abhaId: abhaId,
        demographics: {},
        cancerType: {},
        medicalHistory: [],
        imaging: [],
        labResults: [],
        pathologyReports: [],
        genomics: {},
        treatments: []
      });
    }
    return this.patients.get(abhaId);
  }

  calculateBirthDate(age) {
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - (age || 50);
    return new Date(`${birthYear}-01-01`);
  }

  parseTimestamp(timestamp) {
    if (timestamp && timestamp.startsWith('day_')) {
      const days = parseInt(timestamp.split('_')[1]);
      const baseDate = new Date('2024-01-01');
      baseDate.setDate(baseDate.getDate() + days);
      return baseDate;
    }
    return new Date(timestamp || '2024-01-01');
  }

  expandTestName(testName) {
    const expansions = {
      'RBC': 'Red Blood Cell Count',
      'WBC': 'White Blood Cell Count',
      'Platelets': 'Platelet Count',
      'SCC': 'Squamous Cell Carcinoma Antigen',
      'Hgb': 'Hemoglobin',
      'Hct': 'Hematocrit'
    };
    return expansions[testName] || testName;
  }

  getTestUnit(testName) {
    const units = {
      'RBC': '×10¹²/L',
      'WBC': '×10⁹/L',
      'Platelets': '×10⁹/L',
      'SCC': 'ng/mL',
      'Hgb': 'g/dL',
      'Hct': '%'
    };
    return units[testName] || '';
  }

  getReferenceRange(testName) {
    const ranges = {
      'RBC': '4.5-5.5 ×10¹²/L',
      'WBC': '4.0-10.0 ×10⁹/L',
      'Platelets': '150-450 ×10⁹/L',
      'SCC': '<1.5 ng/mL',
      'Hgb': '12.0-16.0 g/dL',
      'Hct': '36-46%',
      'CA-125': '<35 U/mL',
      'CA 15-3': '<30 U/mL'
    };
    return ranges[testName] || '';
  }

  interpretResult(testName, value) {
    const numValue = parseFloat(value);
    
    switch (testName) {
      case 'RBC':
        return numValue < 4.5 ? 'Low' : numValue > 5.5 ? 'High' : 'Normal';
      case 'WBC':
        return numValue < 4.0 ? 'Low' : numValue > 10.0 ? 'High' : 'Normal';
      case 'Platelets':
        return numValue < 150 ? 'Low' : numValue > 450 ? 'High' : 'Normal';
      case 'SCC':
        return numValue > 1.5 ? 'Elevated' : 'Normal';
      case 'CA-125':
        return numValue > 35 ? 'Elevated' : 'Normal';
      case 'CA 15-3':
        return numValue > 30 ? 'Elevated' : 'Normal';
      default:
        return 'Normal';
    }
  }

  saveProcessedPatients() {
    try {
      const data = {
        lastProcessed: new Date().toISOString(),
        patientCount: this.patients.size,
        patients: Array.from(this.patients.values())
      };
      fs.writeFileSync(this.processedPatientsPath, JSON.stringify(data, null, 2));
      console.log(`Saved ${this.patients.size} processed patients to file`);
    } catch (error) {
      console.error('Error saving processed patients:', error);
    }
  }

  // Public methods for data access
  async getAllPatients() {
    return Array.from(this.patients.values());
  }

  async getPatientByAbhaId(abhaId) {
    return this.patients.get(abhaId) || null;
  }

  async searchPatients(query) {
    const results = [];
    for (const patient of this.patients.values()) {
      const name = `${patient.demographics.firstName} ${patient.demographics.lastName}`.toLowerCase();
      if (name.includes(query.toLowerCase()) || patient.abhaId.includes(query)) {
        results.push(patient);
      }
    }
    return results;
  }

  transformExistingPatient(existingPatient) {
    // Transform the existing processed patient format to our expected format
    const transformed = {
      abhaId: existingPatient.abhaId || `FILE-BASED-${existingPatient.patientId.toUpperCase()}`,
      demographics: {
        firstName: existingPatient.demographics?.firstName || 'Unknown',
        lastName: existingPatient.demographics?.lastName || '',
        dateOfBirth: this.calculateBirthDate(existingPatient.demographics?.age || 50),
        gender: existingPatient.demographics?.gender || 'unknown',
        address: {
          state: existingPatient.demographics?.state || 'Unknown',
          city: existingPatient.demographics?.state || 'Unknown',
          pincode: '000000'
        },
        contact: {
          phone: '+919876543210',
          email: `${existingPatient.patientId}@example.com`
        }
      },
      cancerType: {
        primary: existingPatient.cancerType?.primary || 'Unknown Cancer',
        stage: existingPatient.cancerType?.stage || 'Unknown',
        histology: existingPatient.cancerType?.histology || '',
        diagnosisDate: new Date('2024-01-01')
      },
      medicalHistory: [
        {
          date: new Date('2024-01-01'),
          type: 'diagnosis',
          description: existingPatient.cancerType?.primary || 'Cancer diagnosis',
          provider: 'Dr. Primary',
          sourceSystem: 'EMR'
        },
        {
          date: new Date('2024-01-01'),
          type: 'presenting_complaint',
          description: existingPatient.clinicalInfo?.presentingComplaint || 'Clinical presentation',
          provider: 'Dr. Primary',
          sourceSystem: 'EMR'
        }
      ],
      imaging: (existingPatient.imaging || []).map((img, index) => ({
        studyId: img.studyId || `IMG-${existingPatient.patientId}-${index}`,
        modality: img.modality || 'CT',
        studyDate: new Date(img.date || '2024-01-15'),
        description: `${img.modality} ${img.bodySite}`,
        findings: existingPatient.imagingNotes || 'Imaging findings',
        sourceSystem: 'PACS',
        dicomUrl: img.imageFile || ''
      })),
      labResults: [],
      pathologyReports: [],
      genomics: {
        mutationProfile: (existingPatient.genomics?.mutatedGenes || []).map(gene => ({
          gene: gene.gene,
          variant: gene.variant,
          vaf: Math.random() * 0.5 + 0.1,
          interpretation: 'Pathogenic'
        })),
        tmb: Math.random() * 10 + 2,
        msi: Math.random() > 0.8 ? 'MSI-H' : 'MSS',
        reportDate: new Date('2024-01-20')
      },
      treatments: (existingPatient.therapy?.treatments || []).map(treatment => ({
        treatmentId: `TX-${existingPatient.patientId}-${treatment.type}`,
        type: treatment.type?.toLowerCase() || 'therapy',
        regimen: treatment.regimen || treatment.description || 'Standard protocol',
        startDate: new Date(treatment.date?.split(' to ')[0] || '2024-02-01'),
        endDate: treatment.date?.includes(' to ') ? new Date(treatment.date.split(' to ')[1]) : null,
        response: treatment.status?.toLowerCase() || 'ongoing',
        sourceSystem: 'THERAPY'
      }))
    };

    // Process lab results
    if (existingPatient.labResults) {
      existingPatient.labResults.forEach((result, resultIndex) => {
        const testDate = this.parseTimestamp(result.timestamp);
        
        Object.entries(result.observations).forEach(([testName, value]) => {
          transformed.labResults.push({
            testId: `LAB-${existingPatient.patientId}-${testName}-${resultIndex}`,
            testName: this.expandTestName(testName),
            testDate: testDate,
            value: value.toString(),
            unit: this.getTestUnit(testName),
            referenceRange: this.getReferenceRange(testName),
            interpretation: this.interpretResult(testName, value),
            sourceSystem: 'LIS'
          });
        });
      });
    }

    return transformed;
  }

  async getDataSources() {
    return [
      {
        _id: '1',
        name: 'Hospital EMR System',
        type: 'EMR',
        hospital: { name: 'AIIMS Delhi', location: 'New Delhi', tier: 'Tier-1' },
        dataFormat: 'JSON',
        syncStatus: 'active',
        lastSync: new Date()
      },
      {
        _id: '2',
        name: 'Radiology PACS',
        type: 'PACS',
        hospital: { name: 'AIIMS Delhi', location: 'New Delhi', tier: 'Tier-1' },
        dataFormat: 'JSON',
        syncStatus: 'active',
        lastSync: new Date()
      },
      {
        _id: '3',
        name: 'Laboratory System',
        type: 'LIS',
        hospital: { name: 'AIIMS Delhi', location: 'New Delhi', tier: 'Tier-1' },
        dataFormat: 'JSON',
        syncStatus: 'active',
        lastSync: new Date()
      },
      {
        _id: '4',
        name: 'Pathology Department',
        type: 'PATHOLOGY',
        hospital: { name: 'AIIMS Delhi', location: 'New Delhi', tier: 'Tier-1' },
        dataFormat: 'JSON',
        syncStatus: 'active',
        lastSync: new Date()
      },
      {
        _id: '5',
        name: 'Genomics Lab',
        type: 'GENOMICS',
        hospital: { name: 'AIIMS Delhi', location: 'New Delhi', tier: 'Tier-1' },
        dataFormat: 'JSON',
        syncStatus: 'active',
        lastSync: new Date()
      }
    ];
  }
}

module.exports = FileBasedDataService;