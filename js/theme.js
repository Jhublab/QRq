/**
 * THEME.JS - Theme Management (Dark/Light Mode)
 * Handles dark and light mode switching with persistence
 */

class ThemeManager {
    constructor() {
        this.storageKey = 'theme_preference';
        this.darkClass = 'dark-mode';
        this.lightClass = 'light-mode';
        this.isDark = this.getInitialTheme();
    }

    /**
     * Get initial theme preference
     * @returns {boolean} True if dark mode
     */
    getInitialTheme() {
        // Check localStorage
        const stored = getLocalStorage(this.storageKey);
        if (stored !== null) {
            return stored === 'dark';
        }

        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return true;
        }

        // Default to dark
        return true;
    }

    /**
     * Initialize theme
     */
    init() {
        this.applyTheme(this.isDark);
        this.setupToggleButton();
        this.watchSystemTheme();
    }

    /**
     * Apply theme
     * @param {boolean} isDark - True for dark mode
     */
    applyTheme(isDark) {
        const body = document.body;
        this.isDark = isDark;

        if (isDark) {
            body.classList.remove(this.lightClass);
            body.classList.add(this.darkClass);
        } else {
            body.classList.remove(this.darkClass);
            body.classList.add(this.lightClass);
        }

        this.updateMetaTheme();
        this.savePreference();
        this.updateToggleIcon();
    }

    /**
     * Toggle theme
     */
    toggle() {
        this.applyTheme(!this.isDark);
        showNotification(this.isDark ? '🌙 Dark mode' : '☀️ Light mode', 'info', 1500);
    }

    /**
     * Setup toggle button listener
     */
    setupToggleButton() {
        const toggleBtn = document.getElementById('themeToggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.toggle();
            });
        }
    }

    /**
     * Update toggle button icon
     */
    updateToggleIcon() {
        const toggleBtn = document.getElementById('themeToggle');
        const icon = toggleBtn?.querySelector('.theme-icon');
        if (icon) {
            icon.textContent = this.isDark ? '🌙' : '☀️';
        }
    }

    /**
     * Update meta theme color
     */
    updateMetaTheme() {
        let metaTheme = document.querySelector('meta[name="theme-color"]');
        if (!metaTheme) {
            metaTheme = document.createElement('meta');
            metaTheme.name = 'theme-color';
            document.head.appendChild(metaTheme);
        }
        metaTheme.content = this.isDark ? '#0f0f23' : '#ffffff';
    }

    /**
     * Save preference to localStorage
     */
    savePreference() {
        setLocalStorage(this.storageKey, this.isDark ? 'dark' : 'light');
    }

    /**
     * Watch for system theme changes
     */
    watchSystemTheme() {
        if (window.matchMedia) {
            const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
            darkModeQuery.addEventListener('change', (e) => {
                // Only apply if user hasn't set a preference
                if (getLocalStorage(this.storageKey) === null) {
                    this.applyTheme(e.matches);
                }
            });
        }
    }

    /**
     * Get current theme
     * @returns {string} 'dark' or 'light'
     */
    getCurrentTheme() {
        return this.isDark ? 'dark' : 'light';
    }

    /**
     * Set theme explicitly
     * @param {string} theme - 'dark' or 'light'
     */
    setTheme(theme) {
        this.applyTheme(theme === 'dark');
    }

    /**
     * Reset to system preference
     */
    resetToSystem() {
        removeLocalStorage(this.storageKey);
        this.isDark = this.getInitialTheme();
        this.applyTheme(this.isDark);
        showNotification('Theme reset to system preference', 'info');
    }

    /**
     * Get CSS variables for current theme
     * @returns {Object}
     */
    getCSSVariables() {
        const root = document.documentElement;
        const style = getComputedStyle(root);
        
        return {
            primaryColor: style.getPropertyValue('--primary-color').trim(),
            secondaryColor: style.getPropertyValue('--secondary-color').trim(),
            accentColor: style.getPropertyValue('--accent-color').trim(),
            bgColor: style.getPropertyValue('--bg').trim(),
            textColor: style.getPropertyValue('--text').trim(),
            textMuted: style.getPropertyValue('--text-muted').trim(),
        };
    }

    /**
     * Apply custom theme colors
     * @param {Object} colors - Custom colors
     */
    applyCustomTheme(colors) {
        const root = document.documentElement;
        
        if (colors.primary) root.style.setProperty('--primary-color', colors.primary);
        if (colors.secondary) root.style.setProperty('--secondary-color', colors.secondary);
        if (colors.accent) root.style.setProperty('--accent-color', colors.accent);
        
        this.savePreference();
    }
}

// Create global instance
const themeManager = new ThemeManager();
