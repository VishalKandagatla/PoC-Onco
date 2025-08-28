/**
 * Application configuration and constants
 */

const Config = {
    // Application metadata
    APP_NAME: 'Entheory Oncology Platform',
    VERSION: '2.0.0',
    
    // API configuration
    API_BASE_URL: '/api',
    API_TIMEOUT: 30000, // 30 seconds
    
    // Patient ID validation
    PATIENT_ID_PATTERN: /^SYNTHETIC-CASE_\d+$/,
    
    // UI configuration
    DEFAULT_AVATAR_COLORS: [
        '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
        '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'
    ],
    
    DEBOUNCE_DELAY: 300,
    TOAST_DURATION: 3000,
    
    // Status mappings
    TREATMENT_STATUS_MAP: {
        'Active Treatment': { class: 'status-active', text: 'Active', color: 'green' },
        'In Remission': { class: 'status-remission', text: 'Remission', color: 'blue' },
        'Monitoring': { class: 'status-monitoring', text: 'Monitoring', color: 'yellow' },
        'Follow-up Required': { class: 'status-monitoring', text: 'Follow-up', color: 'yellow' },
        'Completed': { class: 'status-remission', text: 'Completed', color: 'blue' }
    },
    
    LAB_STATUS_MAP: {
        'normal': { class: 'status-normal', color: 'green' },
        'high': { class: 'status-high', color: 'red' },
        'low': { class: 'status-low', color: 'yellow' }
    },
    
    // Navigation configuration
    NAVIGATION_ITEMS: [
        { id: 'search', label: 'Medical Search', href: '/medical-search.html', icon: 'fas fa-search' },
        { id: 'dashboard', label: 'Patient Dashboard', href: '/clinician-dashboard.html', icon: 'fas fa-user-md' },
        { id: 'analytics', label: 'Analytics', href: '#', icon: 'fas fa-chart-line' },
        { id: 'reports', label: 'Reports', href: '#', icon: 'fas fa-file-medical' },
        { id: 'settings', label: 'Settings', href: '#', icon: 'fas fa-cog' }
    ],
    
    // Patient detail tabs
    PATIENT_TABS: [
        { id: 'timeline', label: 'Timeline', icon: 'fas fa-clock' },
        { id: 'history', label: 'Medical History', icon: 'fas fa-file-medical' },
        { id: 'labs', label: 'Lab Results', icon: 'fas fa-vial' },
        { id: 'imaging', label: 'Imaging', icon: 'fas fa-x-ray' },
        { id: 'genomics', label: 'Genomics', icon: 'fas fa-dna' },
        { id: 'molecular', label: 'Molecular Profile', icon: 'fas fa-atom' },
        { id: 'treatment', label: 'Treatment Response', icon: 'fas fa-heartbeat' }
    ],
    
    // Genomics sections
    GENOMICS_SECTIONS: [
        { key: 'germlineGenetics', title: 'Germline Genetics', icon: 'fas fa-user-shield' },
        { key: 'somaticMutations', title: 'Somatic Mutations', icon: 'fas fa-random' },
        { key: 'copyNumberVariations', title: 'Copy Number Variations', icon: 'fas fa-copy' },
        { key: 'msiTmb', title: 'MSI/TMB Analysis', icon: 'fas fa-chart-bar' },
        { key: 'pharmacogenomics', title: 'Pharmacogenomics', icon: 'fas fa-pills' }
    ],
    
    // Date formatting options
    DATE_FORMAT_OPTIONS: {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    },
    
    // Error messages
    ERROR_MESSAGES: {
        PATIENT_NOT_FOUND: 'Patient not found',
        INVALID_PATIENT_ID: 'Invalid patient ID format',
        NETWORK_ERROR: 'Network error occurred',
        DATA_LOAD_ERROR: 'Failed to load data',
        VALIDATION_ERROR: 'Validation error'
    },
    
    // Success messages
    SUCCESS_MESSAGES: {
        DATA_SAVED: 'Data saved successfully',
        PATIENT_UPDATED: 'Patient information updated',
        SEARCH_COMPLETED: 'Search completed'
    },
    
    // Feature flags
    FEATURES: {
        ENABLE_ANALYTICS: false,
        ENABLE_REPORTS: false,
        ENABLE_SETTINGS: false,
        ENABLE_GENOMICS_EXPORT: true,
        ENABLE_IMAGE_ANNOTATIONS: true
    }
};

// Freeze the config object to prevent modifications
Object.freeze(Config);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Config;
} else {
    window.Config = Config;
}