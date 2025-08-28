class FHIRValidator {
  static validateResource(resource) {
    const errors = [];

    if (!resource.resourceType) {
      errors.push('Missing resourceType');
    }

    switch (resource.resourceType) {
      case 'Patient':
        errors.push(...this.validatePatient(resource));
        break;
      case 'Condition':
        errors.push(...this.validateCondition(resource));
        break;
      case 'Observation':
        errors.push(...this.validateObservation(resource));
        break;
      case 'ImagingStudy':
        errors.push(...this.validateImagingStudy(resource));
        break;
      case 'DiagnosticReport':
        errors.push(...this.validateDiagnosticReport(resource));
        break;
      case 'MedicationStatement':
        errors.push(...this.validateMedicationStatement(resource));
        break;
      case 'Bundle':
        errors.push(...this.validateBundle(resource));
        break;
      default:
        errors.push(`Unknown resource type: ${resource.resourceType}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validatePatient(patient) {
    const errors = [];

    if (!patient.name || patient.name.length === 0) {
      errors.push('Patient must have at least one name');
    }

    if (!patient.identifier || patient.identifier.length === 0) {
      errors.push('Patient must have at least one identifier');
    }

    if (patient.gender && !['male', 'female', 'other', 'unknown'].includes(patient.gender)) {
      errors.push('Invalid gender value');
    }

    if (patient.birthDate && !this.isValidDate(patient.birthDate)) {
      errors.push('Invalid birthDate format');
    }

    return errors;
  }

  static validateCondition(condition) {
    const errors = [];

    if (!condition.subject || !condition.subject.reference) {
      errors.push('Condition must have a subject reference');
    }

    if (!condition.code) {
      errors.push('Condition must have a code');
    }

    if (!condition.clinicalStatus) {
      errors.push('Condition must have a clinicalStatus');
    }

    return errors;
  }

  static validateObservation(observation) {
    const errors = [];

    if (!observation.status) {
      errors.push('Observation must have a status');
    }

    if (!observation.code) {
      errors.push('Observation must have a code');
    }

    if (!observation.subject || !observation.subject.reference) {
      errors.push('Observation must have a subject reference');
    }

    return errors;
  }

  static validateImagingStudy(imagingStudy) {
    const errors = [];

    if (!imagingStudy.status) {
      errors.push('ImagingStudy must have a status');
    }

    if (!imagingStudy.subject || !imagingStudy.subject.reference) {
      errors.push('ImagingStudy must have a subject reference');
    }

    return errors;
  }

  static validateDiagnosticReport(report) {
    const errors = [];

    if (!report.status) {
      errors.push('DiagnosticReport must have a status');
    }

    if (!report.code) {
      errors.push('DiagnosticReport must have a code');
    }

    if (!report.subject || !report.subject.reference) {
      errors.push('DiagnosticReport must have a subject reference');
    }

    return errors;
  }

  static validateMedicationStatement(statement) {
    const errors = [];

    if (!statement.status) {
      errors.push('MedicationStatement must have a status');
    }

    if (!statement.medicationCodeableConcept && !statement.medicationReference) {
      errors.push('MedicationStatement must have either medicationCodeableConcept or medicationReference');
    }

    if (!statement.subject || !statement.subject.reference) {
      errors.push('MedicationStatement must have a subject reference');
    }

    return errors;
  }

  static validateBundle(bundle) {
    const errors = [];

    if (!bundle.type) {
      errors.push('Bundle must have a type');
    }

    if (!bundle.entry || !Array.isArray(bundle.entry)) {
      errors.push('Bundle must have an entry array');
    }

    bundle.entry?.forEach((entry, index) => {
      if (!entry.resource) {
        errors.push(`Bundle entry ${index} missing resource`);
      } else {
        const validation = this.validateResource(entry.resource);
        if (!validation.isValid) {
          errors.push(`Bundle entry ${index}: ${validation.errors.join(', ')}`);
        }
      }
    });

    return errors;
  }

  static isValidDate(dateString) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const dateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    return dateRegex.test(dateString) || dateTimeRegex.test(dateString);
  }
}

module.exports = FHIRValidator;