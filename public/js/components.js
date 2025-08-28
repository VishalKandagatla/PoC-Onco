/**
 * Reusable UI components for consistent interface elements
 */

const Components = {
    /**
     * Create a patient card element
     * @param {Object} patient - Patient data
     * @param {Function} onClick - Click handler function
     * @returns {string} HTML string for patient card
     */
    createPatientCard(patient, onClick = null) {
        if (!PatientService.validatePatientData(patient)) {
            return '<div class="patient-card error">Invalid patient data</div>';
        }

        const avatarColor = PatientService.getPatientAvatarColor(patient);
        const initials = Utils.getInitials(patient.name);
        const status = PatientService.formatPatientStatus(patient.treatmentStatus);
        const lastVisit = Utils.formatDate(patient.lastVisit);

        const clickHandler = onClick ? `onclick="${onClick.name}('${patient.id}')"` : '';

        return `
            <div class="patient-card" ${clickHandler} data-patient-id="${patient.id}">
                <div class="flex items-center">
                    <div class="patient-avatar" style="background-color: ${avatarColor}">
                        ${initials}
                    </div>
                    <div class="patient-info flex-1">
                        <h3>${Utils.sanitizeHtml(patient.name)}</h3>
                        <div class="patient-meta">
                            ${patient.age} years • ${patient.gender} • ${Utils.sanitizeHtml(patient.diagnosis)}
                        </div>
                        <div class="flex items-center justify-between mt-2">
                            <span class="patient-status ${status.class}">${status.text}</span>
                            <span class="text-sm text-gray-500">Last visit: ${lastVisit}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Create a statistics card
     * @param {Object} stat - Statistics object {value, label, color}
     * @returns {string} HTML string for stat card  
     */
    createStatCard(stat) {
        const { value = 0, label = '', color = 'blue' } = stat;
        
        return `
            <div class="stat-card ${color}">
                <div class="stat-number">${value}</div>
                <div class="stat-label">${Utils.sanitizeHtml(label)}</div>
            </div>
        `;
    },

    /**
     * Create a loading placeholder
     * @param {string} text - Loading text
     * @param {string} size - Size class (sm, md, lg)
     * @returns {string} HTML string for loading placeholder
     */
    createLoadingPlaceholder(text = 'Loading...', size = 'md') {
        const sizeClasses = {
            sm: 'p-2',
            md: 'p-4',
            lg: 'p-8'
        };

        return `
            <div class="flex items-center justify-center ${sizeClasses[size] || sizeClasses.md}">
                <div class="loading-spinner mr-2"></div>
                <span class="text-gray-600">${Utils.sanitizeHtml(text)}</span>
            </div>
        `;
    },

    /**
     * Create an error message component
     * @param {string} message - Error message
     * @param {Function} retry - Optional retry function
     * @returns {string} HTML string for error component
     */
    createErrorMessage(message = 'An error occurred', retry = null) {
        const retryButton = retry ? `
            <button onclick="${retry.name}()" class="btn-secondary mt-2">
                <i class="fas fa-redo mr-2"></i>Try Again
            </button>
        ` : '';

        return `
            <div class="text-center p-8 text-red-600">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <h3 class="text-lg font-semibold mb-2">Error</h3>
                <p class="text-gray-600 mb-4">${Utils.sanitizeHtml(message)}</p>
                ${retryButton}
            </div>
        `;
    },

    /**
     * Create an empty state component
     * @param {Object} options - Empty state options
     * @returns {string} HTML string for empty state
     */
    createEmptyState(options = {}) {
        const {
            icon = 'fas fa-inbox',
            title = 'No data available',
            message = 'There are no items to display.',
            actionText = null,
            actionHandler = null
        } = options;

        const actionButton = actionText && actionHandler ? `
            <button onclick="${actionHandler.name}()" class="btn-primary mt-4">
                ${Utils.sanitizeHtml(actionText)}
            </button>
        ` : '';

        return `
            <div class="text-center p-8 text-gray-500">
                <i class="${icon} text-4xl mb-4"></i>
                <h3 class="text-lg font-semibold mb-2">${Utils.sanitizeHtml(title)}</h3>
                <p class="text-gray-600 mb-4">${Utils.sanitizeHtml(message)}</p>
                ${actionButton}
            </div>
        `;
    },

    /**
     * Create a timeline item
     * @param {Object} item - Timeline item data
     * @returns {string} HTML string for timeline item
     */
    createTimelineItem(item) {
        if (!item) return '';

        const date = Utils.formatDate(item.date);
        const statusColors = {
            completed: 'bg-green-500',
            pending: 'bg-yellow-500',
            cancelled: 'bg-red-500'
        };

        const dotColor = statusColors[item.status] || 'bg-blue-500';

        return `
            <div class="timeline-item">
                <div class="timeline-item::before ${dotColor}"></div>
                <div class="timeline-date">${date}</div>
                <div class="timeline-title">${Utils.sanitizeHtml(item.title || item.type)}</div>
                <div class="timeline-description">${Utils.sanitizeHtml(item.description || '')}</div>
            </div>
        `;
    },

    /**
     * Create a lab result item
     * @param {Object} result - Lab result data
     * @returns {string} HTML string for lab result
     */
    createLabResultItem(result) {
        if (!result) return '';

        const statusClass = result.status === 'normal' ? 'status-normal' : 
                           result.status === 'high' ? 'status-high' : 'status-low';

        return `
            <div class="lab-result">
                <div class="lab-name">${Utils.sanitizeHtml(result.name || '')}</div>
                <div class="lab-value">
                    <span class="mr-2">${result.value || ''} ${result.unit || ''}</span>
                    <span class="lab-status ${statusClass}">${result.status || ''}</span>
                </div>
            </div>
        `;
    },

    /**
     * Create a modal component
     * @param {Object} options - Modal options
     * @returns {string} HTML string for modal
     */
    createModal(options = {}) {
        const {
            id = 'modal',
            title = 'Modal',
            content = '',
            showCloseButton = true,
            size = 'md'
        } = options;

        const sizeClasses = {
            sm: 'max-w-md',
            md: 'max-w-2xl',
            lg: 'max-w-4xl',
            xl: 'max-w-6xl'
        };

        const closeButton = showCloseButton ? `
            <button onclick="Components.closeModal('${id}')" class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times text-xl"></i>
            </button>
        ` : '';

        return `
            <div id="${id}" class="modal-overlay hidden" onclick="Components.closeModal('${id}')">
                <div class="modal-content ${sizeClasses[size] || sizeClasses.md}" onclick="event.stopPropagation()">
                    <div class="flex items-center justify-between p-4 border-b">
                        <h3 class="text-lg font-semibold text-gray-900">${Utils.sanitizeHtml(title)}</h3>
                        ${closeButton}
                    </div>
                    <div class="p-4">
                        ${content}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Show a modal
     * @param {string} modalId - Modal ID to show
     */
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    },

    /**
     * Close a modal
     * @param {string} modalId - Modal ID to close
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    },

    /**
     * Create a search input component
     * @param {Object} options - Search options
     * @returns {string} HTML string for search input
     */
    createSearchInput(options = {}) {
        const {
            placeholder = 'Search...',
            onSearch = null,
            debounceMs = 300
        } = options;

        const searchHandler = onSearch ? `
            oninput="Utils.debounce(${onSearch.name}, ${debounceMs})(this.value)"
        ` : '';

        return `
            <div class="search-container">
                <div class="relative">
                    <input 
                        type="text" 
                        placeholder="${Utils.sanitizeHtml(placeholder)}"
                        class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        ${searchHandler}
                    >
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fas fa-search text-gray-400"></i>
                    </div>
                </div>
            </div>
        `;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Components;
} else {
    window.Components = Components;
}