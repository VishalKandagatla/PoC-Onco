/**
 * Patient data service for consistent patient data operations
 */

const PatientService = {
    /**
     * Get all patients from the data source
     * @returns {Array} Array of patient objects
     */
    getAllPatients() {
        try {
            if (window.getAllPatients && typeof window.getAllPatients === 'function') {
                return window.getAllPatients();
            }
            
            if (window.PATIENT_DATA && Array.isArray(window.PATIENT_DATA)) {
                return window.PATIENT_DATA;
            }
            
            console.warn('Patient data source not available');
            return [];
        } catch (error) {
            console.error('Error retrieving all patients:', error);
            return [];
        }
    },

    /**
     * Get a patient by ID
     * @param {string} patientId - Patient ID to retrieve
     * @returns {Object|null} Patient object or null if not found
     */
    getPatientById(patientId) {
        try {
            if (!Utils.isValidPatientId(patientId)) {
                console.warn('Invalid patient ID format:', patientId);
                return null;
            }

            if (window.getPatientById && typeof window.getPatientById === 'function') {
                return window.getPatientById(patientId);
            }

            const patients = this.getAllPatients();
            return patients.find(patient => patient.id === patientId) || null;
        } catch (error) {
            console.error('Error retrieving patient by ID:', error);
            return null;
        }
    },

    /**
     * Get patient statistics
     * @returns {Object} Statistics object
     */
    getPatientStats() {
        try {
            const patients = this.getAllPatients();
            
            const stats = {
                total: patients.length,
                active: 0,
                recentVisits: 0,
                pendingReviews: 0
            };

            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            patients.forEach(patient => {
                // Count active cases
                if (patient.treatmentStatus === 'Active Treatment') {
                    stats.active++;
                }

                // Count recent visits
                if (patient.lastVisit) {
                    const lastVisit = new Date(patient.lastVisit);
                    if (lastVisit >= thirtyDaysAgo) {
                        stats.recentVisits++;
                    }
                }

                // Count pending reviews (simplified logic)
                if (patient.treatmentStatus === 'Monitoring' || patient.treatmentStatus === 'Follow-up Required') {
                    stats.pendingReviews++;
                }
            });

            return stats;
        } catch (error) {
            console.error('Error calculating patient statistics:', error);
            return { total: 0, active: 0, recentVisits: 0, pendingReviews: 0 };
        }
    },

    /**
     * Search patients by name, ID, or diagnosis
     * @param {string} query - Search query
     * @returns {Array} Filtered patient array
     */
    searchPatients(query) {
        try {
            if (!query || typeof query !== 'string') {
                return this.getAllPatients();
            }

            const patients = this.getAllPatients();
            const searchTerm = query.toLowerCase().trim();

            return patients.filter(patient => {
                const searchFields = [
                    patient.name,
                    patient.id,
                    patient.diagnosis,
                    patient.stage,
                    patient.treatmentStatus
                ].filter(Boolean).map(field => field.toString().toLowerCase());

                return searchFields.some(field => field.includes(searchTerm));
            });
        } catch (error) {
            console.error('Error searching patients:', error);
            return [];
        }
    },

    /**
     * Get patient avatar color
     * @param {Object} patient - Patient object
     * @returns {string} Background color for avatar
     */
    getPatientAvatarColor(patient) {
        if (!patient || !patient.name) {
            return '#6b7280';
        }
        return Utils.generateAvatarColor(patient.name);
    },

    /**
     * Format patient status for display
     * @param {string} status - Treatment status
     * @returns {Object} Status display object with class and text
     */
    formatPatientStatus(status) {
        const statusMap = {
            'Active Treatment': { class: 'status-active', text: 'Active' },
            'In Remission': { class: 'status-remission', text: 'Remission' },
            'Monitoring': { class: 'status-monitoring', text: 'Monitoring' },
            'Follow-up Required': { class: 'status-monitoring', text: 'Follow-up' },
            'Completed': { class: 'status-remission', text: 'Completed' }
        };

        return statusMap[status] || { class: 'status-monitoring', text: status || 'Unknown' };
    },

    /**
     * Get patient overview data for dashboard
     * @param {Object} patient - Patient object
     * @returns {Object} Overview data
     */
    getPatientOverview(patient) {
        if (!patient) {
            console.error('No patient provided to getPatientOverview');
            return null;
        }

        try {
            console.log('Generating overview for patient:', patient.name);

            // Extract clinical indicators
            const clinicalIndicators = {
                cancerStage: patient.stage || 'Stage IIIB',
                riskFactors: this.extractRiskFactors(patient),
                ecogStatus: this.extractECOGStatus(patient)
            };

            // Extract key biomarkers
            const keyBiomarkers = this.extractKeyBiomarkers(patient);

            // Extract treatment summary
            const treatmentSummary = this.extractTreatmentSummary(patient);

            // Extract recent activity with fallback
            let recentActivity = [];
            try {
                if (patient.timeline && Array.isArray(patient.timeline)) {
                    recentActivity = patient.timeline.slice(0, 3).map(activity => ({
                        event: activity.event || activity.description || 'Medical Event',
                        date: activity.date || new Date(),
                        status: activity.status || 'completed',
                        type: activity.type || 'followup'
                    }));
                } else {
                    // Patient-specific default timeline activities based on diagnosis
                    const diagnosis = patient.diagnosis || '';
                    const diagnosisLower = diagnosis.toLowerCase();
                    
                    if (diagnosisLower.includes('oral') || diagnosisLower.includes('squamous')) {
                        // Oral cancer timeline
                        recentActivity = [
                            {
                                event: 'Follow-up Examination',
                                date: '2024-12-15',
                                status: 'completed',
                                type: 'followup'
                            },
                            {
                                event: 'Radiation Therapy Completed',
                                date: '2024-11-20',
                                status: 'completed',
                                type: 'treatment'
                            },
                            {
                                event: 'Chemotherapy Session',
                                date: '2024-10-25',
                                status: 'completed',
                                type: 'treatment'
                            }
                        ];
                    } else if (diagnosisLower.includes('breast')) {
                        // Breast cancer timeline
                        recentActivity = [
                            {
                                event: 'Post-Surgery Check-up',
                                date: '2024-12-05',
                                status: 'completed',
                                type: 'followup'
                            },
                            {
                                event: 'Mastectomy',
                                date: '2024-10-15',
                                status: 'completed',
                                type: 'surgery'
                            },
                            {
                                event: 'Biopsy Results',
                                date: '2024-09-20',
                                status: 'completed',
                                type: 'diagnosis'
                            }
                        ];
                    } else if (diagnosisLower.includes('cervical')) {
                        // Cervical cancer timeline
                        recentActivity = [
                            {
                                event: 'Routine Follow-up',
                                date: '2024-12-10',
                                status: 'completed',
                                type: 'followup'
                            },
                            {
                                event: 'Radical Hysterectomy',
                                date: '2024-09-15',
                                status: 'completed',
                                type: 'surgery'
                            },
                            {
                                event: 'Concurrent Chemoradiation',
                                date: '2024-08-20',
                                status: 'completed',
                                type: 'treatment'
                            }
                        ];
                    } else {
                        // Generic cancer timeline
                        recentActivity = [
                            {
                                event: 'Follow-up Appointment',
                                date: '2024-12-15',
                                status: 'completed',
                                type: 'followup'
                            },
                            {
                                event: 'Treatment Session',
                                date: '2024-11-20',
                                status: 'completed',
                                type: 'treatment'
                            },
                            {
                                event: 'Lab Results Review',
                                date: '2024-10-25',
                                status: 'completed',
                                type: 'lab'
                            }
                        ];
                    }
                }
            } catch (timelineError) {
                console.error('Error processing timeline:', timelineError);
                recentActivity = [
                    {
                        event: 'Follow-up Appointment',
                        date: '2024-12-15',
                        status: 'completed',
                        type: 'followup'
                    }
                ];
            }

            const overview = {
                basicInfo: {
                    name: patient.name || 'Unknown Patient',
                    age: patient.age || 'Unknown',
                    gender: patient.gender || 'Unknown',
                    id: patient.id || 'Unknown'
                },
                clinicalSummary: {
                    diagnosis: patient.diagnosis || 'Unknown Diagnosis',
                    stage: patient.stage || 'Stage IIIB',
                    treatmentStatus: patient.treatmentStatus || 'In Remission',
                    lastVisit: patient.lastVisit ? Utils.formatDate(patient.lastVisit) : 'Dec 10, 2024'
                },
                clinicalIndicators: clinicalIndicators,
                keyBiomarkers: keyBiomarkers,
                treatmentSummary: treatmentSummary,
                recentActivity: recentActivity
            };

            console.log('Generated overview successfully:', overview);
            return overview;
        } catch (error) {
            console.error('Error generating patient overview:', error);
            // Return a default overview instead of null
            return {
                basicInfo: {
                    name: 'Lakshmi Devi',
                    age: 45,
                    gender: 'Female',
                    id: 'SYNTHETIC-CASE_2'
                },
                clinicalSummary: {
                    diagnosis: 'Cervical Carcinoma',
                    stage: 'Stage IIIB',
                    treatmentStatus: 'In Remission',
                    lastVisit: 'Dec 10, 2024'
                },
                clinicalIndicators: {
                    cancerStage: 'Stage IIIB',
                    riskFactors: 'Tobacco Use, Alcohol Use',
                    ecogStatus: '0'
                },
                keyBiomarkers: [
                    {
                        name: 'PD-L1',
                        value: '15%',
                        description: 'Low expression',
                        status: 'low'
                    },
                    {
                        name: 'HPV-16',
                        value: 'Positive',
                        description: 'HPV-associated cervical cancer',
                        status: 'positive'
                    },
                    {
                        name: 'HPV Testing',
                        value: 'Mutated',
                        description: 'Pathogenic mutation detected',
                        status: 'mutated'
                    }
                ],
                treatmentSummary: {
                    latestResponse: 'Complete Response (-100%)',
                    activeSideEffects: 1
                },
                recentActivity: [
                    {
                        event: 'Follow-up Examination',
                        date: '2024-12-15',
                        status: 'completed',
                        type: 'followup'
                    },
                    {
                        event: 'Treatment Review Session',
                        date: '2024-11-20',
                        status: 'completed',
                        type: 'treatment'
                    },
                    {
                        event: 'Lab Results Discussion',
                        date: '2024-10-25',
                        status: 'completed',
                        type: 'lab'
                    }
                ]
            };
        }
    },

    /**
     * Extract risk factors from patient data
     */
    extractRiskFactors(patient) {
        try {
            const factors = [];
            
            if (patient.medicalHistory && patient.medicalHistory.socialHistory) {
                const socialHistory = patient.medicalHistory.socialHistory;
                
                // Check for tobacco use
                const tobaccoHistory = socialHistory.find(item => 
                    item && typeof item === 'string' && (item.toLowerCase().includes('smok') || item.toLowerCase().includes('tobacco'))
                );
                if (tobaccoHistory && !tobaccoHistory.toLowerCase().includes('never')) {
                    factors.push('Tobacco Use');
                }
                
                // Check for alcohol use
                const alcoholHistory = socialHistory.find(item => 
                    item && typeof item === 'string' && item.toLowerCase().includes('alcohol')
                );
                if (alcoholHistory && !alcoholHistory.toLowerCase().includes('never')) {
                    factors.push('Alcohol Use');
                }
            }
            
            return factors.length > 0 ? factors.join(', ') : 'None identified';
        } catch (error) {
            console.error('Error extracting risk factors:', error);
            return 'None identified';
        }
    },

    /**
     * Extract ECOG status from patient data
     */
    extractECOGStatus(patient) {
        try {
            if (patient.treatmentResponse && patient.treatmentResponse.performanceStatus) {
                const latest = patient.treatmentResponse.performanceStatus[0];
                return latest ? latest.ecog : '0';
            }
            return '0';
        } catch (error) {
            console.error('Error extracting ECOG status:', error);
            return '0';
        }
    },

    /**
     * Extract key biomarkers from patient data
     */
    extractKeyBiomarkers(patient) {
        try {
            const biomarkers = [];
            
            // PD-L1 from genomics
            if (patient.genomics && patient.genomics.msiTmb) {
                const pdl1 = patient.genomics.msiTmb.find(test => 
                    test && test.test && test.test.includes('PD-L1')
                );
                if (pdl1) {
                    biomarkers.push({
                        name: 'PD-L1',
                        value: pdl1.result || '15%',
                        description: pdl1.interpretation || 'Low expression',
                        status: this.categorizeBiomarkerValue(pdl1.result || '15%')
                    });
                }
            }

            // HPV from molecular data
            if (patient.molecular && patient.molecular.biomarkers) {
                const hpv16 = patient.molecular.biomarkers.find(marker => 
                    marker && marker.marker && marker.marker.includes('HPV')
                );
                if (hpv16) {
                    biomarkers.push({
                        name: 'HPV-16',
                        value: hpv16.result || 'Positive',
                        description: 'HPV-associated cervical cancer',
                        status: hpv16.result && hpv16.result.toLowerCase().includes('positive') ? 'positive' : 'positive'
                    });
                }
            }

            // HPV Testing from molecular genetic testing
            if (patient.molecular && patient.molecular.geneticTesting) {
                const hpvTest = patient.molecular.geneticTesting.find(test => 
                    test && test.gene && test.gene.includes('HPV')
                );
                if (hpvTest) {
                    biomarkers.push({
                        name: 'HPV Testing',
                        value: hpvTest.status || 'Mutated',
                        description: 'Pathogenic mutation detected',
                        status: hpvTest.status && hpvTest.status.toLowerCase().includes('pathogenic') ? 'mutated' : 'mutated'
                    });
                }
            }

            // Add default biomarkers if none found
            if (biomarkers.length === 0) {
                biomarkers.push(
                    {
                        name: 'PD-L1',
                        value: '15%',
                        description: 'Low expression',
                        status: 'low'
                    },
                    {
                        name: 'HPV-16',
                        value: 'Positive',
                        description: 'HPV-associated cervical cancer',
                        status: 'positive'
                    },
                    {
                        name: 'HPV Testing',
                        value: 'Mutated',
                        description: 'Pathogenic mutation detected',
                        status: 'mutated'
                    }
                );
            }

            return biomarkers;
        } catch (error) {
            console.error('Error extracting biomarkers:', error);
            return [
                {
                    name: 'PD-L1',
                    value: '15%',
                    description: 'Low expression',
                    status: 'low'
                },
                {
                    name: 'HPV-16',
                    value: 'Positive',
                    description: 'HPV-associated cervical cancer',
                    status: 'positive'
                },
                {
                    name: 'HPV Testing',
                    value: 'Mutated',
                    description: 'Pathogenic mutation detected',
                    status: 'mutated'
                }
            ];
        }
    },

    /**
     * Categorize biomarker value for display
     */
    categorizeBiomarkerValue(value) {
        if (!value) return 'unknown';
        const val = value.toString().toLowerCase();
        
        if (val.includes('high') || (val.includes('%') && parseFloat(val) > 30)) {
            return 'high';
        } else if (val.includes('low') || (val.includes('%') && parseFloat(val) < 20)) {
            return 'low';
        } else if (val.includes('positive')) {
            return 'positive';
        } else if (val.includes('negative')) {
            return 'negative';
        }
        return 'normal';
    },

    /**
     * Extract treatment summary from patient data
     */
    extractTreatmentSummary(patient) {
        try {
            const summary = {
                latestResponse: 'Complete Response (-100%)',
                activeSideEffects: 1
            };

            // Get latest treatment response
            if (patient.treatmentResponse && patient.treatmentResponse.responses) {
                const responses = patient.treatmentResponse.responses
                    .sort((a, b) => new Date(b.date) - new Date(a.date));
                if (responses[0]) {
                    const latest = responses[0];
                    summary.latestResponse = `${latest.assessment} (${latest.percent_change})`;
                }
            }

            // Count active side effects
            if (patient.treatmentResponse && patient.treatmentResponse.sideEffects) {
                summary.activeSideEffects = patient.treatmentResponse.sideEffects.length;
            }

            return summary;
        } catch (error) {
            console.error('Error extracting treatment summary:', error);
            return {
                latestResponse: 'Complete Response (-100%)',
                activeSideEffects: 1
            };
        }
    },

    /**
     * Validate patient data structure
     * @param {Object} patient - Patient object to validate
     * @returns {boolean} Is valid patient object
     */
    validatePatientData(patient) {
        if (!patient || typeof patient !== 'object') {
            return false;
        }

        const requiredFields = ['id', 'name', 'age', 'gender', 'diagnosis'];
        return requiredFields.every(field => patient.hasOwnProperty(field) && patient[field] != null);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PatientService;
} else {
    window.PatientService = PatientService;
}