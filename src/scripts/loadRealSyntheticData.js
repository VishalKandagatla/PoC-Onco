require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const FHIRPatientConverter = require('../fhir/patientConverter');

class RealSyntheticDataLoader {
  constructor() {
    this.dataPath = path.join(__dirname, '../data');
    this.patients = new Map();
    this.imageFiles = new Map();
  }

  async loadAllData() {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/oncology-poc');
      console.log('Connected to MongoDB');

      // Load data from each source
      await this.loadEMRData();
      await this.loadPACSData();
      await this.loadLISData();
      await this.loadPathologyData();
      await this.loadGenomicsData();
      await this.loadHIMSData();
      await this.loadTherapyData();

      // Save all patients to database
      await this.saveAllPatients();

      console.log(`Successfully processed ${this.patients.size} patients`);
      process.exit(0);
    } catch (error) {
      console.error('Error loading real synthetic data:', error);
      process.exit(1);
    }
  }

  async loadEMRData() {
    console.log('Loading EMR data...');
    const emrPath = path.join(this.dataPath, 'EMR');
    const files = ['emr.json', 'emr2.json', 'emr3.json'];

    for (const file of files) {
      const filePath = path.join(emrPath, file);
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        this.processEMRRecord(data);
      }
    }
  }

  processEMRRecord(data) {
    const patientId = data.patient_id;
    const patient = this.getOrCreatePatient(patientId);

    // Map demographics
    patient.demographics = {
      firstName: data.name?.split(' ')[0] || 'Unknown',
      lastName: data.name?.split(' ').slice(1).join(' ') || '',
      dateOfBirth: this.calculateBirthDate(data.age),
      gender: data.gender?.toLowerCase() || 'unknown',
      address: {
        state: data.state || '',
        city: data.state || '',
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
      diagnosisDate: new Date('2024-01-01') // Default date
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

    this.patients.set(patientId, patient);
  }

  async loadPACSData() {
    console.log('Loading PACS data...');
    const pacsPath = path.join(this.dataPath, 'PACS');
    const files = ['pacs.json', 'pacs2.json', 'pacs3.json'];

    for (const file of files) {
      const filePath = path.join(pacsPath, file);
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        this.processPACSRecord(data);
      }
    }
  }

  processPACSRecord(data) {
    const patientId = data.patient_id;
    const patient = this.getOrCreatePatient(patientId);

    if (!patient.imaging) patient.imaging = [];

    data.imaging_studies?.forEach((study, index) => {
      patient.imaging.push({
        studyId: study.study_id || `IMG-${patientId}-${index}`,
        modality: study.modality || 'CT',
        studyDate: new Date(study.date || '2024-01-15'),
        description: `${study.modality} ${study.body_site}`,
        findings: data.notes || 'Imaging findings as per radiologist report',
        sourceSystem: 'PACS',
        dicomUrl: study.image_file || ''
      });
    });

    this.patients.set(patientId, patient);
  }

  async loadLISData() {
    console.log('Loading LIS data...');
    const lisPath = path.join(this.dataPath, 'lis');
    const files = ['lis.json', 'lis2.json', 'lis3.json'];

    for (const file of files) {
      const filePath = path.join(lisPath, file);
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        this.processLISRecord(data);
      }
    }
  }

  processLISRecord(data) {
    const patientId = data.patient_id;
    const patient = this.getOrCreatePatient(patientId);

    if (!patient.labResults) patient.labResults = [];

    data.lab_results?.forEach((result, index) => {
      const testDate = this.parseTimestamp(result.timestamp);
      
      // Create individual lab results for each observation
      Object.entries(result.observations).forEach(([testName, value]) => {
        patient.labResults.push({
          testId: `LAB-${patientId}-${testName}-${index}`,
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

    this.patients.set(patientId, patient);
  }

  async loadPathologyData() {
    console.log('Loading Pathology data...');
    const pathPath = path.join(this.dataPath, 'Pathology');
    const files = ['pathology.json', 'pathology2.json', 'pathology3.json'];

    for (const file of files) {
      const filePath = path.join(pathPath, file);
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        this.processPathologyRecord(data);
      }
    }
  }

  processPathologyRecord(data) {
    const patientId = data.patient_id;
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

    this.patients.set(patientId, patient);
  }

  async loadGenomicsData() {
    console.log('Loading Genomics data...');
    const genomicsPath = path.join(this.dataPath, 'genomics');
    const files = ['genomics.json', 'genomics2.json', 'genomics3.json'];

    for (const file of files) {
      const filePath = path.join(genomicsPath, file);
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        this.processGenomicsRecord(data);
      }
    }
  }

  processGenomicsRecord(data) {
    const patientId = data.patient_id;
    const patient = this.getOrCreatePatient(patientId);

    patient.genomics = {
      mutationProfile: data.mutated_genes?.map(gene => ({
        gene: gene.gene,
        variant: gene.variant,
        vaf: Math.random() * 0.5 + 0.1, // Random VAF between 0.1-0.6
        interpretation: 'Pathogenic'
      })) || [],
      tmb: Math.random() * 10 + 2, // Random TMB between 2-12
      msi: Math.random() > 0.8 ? 'MSI-H' : 'MSS', // 20% MSI-H
      reportDate: new Date('2024-01-20')
    };

    this.patients.set(patientId, patient);
  }

  async loadHIMSData() {
    console.log('Loading HIMS data...');
    const himsPath = path.join(this.dataPath, 'hims');
    const files = ['hims.json', 'hims2.json', 'hims3.json'];

    for (const file of files) {
      const filePath = path.join(himsPath, file);
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        this.processHIMSRecord(data);
      }
    }
  }

  processHIMSRecord(data) {
    const patientId = data.patient_id;
    const patient = this.getOrCreatePatient(patientId);

    // HIMS data typically contains administrative info
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

    this.patients.set(patientId, patient);
  }

  async loadTherapyData() {
    console.log('Loading Therapy data...');
    const therapyPath = path.join(this.dataPath, 'Therapy');
    const files = ['therapy.json', 'therapy2.json', 'therapy3.json'];

    for (const file of files) {
      const filePath = path.join(therapyPath, file);
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        this.processTherapyRecord(data);
      }
    }
  }

  processTherapyRecord(data) {
    const patientId = data.patient_id;
    const patient = this.getOrCreatePatient(patientId);

    if (!patient.treatments) patient.treatments = [];

    // Add therapy information
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

    this.patients.set(patientId, patient);
  }

  getOrCreatePatient(patientId) {
    if (!this.patients.has(patientId)) {
      this.patients.set(patientId, {
        abhaId: `REAL-SYNTHETIC-${patientId.toUpperCase()}`,
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
    return this.patients.get(patientId);
  }

  calculateBirthDate(age) {
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - (age || 50);
    return new Date(`${birthYear}-01-01`);
  }

  parseTimestamp(timestamp) {
    if (timestamp.startsWith('day_')) {
      const days = parseInt(timestamp.split('_')[1]);
      const baseDate = new Date('2024-01-01');
      baseDate.setDate(baseDate.getDate() + days);
      return baseDate;
    }
    return new Date(timestamp);
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
      'Hct': '36-46%'
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
      default:
        return 'Normal';
    }
  }

  async saveAllPatients() {
    console.log('Saving patients to database...');
    
    for (const [patientId, patientData] of this.patients) {
      try {
        // Check if patient already exists
        const existingPatient = await Patient.findOne({ abhaId: patientData.abhaId });
        
        if (existingPatient) {
          console.log(`Updating existing patient: ${patientData.abhaId}`);
          Object.assign(existingPatient, patientData);
          await existingPatient.save();
        } else {
          console.log(`Creating new patient: ${patientData.abhaId}`);
          const patient = new Patient(patientData);
          await patient.save();
        }

        // Validate FHIR compliance
        try {
          const fhirBundle = FHIRPatientConverter.toFHIRBundle(patientData);
          console.log(`✓ FHIR validation passed for ${patientData.abhaId}`);
        } catch (fhirError) {
          console.warn(`⚠ FHIR validation warning for ${patientData.abhaId}:`, fhirError.message);
        }

      } catch (error) {
        console.error(`Error saving patient ${patientId}:`, error);
      }
    }
  }
}

// Run if called directly
if (require.main === module) {
  const loader = new RealSyntheticDataLoader();
  loader.loadAllData();
}

module.exports = RealSyntheticDataLoader;