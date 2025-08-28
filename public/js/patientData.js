// Shared patient data for all pages
window.PATIENT_DATA = [
    {
        id: 'SYNTHETIC-CASE_1',
        name: 'Rajesh Kumar',
        age: 60,
        gender: 'Male',
        diagnosis: 'Oral Squamous Cell Carcinoma',
        stage: 'T2N1M0',
        treatmentStatus: 'Active Treatment',
        lastVisit: '2024-12-15',
        medicalHistory: {
            chiefComplaint: 'Progressive ulcerative lesion on the right lateral border of tongue for 3 months with associated pain and difficulty swallowing.',
            pastMedicalHistory: [
                'Hypertension (controlled with ACE inhibitors)',
                'Type 2 Diabetes Mellitus (well-controlled)',
                'Previous tobacco use (quit 5 years ago)'
            ],
            familyHistory: [
                'Father: Lung cancer (deceased at 65)',
                'Mother: Diabetes, hypertension (living)',
                'No known family history of head/neck cancers'
            ],
            socialHistory: [
                'Former smoker: 30 pack-year history, quit 5 years ago',
                'Occasional alcohol use (2-3 drinks/week)',
                'Retired construction worker',
                'Lives with spouse, good social support'
            ]
        },
        labResults: [
            { name: 'Hemoglobin', value: '11.2', unit: 'g/dL', normal: '12.0-15.5', status: 'low' },
            { name: 'White Blood Count', value: '3.8', unit: 'K/uL', normal: '4.0-11.0', status: 'low' },
            { name: 'Platelets', value: '145', unit: 'K/uL', normal: '150-400', status: 'low' },
            { name: 'Creatinine', value: '1.1', unit: 'mg/dL', normal: '0.7-1.3', status: 'normal' },
            { name: 'ALT', value: '28', unit: 'U/L', normal: '7-56', status: 'normal' },
            { name: 'CEA', value: '3.2', unit: 'ng/mL', normal: '<3.0', status: 'high' }
        ],
        imaging: [
            {
                date: '2024-12-15',
                type: 'CT Neck/Chest',
                findings: 'Partial response to treatment. Primary tumor decreased from 3.2cm to 2.1cm. No new lymphadenopathy.',
                impression: 'Favorable treatment response',
                image: '/patients/SYNTHETIC-CASE_1/images/case_1_followup.png'
            },
            {
                date: '2024-10-25',
                type: 'MRI Head/Neck',
                findings: 'Enhancing mass at right lateral tongue measuring 3.2 x 2.8 cm. Single enlarged right cervical lymph node.',
                impression: 'Primary oral cavity malignancy with regional nodal involvement',
                image: '/patients/SYNTHETIC-CASE_1/images/case_1_baseline.png'
            }
        ],
        genomics: {
            germlineGenetics: [
                { gene: 'BRCA1', result: 'Wild-type', significance: 'No pathogenic variants detected', riskImplication: 'Normal hereditary cancer risk' },
                { gene: 'BRCA2', result: 'Wild-type', significance: 'No pathogenic variants detected', riskImplication: 'Normal hereditary cancer risk' },
                { gene: 'TP53', result: 'Wild-type', significance: 'No Li-Fraumeni syndrome variants', riskImplication: 'Normal p53 function' },
                { gene: 'ATM', result: 'Wild-type', significance: 'No ataxia-telangiectasia variants', riskImplication: 'Normal DNA repair' }
            ],
            somaticMutations: [
                { gene: 'TP53', mutation: 'c.742C>T (p.Arg248Trp)', vaf: '45%', consequence: 'Missense', pathogenicity: 'Pathogenic', therapeuticImplication: 'May respond to p53-targeted therapy' },
                { gene: 'CDKN2A', mutation: 'c.457G>A (p.Ala153Thr)', vaf: '38%', consequence: 'Missense', pathogenicity: 'Likely Pathogenic', therapeuticImplication: 'CDK4/6 inhibitor resistance' },
                { gene: 'PIK3CA', mutation: 'Wild-type', vaf: 'N/A', consequence: 'None', pathogenicity: 'Normal', therapeuticImplication: 'No PI3K pathway alterations' }
            ],
            copyNumberVariations: [
                { gene: 'CCND1', alteration: 'Amplification', copies: '6', significance: 'Oncogene amplification', therapeuticImplication: 'Potential CDK4/6 inhibitor sensitivity' },
                { gene: 'CDKN2A', alteration: 'Deletion', copies: '0', significance: 'Tumor suppressor loss', therapeuticImplication: 'Cell cycle dysregulation' }
            ],
            msiTmb: [
                { test: 'Microsatellite Instability', result: 'MSS (Microsatellite Stable)', interpretation: 'No mismatch repair deficiency', therapeuticImplication: 'Unlikely to respond to PD-1 inhibitors' },
                { test: 'Tumor Mutational Burden', result: '8.2 mutations/Mb', interpretation: 'Intermediate TMB', therapeuticImplication: 'Moderate immunotherapy potential' },
                { test: 'PD-L1 Expression', result: '45%', interpretation: 'High expression', therapeuticImplication: 'Good candidate for immunotherapy' }
            ],
            pharmacogenomics: [
                { gene: 'CYP2D6', genotype: '*1/*4', phenotype: 'Intermediate Metabolizer', drugImplication: 'Reduced efficacy of codeine, tramadol', recommendation: 'Use alternative analgesics' },
                { gene: 'TPMT', genotype: '*1/*1', phenotype: 'Normal Metabolizer', drugImplication: 'Normal 6-mercaptopurine metabolism', recommendation: 'Standard dosing if indicated' },
                { gene: 'DPYD', genotype: '*1/*1', phenotype: 'Normal Metabolizer', drugImplication: 'Normal 5-FU metabolism', recommendation: 'Standard 5-FU dosing' }
            ]
        },
        molecular: {
            geneticTesting: [
                { gene: 'TP53', mutation: 'c.742C>T (p.Arg248Trp)', status: 'Pathogenic' },
                { gene: 'PIK3CA', mutation: 'Wild-type', status: 'Normal' },
                { gene: 'EGFR', mutation: 'Wild-type', status: 'Normal' }
            ],
            biomarkers: [
                { marker: 'PD-L1', expression: '45%', significance: 'High expression, candidate for immunotherapy' },
                { marker: 'HPV Status', result: 'Negative', significance: 'HPV-negative oral cavity cancer' }
            ],
            immunohistochemistry: [
                { marker: 'p16', result: 'Negative', interpretation: 'Consistent with HPV-negative status' },
                { marker: 'Ki-67', result: '65%', interpretation: 'High proliferation index' }
            ]
        },
        treatmentResponse: {
            responses: [
                { date: '2024-12-15', assessment: 'Partial Response', tumor_size: '2.1cm', percent_change: '-34%' },
                { date: '2024-10-25', assessment: 'Baseline', tumor_size: '3.2cm', percent_change: '0%' }
            ],
            sideEffects: [
                { effect: 'Neutropenia', grade: 'Grade 2', management: 'Growth factor support' },
                { effect: 'Nausea/Vomiting', grade: 'Grade 1', management: 'Antiemetics as needed' },
                { effect: 'Fatigue', grade: 'Grade 2', management: 'Activity modification' }
            ],
            performanceStatus: [
                { date: '2024-12-15', ecog: '1', karnofsky: '80', qol_score: '7/10' },
                { date: '2024-10-25', ecog: '0', karnofsky: '90', qol_score: '8/10' }
            ]
        },
        timeline: [
            {
                date: '2024-12-15',
                type: 'Follow-up',
                title: 'Oncology Follow-up',
                description: 'Treatment response evaluation, imaging review',
                status: 'completed'
            },
            {
                date: '2024-11-20',
                type: 'Treatment',
                title: 'Chemotherapy Cycle 4',
                description: 'Carboplatin + Paclitaxel administration',
                status: 'completed'
            },
            {
                date: '2024-10-25',
                type: 'Imaging',
                title: 'CT Scan - Neck/Chest',
                description: 'Response assessment, no new lesions',
                status: 'completed'
            }
        ]
    },
    {
        id: 'SYNTHETIC-CASE_2',
        name: 'Lakshmi Devi',
        age: 45,
        gender: 'Female',
        diagnosis: 'Cervical Carcinoma',
        stage: 'Stage IIIB',
        treatmentStatus: 'In Remission',
        lastVisit: '2024-12-10',
        medicalHistory: {
            chiefComplaint: 'Abnormal vaginal bleeding and post-coital bleeding for 6 months, with progressive pelvic pain.',
            pastMedicalHistory: [
                'No significant past medical history',
                'Previous abnormal Pap smears (not followed up)',
                'Multiparity (4 pregnancies, 3 live births)'
            ],
            familyHistory: [
                'Mother: Cervical cancer (deceased at 55)',
                'Sister: Breast cancer (treated, in remission)',
                'Strong family history of gynecologic malignancies'
            ],
            socialHistory: [
                'Never smoker',
                'Rare alcohol use',
                'Housewife, limited access to healthcare',
                'Low socioeconomic status, rural background'
            ]
        },
        labResults: [
            { name: 'Hemoglobin', value: '9.8', unit: 'g/dL', normal: '12.0-15.5', status: 'low' },
            { name: 'Platelets', value: '380', unit: 'K/uL', normal: '150-400', status: 'normal' },
            { name: 'Creatinine', value: '0.9', unit: 'mg/dL', normal: '0.7-1.3', status: 'normal' },
            { name: 'SCC Antigen', value: '1.2', unit: 'ng/mL', normal: '<1.5', status: 'normal' },
            { name: 'CA-125', value: '18', unit: 'U/mL', normal: '<35', status: 'normal' }
        ],
        imaging: [
            {
                date: '2024-12-10',
                type: 'MRI Pelvis',
                findings: 'No evidence of residual or recurrent disease. Post-surgical changes as expected.',
                impression: 'Complete response, no evidence of disease',
                image: '/patients/SYNTHETIC-CASE_2/images/case_2_followup.png'
            },
            {
                date: '2024-08-20',
                type: 'CT Chest/Abdomen/Pelvis',
                findings: 'Large cervical tumor extending to parametria. No distant metastases.',
                impression: 'Locally advanced cervical cancer, Stage IIIB',
                image: '/patients/SYNTHETIC-CASE_2/images/case_2_baseline.png'
            }
        ],
        genomics: {
            germlineGenetics: [
                { gene: 'BRCA1', result: 'Wild-type', significance: 'No pathogenic variants detected', riskImplication: 'Normal hereditary cancer risk' },
                { gene: 'BRCA2', result: 'Wild-type', significance: 'No pathogenic variants detected', riskImplication: 'Normal hereditary cancer risk' },
                { gene: 'TP53', result: 'Wild-type', significance: 'No Li-Fraumeni syndrome variants', riskImplication: 'Normal p53 function' }
            ],
            somaticMutations: [
                { gene: 'HPV16 E6/E7', mutation: 'Integration detected', vaf: 'N/A', consequence: 'Viral integration', pathogenicity: 'Pathogenic', therapeuticImplication: 'HPV-targeted immunotherapy candidate' },
                { gene: 'PIK3CA', mutation: 'c.3140A>G (p.His1047Arg)', vaf: '42%', consequence: 'Missense', pathogenicity: 'Pathogenic', therapeuticImplication: 'PI3K inhibitor sensitivity' },
                { gene: 'PTEN', mutation: 'c.209+1G>T', vaf: '38%', consequence: 'Splice site', pathogenicity: 'Pathogenic', therapeuticImplication: 'PI3K/mTOR pathway activation' }
            ],
            copyNumberVariations: [
                { gene: 'MYC', alteration: 'Amplification', copies: '4', significance: 'Oncogene amplification', therapeuticImplication: 'Aggressive tumor behavior' },
                { gene: 'RB1', alteration: 'Deletion', copies: '1', significance: 'Tumor suppressor loss', therapeuticImplication: 'Cell cycle checkpoint loss' }
            ],
            msiTmb: [
                { test: 'Microsatellite Instability', result: 'MSS (Microsatellite Stable)', interpretation: 'No mismatch repair deficiency', therapeuticImplication: 'Standard chemotherapy approach' },
                { test: 'Tumor Mutational Burden', result: '4.1 mutations/Mb', interpretation: 'Low TMB', therapeuticImplication: 'Limited immunotherapy benefit' },
                { test: 'PD-L1 Expression', result: '15%', interpretation: 'Low expression', therapeuticImplication: 'Limited PD-1 inhibitor efficacy' }
            ],
            pharmacogenomics: [
                { gene: 'CYP2C19', genotype: '*1/*2', phenotype: 'Intermediate Metabolizer', drugImplication: 'Reduced proton pump inhibitor efficacy', recommendation: 'Consider higher PPI doses' },
                { gene: 'UGT1A1', genotype: '*1/*28', phenotype: 'Intermediate Metabolizer', drugImplication: 'Increased irinotecan toxicity risk', recommendation: 'Reduce irinotecan dose by 25%' }
            ]
        },
        molecular: {
            geneticTesting: [
                { gene: 'HPV Testing', mutation: 'HPV-16 Positive', status: 'Pathogenic' },
                { gene: 'BRCA1/2', mutation: 'Wild-type', status: 'Normal' }
            ],
            biomarkers: [
                { marker: 'PD-L1', expression: '15%', significance: 'Low expression' },
                { marker: 'HPV-16', result: 'Positive', significance: 'HPV-associated cervical cancer' }
            ],
            immunohistochemistry: [
                { marker: 'p16', result: 'Positive', interpretation: 'Consistent with HPV-associated cancer' },
                { marker: 'Ki-67', result: '80%', interpretation: 'Very high proliferation index' }
            ]
        },
        treatmentResponse: {
            responses: [
                { date: '2024-12-10', assessment: 'Complete Response', tumor_size: '0cm', percent_change: '-100%' },
                { date: '2024-08-20', assessment: 'Baseline', tumor_size: '6.2cm', percent_change: '0%' }
            ],
            sideEffects: [
                { effect: 'Radiation Proctitis', grade: 'Grade 1', management: 'Symptomatic care' },
                { effect: 'Bladder Irritation', grade: 'Grade 1', management: 'Resolved spontaneously' }
            ],
            performanceStatus: [
                { date: '2024-12-10', ecog: '0', karnofsky: '100', qol_score: '9/10' },
                { date: '2024-08-20', ecog: '2', karnofsky: '70', qol_score: '5/10' }
            ]
        },
        timeline: [
            {
                date: '2024-12-10',
                type: 'Follow-up',
                title: 'Routine Follow-up',
                description: 'Clinical examination, no evidence of disease',
                status: 'completed'
            },
            {
                date: '2024-09-15',
                type: 'Surgery',
                title: 'Radical Hysterectomy',
                description: 'Successful surgical resection',
                status: 'completed'
            },
            {
                date: '2024-08-20',
                type: 'Treatment',
                title: 'Concurrent Chemoradiation',
                description: 'Weekly cisplatin with external beam radiation',
                status: 'completed'
            }
        ]
    },
    {
        id: 'SYNTHETIC-CASE_3',
        name: 'Rina Saha',
        age: 52,
        gender: 'Female',
        diagnosis: 'Breast Carcinoma',
        stage: 'Stage IIA',
        treatmentStatus: 'Monitoring',
        lastVisit: '2024-12-08',
        medicalHistory: {
            chiefComplaint: 'Self-detected right breast lump for 2 months, non-tender, gradually increasing in size.',
            pastMedicalHistory: [
                'Hypothyroidism (well-controlled on levothyroxine)',
                'Osteopenia (on calcium and vitamin D)',
                'No previous cancers or significant medical history'
            ],
            familyHistory: [
                'Maternal aunt: Breast cancer (diagnosed at 65)',
                'Mother: Diabetes, hypertension (living)',
                'No known BRCA mutations in family'
            ],
            socialHistory: [
                'Never smoker',
                'Occasional alcohol use (1-2 glasses wine/week)',
                'Teacher, active lifestyle',
                'Married with 2 adult children, strong support system'
            ]
        },
        labResults: [
            { name: 'Hemoglobin', value: '12.8', unit: 'g/dL', normal: '12.0-15.5', status: 'normal' },
            { name: 'White Blood Count', value: '6.2', unit: 'K/uL', normal: '4.0-11.0', status: 'normal' },
            { name: 'Platelets', value: '280', unit: 'K/uL', normal: '150-400', status: 'normal' },
            { name: 'CA 15-3', value: '22', unit: 'U/mL', normal: '<30', status: 'normal' },
            { name: 'CEA', value: '1.8', unit: 'ng/mL', normal: '<3.0', status: 'normal' },
            { name: 'LDH', value: '180', unit: 'U/L', normal: '140-280', status: 'normal' }
        ],
        imaging: [
            {
                date: '2024-12-08',
                type: 'Mammography + US',
                findings: 'No evidence of recurrent disease. Post-surgical changes in right breast as expected.',
                impression: 'Normal post-treatment surveillance imaging',
                image: '/patients/SYNTHETIC-CASE_3/images/case_3_followup.png'
            },
            {
                date: '2024-09-15',
                type: 'CT Chest/Abdomen',
                findings: 'No evidence of metastatic disease. Normal post-chemotherapy appearance.',
                impression: 'No evidence of disease progression'
            },
            {
                date: '2024-03-15',
                type: 'MRI Breast',
                findings: 'Right breast mass measuring 2.3 x 1.8 cm. No multifocal or multicentric disease.',
                impression: 'Unifocal right breast carcinoma',
                image: '/patients/SYNTHETIC-CASE_3/images/case_3_baseline.png'
            }
        ],
        genomics: {
            germlineGenetics: [
                { gene: 'BRCA1', result: 'Wild-type', significance: 'No pathogenic variants detected', riskImplication: 'Normal hereditary breast cancer risk' },
                { gene: 'BRCA2', result: 'Wild-type', significance: 'No pathogenic variants detected', riskImplication: 'Normal hereditary breast cancer risk' },
                { gene: 'PALB2', result: 'Wild-type', significance: 'No pathogenic variants detected', riskImplication: 'Normal DNA repair function' },
                { gene: 'CHEK2', result: 'Wild-type', significance: 'No pathogenic variants detected', riskImplication: 'Normal cell cycle control' }
            ],
            somaticMutations: [
                { gene: 'PIK3CA', mutation: 'c.3140A>G (p.His1047Arg)', vaf: '35%', consequence: 'Missense', pathogenicity: 'Pathogenic', therapeuticImplication: 'PI3K inhibitor (alpelisib) sensitivity' },
                { gene: 'ESR1', mutation: 'Wild-type', vaf: 'N/A', consequence: 'None', pathogenicity: 'Normal', therapeuticImplication: 'Standard hormone therapy response' },
                { gene: 'CDH1', mutation: 'c.2398delA (p.Asn800ThrfsTer21)', vaf: '28%', consequence: 'Frameshift', pathogenicity: 'Likely Pathogenic', therapeuticImplication: 'Invasive lobular characteristics' }
            ],
            copyNumberVariations: [
                { gene: 'ERBB2 (HER2)', alteration: 'Normal', copies: '2', significance: 'No amplification', therapeuticImplication: 'Not HER2-positive, no anti-HER2 therapy' },
                { gene: 'MYC', alteration: 'Normal', copies: '2', significance: 'No amplification', therapeuticImplication: 'Standard proliferation rate' },
                { gene: 'CCND1', alteration: 'Low-level gain', copies: '3', significance: 'Mild oncogene gain', therapeuticImplication: 'Potential CDK4/6 inhibitor benefit' }
            ],
            msiTmb: [
                { test: 'Microsatellite Instability', result: 'MSS (Microsatellite Stable)', interpretation: 'No mismatch repair deficiency', therapeuticImplication: 'Standard treatment approach' },
                { test: 'Tumor Mutational Burden', result: '3.8 mutations/Mb', interpretation: 'Low TMB', therapeuticImplication: 'Limited immunotherapy benefit' },
                { test: 'Homologous Recombination Deficiency', result: 'HRD Score: 15 (Low)', interpretation: 'Intact DNA repair', therapeuticImplication: 'PARP inhibitor not indicated' }
            ],
            pharmacogenomics: [
                { gene: 'CYP2D6', genotype: '*1/*1', phenotype: 'Normal Metabolizer', drugImplication: 'Normal tamoxifen activation', recommendation: 'Standard tamoxifen dosing effective' },
                { gene: 'CYP19A1', genotype: 'Normal variants', phenotype: 'Normal Aromatase', drugImplication: 'Standard aromatase inhibitor response', recommendation: 'Standard AI dosing' },
                { gene: 'SLCO1B1', genotype: '*1/*1', phenotype: 'Normal Function', drugImplication: 'Normal statin clearance', recommendation: 'Standard statin dosing for cardioprotection' }
            ]
        },
        molecular: {
            geneticTesting: [
                { gene: 'BRCA1', mutation: 'Wild-type', status: 'Normal' },
                { gene: 'BRCA2', mutation: 'Wild-type', status: 'Normal' },
                { gene: 'TP53', mutation: 'Wild-type', status: 'Normal' }
            ],
            biomarkers: [
                { marker: 'ER Status', expression: '95%', significance: 'Strongly positive, hormone-sensitive' },
                { marker: 'PR Status', expression: '80%', significance: 'Positive, hormone-sensitive' },
                { marker: 'HER2', result: 'Negative (1+)', significance: 'Not HER2-amplified, no targeted therapy needed' }
            ],
            immunohistochemistry: [
                { marker: 'ER', result: '95% Positive', interpretation: 'Strong estrogen receptor expression' },
                { marker: 'PR', result: '80% Positive', interpretation: 'Strong progesterone receptor expression' },
                { marker: 'HER2', result: '1+ (Negative)', interpretation: 'Not amplified, IHC negative' },
                { marker: 'Ki-67', result: '15%', interpretation: 'Low-intermediate proliferation index' }
            ]
        },
        treatmentResponse: {
            responses: [
                { date: '2024-12-08', assessment: 'Complete Response', tumor_size: '0cm', percent_change: '-100%' },
                { date: '2024-08-20', assessment: 'Complete Response', tumor_size: '0cm', percent_change: '-100%' },
                { date: '2024-03-15', assessment: 'Baseline', tumor_size: '2.3cm', percent_change: '0%' }
            ],
            sideEffects: [
                { effect: 'Neuropathy', grade: 'Grade 1', management: 'Resolved, no ongoing symptoms' },
                { effect: 'Hot Flashes', grade: 'Grade 2', management: 'Ongoing, managed with lifestyle modifications' },
                { effect: 'Joint Stiffness', grade: 'Grade 1', management: 'Aromatase inhibitor-related, managed with exercise' }
            ],
            performanceStatus: [
                { date: '2024-12-08', ecog: '0', karnofsky: '95', qol_score: '8/10' },
                { date: '2024-08-20', ecog: '0', karnofsky: '90', qol_score: '8/10' },
                { date: '2024-03-15', ecog: '1', karnofsky: '85', qol_score: '7/10' }
            ]
        },
        timeline: [
            {
                date: '2024-12-08',
                type: 'Follow-up',
                title: 'Post-treatment Monitoring',
                description: 'Mammography and clinical assessment',
                status: 'completed'
            },
            {
                date: '2024-09-15',
                type: 'Follow-up',
                title: 'Routine Surveillance',
                description: 'CT scan and tumor markers',
                status: 'completed'
            },
            {
                date: '2024-08-20',
                type: 'Treatment',
                title: 'Adjuvant Therapy Completed',
                description: 'Final cycle of adjuvant chemotherapy',
                status: 'completed'
            },
            {
                date: '2024-04-10',
                type: 'Surgery',
                title: 'Right Breast Lumpectomy',
                description: 'Breast-conserving surgery with sentinel lymph node biopsy',
                status: 'completed'
            }
        ]
    }
];

// Helper function to get patient by ID
window.getPatientById = function(patientId) {
    return window.PATIENT_DATA.find(p => p.id === patientId);
};

// Helper function to get all patients
window.getAllPatients = function() {
    return window.PATIENT_DATA;
};