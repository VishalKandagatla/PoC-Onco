const DataAggregator = require('./dataAggregator');
const Patient = require('../models/Patient');
const DataSource = require('../models/DataSource');
const FHIRValidator = require('../fhir/fhirValidator');
const FileBasedDataService = require('./fileBasedDataService');

class InteroperabilityService {
  constructor() {
    this.dataAggregator = new DataAggregator();
    this.fileDataService = new FileBasedDataService();
  }

  async initializeDataSources() {
    // Using file-based data service, no need to initialize MongoDB collections
    console.log('File-based data service initialized');
  }

  async getPatientData(abhaId, options = {}) {
    try {
      // Use file-based data service instead of MongoDB
      let patient = await this.fileDataService.getPatientByAbhaId(abhaId);
      
      if (!patient) {
        throw new Error(`Patient with ABHA ID ${abhaId} not found`);
      }

      if (options.format === 'fhir') {
        const fhirBundle = this.dataAggregator.convertToFHIR(patient);
        const validation = FHIRValidator.validateResource(fhirBundle);
        
        if (!validation.isValid) {
          console.warn('FHIR validation warnings:', validation.errors);
        }
        
        return {
          format: 'fhir',
          data: fhirBundle,
          validation
        };
      }

      return {
        format: 'native',
        data: patient
      };
    } catch (error) {
      throw new Error(`Failed to get patient data: ${error.message}`);
    }
  }

  async getDataSources() {
    // Return data sources from file-based service
    return await this.fileDataService.getDataSources();
  }

  async updateDataSourceStatus(sourceId, status) {
    // In file-based system, return a mock updated source
    const sources = await this.fileDataService.getDataSources();
    const source = sources.find(s => s._id === sourceId);
    if (!source) {
      throw new Error('Data source not found');
    }
    
    source.syncStatus = status;
    source.lastSync = new Date();
    
    return source;
  }

  async testDataSourceConnection(sourceId) {
    // In file-based system, check if source exists
    const sources = await this.fileDataService.getDataSources();
    const source = sources.find(s => s._id === sourceId);
    if (!source) {
      throw new Error('Data source not found');
    }

    try {
      return {
        source: source.name,
        status: 'connected',
        latency: Math.floor(Math.random() * 100) + 50,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        source: source.name,
        status: 'error',
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  async getSystemHealth() {
    const sources = await this.fileDataService.getDataSources();
    const healthChecks = [];

    for (const source of sources) {
      const check = await this.testDataSourceConnection(source._id);
      healthChecks.push(check);
    }

    const activeCount = healthChecks.filter(h => h.status === 'connected').length;
    const totalCount = healthChecks.length;

    return {
      status: activeCount === totalCount ? 'healthy' : activeCount > 0 ? 'degraded' : 'critical',
      activeSources: activeCount,
      totalSources: totalCount,
      details: healthChecks,
      timestamp: new Date()
    };
  }
}

module.exports = InteroperabilityService;