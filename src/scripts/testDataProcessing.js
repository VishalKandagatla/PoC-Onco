const fs = require('fs');
const path = require('path');

class DataProcessor {
  constructor() {
    this.dataPath = path.join(__dirname, '../data');
    this.patients = new Map();
  }

  async processAllData() {
    console.log('🚀 Processing your synthetic data files...\n');

    // Process each data source
    await this.loadEMRData();
    await this.loadPACSData();
    await this.loadLISData();
    await this.loadPathologyData();
    await this.loadGenomicsData();
    await this.loadHIMSData();
    await this.loadTherapyData();

    // Display results
    this.displayResults();
  }

  async loadEMRData() {
    console.log('📋 Processing EMR data...');
    const emrPath = path.join(this.dataPath, 'EMR');
    const files = ['emr.json', 'emr2.json', 'emr3.json'];

    for (const file of files) {
      const filePath = path.join(emrPath, file);
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        this.processEMRRecord(data);
        console.log(`  ✓ Processed ${file}: Patient ${data.patient_id} (${data.name})`);
      }
    }
  }

  processEMRRecord(data) {
    const patientId = data.patient_id;
    const patient = this.getOrCreatePatient(patientId);

    patient.demographics = {
      firstName: data.name?.split(' ')[0] || 'Unknown',
      lastName: data.name?.split(' ').slice(1).join(' ') || '',
      age: data.age,
      gender: data.gender?.toLowerCase() || 'unknown',
      state: data.state || '',
      language: data.language_family || ''
    };

    patient.cancerType = {
      primary: data.diagnosis || 'Unknown Cancer',
      stage: data.stage || 'Unknown',
      histology: data.clinical_exam || '',
      riskFactors: data.risk_factors || []
    };

    patient.clinicalInfo = {
      presentingComplaint: data.presenting_complaint,
      clinicalExam: data.clinical_exam,
      treatmentPlan: data.treatment_plan,
      outcome: data.outcome,
      insurance: data.insurance
    };

    this.patients.set(patientId, patient);
  }

  async loadPACSData() {
    console.log('🖼️  Processing PACS data...');
    const pacsPath = path.join(this.dataPath, 'PACS');
    const files = ['pacs.json', 'pacs2.json', 'pacs3.json'];

    for (const file of files) {
      const filePath = path.join(pacsPath, file);
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        this.processPACSRecord(data);
        console.log(`  ✓ Processed ${file}: ${data.imaging_studies?.length || 0} imaging studies`);
      }
    }
  }

  processPACSRecord(data) {
    const patientId = data.patient_id;
    const patient = this.getOrCreatePatient(patientId);

    if (!patient.imaging) patient.imaging = [];

    data.imaging_studies?.forEach((study) => {
      patient.imaging.push({
        studyId: study.study_id,
        modality: study.modality,
        bodySite: study.body_site,
        date: study.date,
        imageFile: study.image_file
      });
    });

    patient.imagingNotes = data.notes;
    this.patients.set(patientId, patient);
  }

  async loadLISData() {
    console.log('🧪 Processing LIS data...');
    const lisPath = path.join(this.dataPath, 'lis');
    const files = ['lis.json', 'lis2.json', 'lis3.json'];

    for (const file of files) {
      const filePath = path.join(lisPath, file);
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        this.processLISRecord(data);
        console.log(`  ✓ Processed ${file}: ${data.lab_results?.length || 0} lab result sets`);
      }
    }
  }

  processLISRecord(data) {
    const patientId = data.patient_id;
    const patient = this.getOrCreatePatient(patientId);

    if (!patient.labResults) patient.labResults = [];

    data.lab_results?.forEach((result) => {
      patient.labResults.push({
        timestamp: result.timestamp,
        observations: result.observations
      });
    });

    this.patients.set(patientId, patient);
  }

  async loadPathologyData() {
    console.log('🔬 Processing Pathology data...');
    const pathPath = path.join(this.dataPath, 'Pathology');
    const files = ['pathology.json', 'pathology2.json', 'pathology3.json'];

    for (const file of files) {
      const filePath = path.join(pathPath, file);
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        this.processPathologyRecord(data);
        console.log(`  ✓ Processed ${file}: Pathology report for patient ${data.patient_id}`);
      }
    }
  }

  processPathologyRecord(data) {
    const patientId = data.patient_id;
    const patient = this.getOrCreatePatient(patientId);

    patient.pathology = {
      specimenType: data.specimen_type,
      findings: data.findings,
      diagnosis: data.diagnosis,
      grade: data.grade,
      stage: data.stage
    };

    this.patients.set(patientId, patient);
  }

  async loadGenomicsData() {
    console.log('🧬 Processing Genomics data...');
    const genomicsPath = path.join(this.dataPath, 'genomics');
    const files = ['genomics.json', 'genomics2.json', 'genomics3.json'];

    for (const file of files) {
      const filePath = path.join(genomicsPath, file);
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        this.processGenomicsRecord(data);
        console.log(`  ✓ Processed ${file}: ${data.mutated_genes?.length || 0} genetic mutations`);
      }
    }
  }

  processGenomicsRecord(data) {
    const patientId = data.patient_id;
    const patient = this.getOrCreatePatient(patientId);

    patient.genomics = {
      mutatedGenes: data.mutated_genes || []
    };

    this.patients.set(patientId, patient);
  }

  async loadHIMSData() {
    console.log('🏥 Processing HIMS data...');
    const himsPath = path.join(this.dataPath, 'hims');
    const files = ['hims.json', 'hims2.json', 'hims3.json'];

    for (const file of files) {
      const filePath = path.join(himsPath, file);
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        this.processHIMSRecord(data);
        console.log(`  ✓ Processed ${file}: Hospital info for patient ${data.patient_id}`);
      }
    }
  }

  processHIMSRecord(data) {
    const patientId = data.patient_id;
    const patient = this.getOrCreatePatient(patientId);

    patient.hospital = data;
    this.patients.set(patientId, patient);
  }

  async loadTherapyData() {
    console.log('💊 Processing Therapy data...');
    const therapyPath = path.join(this.dataPath, 'Therapy');
    const files = ['therapy.json', 'therapy2.json', 'therapy3.json'];

    for (const file of files) {
      const filePath = path.join(therapyPath, file);
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        this.processTherapyRecord(data);
        console.log(`  ✓ Processed ${file}: Therapy data for patient ${data.patient_id}`);
      }
    }
  }

  processTherapyRecord(data) {
    const patientId = data.patient_id;
    const patient = this.getOrCreatePatient(patientId);

    patient.therapy = data;
    this.patients.set(patientId, patient);
  }

  getOrCreatePatient(patientId) {
    if (!this.patients.has(patientId)) {
      this.patients.set(patientId, {
        patientId: patientId,
        abhaId: `SYNTHETIC-${patientId.toUpperCase()}`
      });
    }
    return this.patients.get(patientId);
  }

  displayResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 DATA PROCESSING RESULTS');
    console.log('='.repeat(60));
    
    console.log(`\n✅ Successfully processed ${this.patients.size} patients:`);
    
    for (const [patientId, patient] of this.patients) {
      console.log(`\n👤 Patient: ${patientId}`);
      console.log(`   Name: ${patient.demographics?.firstName} ${patient.demographics?.lastName}`);
      console.log(`   Cancer: ${patient.cancerType?.primary} (Stage ${patient.cancerType?.stage})`);
      console.log(`   Age: ${patient.demographics?.age}, Gender: ${patient.demographics?.gender}`);
      console.log(`   State: ${patient.demographics?.state}`);
      
      if (patient.imaging?.length > 0) {
        console.log(`   📸 Imaging: ${patient.imaging.length} studies (${patient.imaging.map(i => i.modality).join(', ')})`);
      }
      
      if (patient.labResults?.length > 0) {
        console.log(`   🧪 Lab Results: ${patient.labResults.length} time points`);
      }
      
      if (patient.genomics?.mutatedGenes?.length > 0) {
        const genes = patient.genomics.mutatedGenes.map(g => g.gene).join(', ');
        console.log(`   🧬 Mutations: ${genes}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎯 NEXT STEPS:');
    console.log('='.repeat(60));
    console.log('1. Install and start MongoDB to store this data');
    console.log('2. Run: npm run load-real-data');
    console.log('3. Start the server: npm start');
    console.log('4. View at: http://localhost:3001');
    console.log('='.repeat(60));

    // Save processed data to a JSON file for inspection
    const outputPath = path.join(__dirname, '../data/processed_patients.json');
    const patientsArray = Array.from(this.patients.values());
    fs.writeFileSync(outputPath, JSON.stringify(patientsArray, null, 2));
    console.log(`\n💾 Processed data saved to: ${outputPath}`);
  }
}

// Run the processor
const processor = new DataProcessor();
processor.processAllData().catch(console.error);