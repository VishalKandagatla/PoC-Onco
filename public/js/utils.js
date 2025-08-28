/**
 * Utility functions for common operations
 */

const Utils = {
    /**
     * Format a date string to a readable format
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date
     */
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            console.warn('Invalid date format:', dateString);
            return dateString;
        }
    },

    /**
     * Get initials from a full name
     * @param {string} name - Full name
     * @returns {string} Initials
     */
    getInitials(name) {
        if (!name) return '??';
        return name
            .split(' ')
            .map(part => part.charAt(0).toUpperCase())
            .join('')
            .substring(0, 2);
    },

    /**
     * Generate a random color for avatars
     * @param {string} seed - String to seed the color generation
     * @returns {string} Hex color
     */
    generateAvatarColor(seed) {
        const colors = [
            '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
            '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'
        ];
        if (!seed) return colors[0];
        
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = seed.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    },

    /**
     * Debounce function to limit API calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Show loading state on an element
     * @param {HTMLElement} element - Element to show loading on
     * @param {string} text - Loading text (optional)
     */
    showLoading(element, text = 'Loading...') {
        if (!element) return;
        element.innerHTML = `
            <div class="flex items-center justify-center p-4">
                <div class="loading-spinner mr-2"></div>
                <span>${text}</span>
            </div>
        `;
    },

    /**
     * Show error state on an element
     * @param {HTMLElement} element - Element to show error on
     * @param {string} message - Error message
     */
    showError(element, message = 'An error occurred') {
        if (!element) return;
        element.innerHTML = `
            <div class="text-center p-4 text-red-600">
                <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                <p>${message}</p>
            </div>
        `;
    },

    /**
     * Validate patient ID format
     * @param {string} patientId - Patient ID to validate
     * @returns {boolean} Is valid
     */
    isValidPatientId(patientId) {
        return patientId && typeof patientId === 'string' && patientId.startsWith('SYNTHETIC-CASE_');
    },

    /**
     * Safely get nested object property
     * @param {Object} obj - Object to traverse
     * @param {string} path - Dot notation path (e.g., 'user.profile.name')
     * @param {*} defaultValue - Default value if path doesn't exist
     * @returns {*} Property value or default
     */
    getNestedProperty(obj, path, defaultValue = null) {
        try {
            return path.split('.').reduce((current, key) => current && current[key], obj) || defaultValue;
        } catch (error) {
            return defaultValue;
        }
    },

    /**
     * Sanitize HTML to prevent XSS
     * @param {string} html - HTML string to sanitize
     * @returns {string} Sanitized HTML
     */
    sanitizeHtml(html) {
        if (!html) return '';
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    },

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} Success status
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.warn('Clipboard API not available, falling back to legacy method');
            try {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            } catch (fallbackError) {
                console.error('Failed to copy to clipboard:', fallbackError);
                return false;
            }
        }
    },

    /**
     * Create a toast notification
     * @param {string} message - Message to display
     * @param {string} type - Type of toast (success, error, info, warning)
     * @param {number} duration - Duration in milliseconds
     */
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white max-w-sm transition-all duration-300 transform translate-x-full`;
        
        const bgColors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };
        
        toast.classList.add(bgColors[type] || bgColors.info);
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.remove('translate-x-full'), 100);
        
        // Animate out and remove
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, duration);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
} else {
    window.Utils = Utils;
}