const { v4: uuidv4 } = require('uuid');

class FHIRPatientConverter {
  static toFHIRPatient(patientData) {
    const patient = {
      resourceType: 'Patient',
      id: patientData._id || uuidv4(),
      meta: {
        profile: ['http://hl7.org/fhir/StructureDefinition/Patient']
      },
      identifier: [{
        system: 'https://abdm.gov.in/abha',
        value: patientData.abhaId
      }],
      active: true,
      name: [{
        use: 'official',
        family: patientData.demographics.lastName,
        given: [patientData.demographics.firstName]
      }],
      gender: patientData.demographics.gender?.toLowerCase(),
      birthDate: patientData.demographics.dateOfBirth?.toISOString().split('T')[0],
      address: [{
        use: 'home',
        line: [patientData.demographics.address?.street],
        city: patientData.demographics.address?.city,
        state: patientData.demographics.address?.state,
        postalCode: patientData.demographics.address?.pincode,
        country: 'IN'
      }],
      telecom: []
    };

    if (patientData.demographics.contact?.phone) {
      patient.telecom.push({
        system: 'phone',
        value: patientData.demographics.contact.phone,
        use: 'mobile'
      });
    }

    if (patientData.demographics.contact?.email) {
      patient.telecom.push({
        system: 'email',
        value: patientData.demographics.contact.email
      });
    }

    return patient;
  }

  static toFHIRCondition(patientData) {
    if (!patientData.cancerType) return null;

    return {
      resourceType: 'Condition',
      id: uuidv4(),
      meta: {
        profile: ['http://hl7.org/fhir/StructureDefinition/Condition']
      },
      clinicalStatus: {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
          code: 'active'
        }]
      },
      verificationStatus: {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
          code: 'confirmed'
        }]
      },
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/condition-category',
          code: 'encounter-diagnosis',
          display: 'Encounter Diagnosis'
        }]
      }],
      severity: {
        text: patientData.cancerType.stage
      },
      code: {
        text: patientData.cancerType.primary,
        coding: [{
          system: 'http://snomed.info/sct',
          display: patientData.cancerType.primary
        }]
      },
      subject: {
        reference: `Patient/${patientData._id || patientData.abhaId}`
      },
      onsetDateTime: patientData.cancerType.diagnosisDate?.toISOString(),
      note: [{
        text: `Histology: ${patientData.cancerType.histology}, Grade: ${patientData.cancerType.grade}`
      }]
    };
  }

  static toFHIRObservation(labResult, patientId) {
    return {
      resourceType: 'Observation',
      id: labResult.testId || uuidv4(),
      meta: {
        profile: ['http://hl7.org/fhir/StructureDefinition/Observation']
      },
      status: 'final',
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
          code: 'laboratory',
          display: 'Laboratory'
        }]
      }],
      code: {
        text: labResult.testName
      },
      subject: {
        reference: `Patient/${patientId}`
      },
      effectiveDateTime: labResult.testDate?.toISOString(),
      valueQuantity: {
        value: parseFloat(labResult.value) || labResult.value,
        unit: labResult.unit
      },
      interpretation: [{
        text: labResult.interpretation
      }],
      referenceRange: [{
        text: labResult.referenceRange
      }]
    };
  }

  static toFHIRImagingStudy(imaging, patientId) {
    return {
      resourceType: 'ImagingStudy',
      id: imaging.studyId || uuidv4(),
      meta: {
        profile: ['http://hl7.org/fhir/StructureDefinition/ImagingStudy']
      },
      status: 'available',
      subject: {
        reference: `Patient/${patientId}`
      },
      started: imaging.studyDate?.toISOString(),
      modality: [{
        system: 'http://dicom.nema.org/resources/ontology/DCM',
        code: imaging.modality
      }],
      description: imaging.description,
      series: [{
        uid: uuidv4(),
        modality: {
          system: 'http://dicom.nema.org/resources/ontology/DCM',
          code: imaging.modality
        },
        description: imaging.findings
      }]
    };
  }

  static toFHIRDiagnosticReport(pathologyReport, patientId) {
    return {
      resourceType: 'DiagnosticReport',
      id: pathologyReport.reportId || uuidv4(),
      meta: {
        profile: ['http://hl7.org/fhir/StructureDefinition/DiagnosticReport']
      },
      status: 'final',
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
          code: 'PAT',
          display: 'Pathology'
        }]
      }],
      code: {
        text: 'Pathology Report'
      },
      subject: {
        reference: `Patient/${patientId}`
      },
      effectiveDateTime: pathologyReport.reportDate?.toISOString(),
      specimen: [{
        display: pathologyReport.specimenType
      }],
      conclusion: pathologyReport.diagnosis,
      conclusionCode: [{
        text: pathologyReport.findings
      }]
    };
  }

  static toFHIRMedicationStatement(treatment, patientId) {
    return {
      resourceType: 'MedicationStatement',
      id: treatment.treatmentId || uuidv4(),
      meta: {
        profile: ['http://hl7.org/fhir/StructureDefinition/MedicationStatement']
      },
      status: treatment.endDate ? 'completed' : 'active',
      category: {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/medication-statement-category',
          code: 'outpatient'
        }]
      },
      medicationCodeableConcept: {
        text: treatment.regimen
      },
      subject: {
        reference: `Patient/${patientId}`
      },
      effectivePeriod: {
        start: treatment.startDate?.toISOString(),
        end: treatment.endDate?.toISOString()
      },
      reasonCode: [{
        text: treatment.type
      }],
      note: [{
        text: `Response: ${treatment.response}, Adverse Events: ${treatment.adverseEvents?.join(', ')}`
      }]
    };
  }

  static toFHIRBundle(patientData) {
    const bundle = {
      resourceType: 'Bundle',
      id: uuidv4(),
      type: 'collection',
      timestamp: new Date().toISOString(),
      entry: []
    };

    const patient = this.toFHIRPatient(patientData);
    bundle.entry.push({ resource: patient });

    const condition = this.toFHIRCondition(patientData);
    if (condition) {
      bundle.entry.push({ resource: condition });
    }

    patientData.labResults?.forEach(lab => {
      const observation = this.toFHIRObservation(lab, patientData._id);
      bundle.entry.push({ resource: observation });
    });

    patientData.imaging?.forEach(img => {
      const imagingStudy = this.toFHIRImagingStudy(img, patientData._id);
      bundle.entry.push({ resource: imagingStudy });
    });

    patientData.pathologyReports?.forEach(report => {
      const diagnosticReport = this.toFHIRDiagnosticReport(report, patientData._id);
      bundle.entry.push({ resource: diagnosticReport });
    });

    patientData.treatments?.forEach(treatment => {
      const medicationStatement = this.toFHIRMedicationStatement(treatment, patientData._id);
      bundle.entry.push({ resource: medicationStatement });
    });

    return bundle;
  }
}

module.exports = FHIRPatientConverter;