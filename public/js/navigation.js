/**
 * Navigation component for consistent navigation across pages
 */

const Navigation = {
    /**
     * Generate navigation HTML
     * @param {string} currentPage - Current page identifier
     * @returns {string} Navigation HTML
     */
    generateNav(currentPage = '') {
        const navItems = [
            { id: 'search', label: 'Medical Search', href: '/medical-search.html' },
            { id: 'dashboard', label: 'Patient Dashboard', href: '/clinician-dashboard.html' },
            { id: 'analytics', label: 'Analytics', href: '/hospital-analytics.html' },
            { id: 'reports', label: 'Reports', href: '/tumor-board-reports.html' },
            { id: 'settings', label: 'Settings', href: '#' }
        ];

        const navLinks = navItems.map(item => {
            const isActive = item.id === currentPage;
            const activeClass = isActive ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600 font-medium transition-colors';
            
            return `
                <a href="${item.href}" class="nav-link ${activeClass}">
                    ${item.label}
                </a>
            `;
        }).join('');

        return `
            <nav class="glass-nav fixed top-0 left-0 right-0 z-50">
                <div class="max-w-7xl mx-auto px-6">
                    <div class="flex items-center justify-between h-16">
                        <!-- Entheory Logo -->
                        <div class="flex items-center">
                            <a href="/clinician-dashboard.html" class="flex items-center hover:opacity-80 transition-opacity">
                                <img src="/images/logo.svg" alt="Entheory" class="h-8 w-auto">
                            </a>
                        </div>
                        
                        <!-- Navigation Links -->
                        <div class="flex items-center space-x-6">
                            ${navLinks}
                        </div>
                    </div>
                </div>
            </nav>
        `;
    },

    /**
     * Initialize navigation for a page
     * @param {string} currentPage - Current page identifier
     */
    init(currentPage = '') {
        // Add navigation to the page if it doesn't exist
        let nav = document.querySelector('.glass-nav');
        if (!nav) {
            document.body.insertAdjacentHTML('afterbegin', this.generateNav(currentPage));
        }

        // Add padding to body to account for fixed navigation
        document.body.style.paddingTop = '64px';

        // Handle navigation clicks
        this.attachEventListeners();
    },

    /**
     * Attach event listeners for navigation functionality
     */
    attachEventListeners() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Handle disabled links
                if (link.getAttribute('href') === '#') {
                    e.preventDefault();
                    Utils.showToast('This feature is coming soon!', 'info');
                }
            });
        });
    },

    /**
     * Update active navigation item
     * @param {string} pageId - Page identifier to mark as active
     */
    setActive(pageId) {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.classList.remove('text-blue-600', 'font-semibold');
            link.classList.add('text-gray-700', 'hover:text-blue-600', 'font-medium', 'transition-colors');
        });

        // Find and activate the correct link based on page ID
        const navMapping = {
            'search': '/medical-search.html',
            'dashboard': '/clinician-dashboard.html',
            'analytics': '/hospital-analytics.html',
            'reports': '/tumor-board-reports.html'
        };

        const targetHref = navMapping[pageId];
        if (targetHref) {
            const activeLink = Array.from(navLinks).find(link => link.getAttribute('href') === targetHref);
            if (activeLink) {
                activeLink.classList.remove('text-gray-700', 'hover:text-blue-600', 'font-medium', 'transition-colors');
                activeLink.classList.add('text-blue-600', 'font-semibold');
            }
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Navigation;
} else {
    window.Navigation = Navigation;
}