require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const FHIRPatientConverter = require('../fhir/patientConverter');
const FHIRValidator = require('../fhir/fhirValidator');

class SyntheticDataLoader {
  constructor() {
    this.dataPath = path.join(__dirname, '../data/synthetic-datasets');
    this.processedPatients = [];
  }

  async loadAllCases() {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/oncology-poc');
      console.log('Connected to MongoDB');

      const cases = ['case1-oral-squamous', 'case2-cervical-carcinoma', 'case3-breast-carcinoma'];
      
      for (const caseFolder of cases) {
        const casePath = path.join(this.dataPath, caseFolder);
        if (fs.existsSync(casePath)) {
          console.log(`Processing ${caseFolder}...`);
          await this.loadCase(casePath, caseFolder);
        } else {
          console.log(`Folder ${caseFolder} not found, skipping...`);
        }
      }

      console.log(`Successfully loaded ${this.processedPatients.length} patients`);
      process.exit(0);
    } catch (error) {
      console.error('Error loading synthetic data:', error);
      process.exit(1);
    }
  }

  async loadCase(casePath, caseId) {
    try {
      const files = fs.readdirSync(casePath);
      const patientData = {
        abhaId: `SYNTHETIC-${caseId.toUpperCase().replace('-', '_')}`,
        demographics: {},
        medicalHistory: [],
        imaging: [],
        labResults: [],
        pathologyReports: [],
        genomics: {},
        treatments: [],
        cancerType: {}
      };

      // Process each file in the case folder
      for (const file of files) {
        const filePath = path.join(casePath, file);
        const fileExtension = path.extname(file).toLowerCase();
        
        if (['.json', '.csv', '.xml'].includes(fileExtension)) {
          await this.processFile(filePath, file, patientData);
        }
      }

      // Validate and save patient
      if (patientData.demographics.firstName || patientData.abhaId) {
        await this.savePatient(patientData);
        this.processedPatients.push(caseId);
      }
    } catch (error) {
      console.error(`Error processing case ${caseId}:`, error);
    }
  }

  async processFile(filePath, fileName, patientData) {
    try {
      const fileExtension = path.extname(fileName).toLowerCase();
      let data;

      // Read file based on extension
      if (fileExtension === '.json') {
        const content = fs.readFileSync(filePath, 'utf8');
        data = JSON.parse(content);
      } else if (fileExtension === '.csv') {
        // Basic CSV parsing - you might want to use a proper CSV parser
        const content = fs.readFileSync(filePath, 'utf8');
        data = this.parseCSV(content);
      } else if (fileExtension === '.xml') {
        // Basic XML handling - you might want to use an XML parser
        const content = fs.readFileSync(filePath, 'utf8');
        console.log(`XML file detected: ${fileName} - manual processing required`);
        return;
      }

      // Process based on file name patterns
      if (fileName.toLowerCase().includes('emr') || fileName.toLowerCase().includes('demographics')) {
        this.processEMRData(data, patientData);
      } else if (fileName.toLowerCase().includes('imaging') || fileName.toLowerCase().includes('pacs')) {
        this.processPACSData(data, patientData);
      } else if (fileName.toLowerCase().includes('lab') || fileName.toLowerCase().includes('lis')) {
        this.processLISData(data, patientData);
      } else if (fileName.toLowerCase().includes('pathology') || fileName.toLowerCase().includes('path')) {
        this.processPathologyData(data, patientData);
      } else if (fileName.toLowerCase().includes('genomic') || fileName.toLowerCase().includes('molecular')) {
        this.processGenomicsData(data, patientData);
      } else if (fileName.toLowerCase().includes('treatment') || fileName.toLowerCase().includes('therapy')) {
        this.processTreatmentData(data, patientData);
      } else {
        // Try to auto-detect data type
        this.autoDetectAndProcess(data, patientData, fileName);
      }

    } catch (error) {
      console.error(`Error processing file ${fileName}:`, error);
    }
  }

  processEMRData(data, patientData) {
    // Handle EMR/Demographics data
    if (data.resourceType === 'Patient') {
      // FHIR Patient resource
      patientData.demographics = this.extractFHIRDemographics(data);
    } else if (data.demographics) {
      // Direct demographics object
      Object.assign(patientData.demographics, data.demographics);
    } else if (data.firstName || data.name) {
      // Flat structure
      patientData.demographics = {
        firstName: data.firstName || data.name?.given?.[0],
        lastName: data.lastName || data.name?.family,
        dateOfBirth: data.dateOfBirth || data.birthDate,
        gender: data.gender,
        address: data.address,
        contact: data.contact || { phone: data.phone, email: data.email }
      };
    }

    // Extract cancer type information
    if (data.cancerType || data.condition) {
      Object.assign(patientData.cancerType, data.cancerType || data.condition);
    }
  }

  processPACSData(data, patientData) {
    // Handle imaging/PACS data
    if (Array.isArray(data)) {
      data.forEach(study => {
        patientData.imaging.push({
          studyId: study.studyId || study.id,
          modality: study.modality,
          studyDate: new Date(study.studyDate || study.date),
          description: study.description,
          findings: study.findings || study.impression,
          sourceSystem: 'PACS'
        });
      });
    } else if (data.resourceType === 'ImagingStudy') {
      // FHIR ImagingStudy
      patientData.imaging.push({
        studyId: data.id,
        modality: data.modality?.[0]?.code,
        studyDate: new Date(data.started),
        description: data.description,
        findings: data.note?.[0]?.text,
        sourceSystem: 'PACS'
      });
    }
  }

  processLISData(data, patientData) {
    // Handle lab/LIS data
    if (Array.isArray(data)) {
      data.forEach(result => {
        patientData.labResults.push({
          testId: result.testId || result.id,
          testName: result.testName || result.code?.display,
          testDate: new Date(result.testDate || result.effectiveDateTime),
          value: result.value || result.valueQuantity?.value,
          unit: result.unit || result.valueQuantity?.unit,
          referenceRange: result.referenceRange,
          interpretation: result.interpretation,
          sourceSystem: 'LIS'
        });
      });
    }
  }

  processPathologyData(data, patientData) {
    // Handle pathology data
    if (Array.isArray(data)) {
      data.forEach(report => {
        patientData.pathologyReports.push({
          reportId: report.reportId || report.id,
          specimenType: report.specimenType || report.specimen?.type,
          collectionDate: new Date(report.collectionDate),
          reportDate: new Date(report.reportDate || report.issued),
          findings: report.findings || report.conclusion,
          diagnosis: report.diagnosis,
          sourceSystem: 'PATHOLOGY'
        });
      });
    }
  }

  processGenomicsData(data, patientData) {
    // Handle genomics data
    if (data.mutationProfile || data.variants) {
      patientData.genomics = {
        mutationProfile: data.mutationProfile || data.variants,
        tmb: data.tmb || data.tumorMutationalBurden,
        msi: data.msi || data.microsatelliteStatus,
        reportDate: new Date(data.reportDate || Date.now())
      };
    }
  }

  processTreatmentData(data, patientData) {
    // Handle treatment data
    if (Array.isArray(data)) {
      data.forEach(treatment => {
        patientData.treatments.push({
          treatmentId: treatment.treatmentId || treatment.id,
          type: treatment.type || treatment.category,
          regimen: treatment.regimen || treatment.medication,
          startDate: new Date(treatment.startDate),
          endDate: treatment.endDate ? new Date(treatment.endDate) : null,
          response: treatment.response,
          adverseEvents: treatment.adverseEvents || [],
          sourceSystem: 'EMR'
        });
      });
    }
  }

  autoDetectAndProcess(data, patientData, fileName) {
    console.log(`Auto-detecting data type for ${fileName}`);
    
    // Try to detect based on data structure
    if (data.resourceType) {
      console.log(`Detected FHIR resource: ${data.resourceType}`);
      // Handle FHIR resources
      this.processFHIRResource(data, patientData);
    } else if (Array.isArray(data) && data.length > 0) {
      const firstItem = data[0];
      if (firstItem.testName || firstItem.code) {
        this.processLISData(data, patientData);
      } else if (firstItem.modality || firstItem.studyDate) {
        this.processPACSData(data, patientData);
      }
    }
  }

  processFHIRResource(resource, patientData) {
    switch (resource.resourceType) {
      case 'Patient':
        this.processEMRData(resource, patientData);
        break;
      case 'Observation':
        this.processLISData([resource], patientData);
        break;
      case 'ImagingStudy':
        this.processPACSData(resource, patientData);
        break;
      case 'DiagnosticReport':
        this.processPathologyData([resource], patientData);
        break;
      case 'Bundle':
        // Process bundle entries
        resource.entry?.forEach(entry => {
          if (entry.resource) {
            this.processFHIRResource(entry.resource, patientData);
          }
        });
        break;
    }
  }

  extractFHIRDemographics(fhirPatient) {
    return {
      firstName: fhirPatient.name?.[0]?.given?.[0],
      lastName: fhirPatient.name?.[0]?.family,
      dateOfBirth: fhirPatient.birthDate ? new Date(fhirPatient.birthDate) : null,
      gender: fhirPatient.gender,
      address: fhirPatient.address?.[0] ? {
        street: fhirPatient.address[0].line?.[0],
        city: fhirPatient.address[0].city,
        state: fhirPatient.address[0].state,
        pincode: fhirPatient.address[0].postalCode
      } : {},
      contact: {
        phone: fhirPatient.telecom?.find(t => t.system === 'phone')?.value,
        email: fhirPatient.telecom?.find(t => t.system === 'email')?.value
      }
    };
  }

  parseCSV(content) {
    const lines = content.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const results = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim());
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        results.push(row);
      }
    }

    return results;
  }

  async savePatient(patientData) {
    try {
      // Check if patient already exists
      const existingPatient = await Patient.findOne({ abhaId: patientData.abhaId });
      
      if (existingPatient) {
        console.log(`Patient ${patientData.abhaId} already exists, updating...`);
        Object.assign(existingPatient, patientData);
        await existingPatient.save();
      } else {
        const patient = new Patient(patientData);
        await patient.save();
        console.log(`Created new patient: ${patientData.abhaId}`);
      }

      // Validate FHIR compliance
      const fhirBundle = FHIRPatientConverter.toFHIRBundle(patientData);
      const validation = FHIRValidator.validateResource(fhirBundle);
      
      if (!validation.isValid) {
        console.warn(`FHIR validation warnings for ${patientData.abhaId}:`, validation.errors);
      }

    } catch (error) {
      console.error(`Error saving patient ${patientData.abhaId}:`, error);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const loader = new SyntheticDataLoader();
  loader.loadAllCases();
}

module.exports = SyntheticDataLoader;