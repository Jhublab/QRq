/**
 * UTILS.JS - Utility Functions & Helpers
 * General purpose utilities for the application
 */

/**
 * Show notification to user
 * @param {string} message - The message to display
 * @param {string} type - Type: 'success', 'error', 'info'
 * @param {number} duration - Duration in ms (default: 3000)
 */
function showNotification(message, type = 'info', duration = 3000) {
    const container = document.getElementById('notificationContainer');
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ'
    };
    
    notification.innerHTML = `
        <span class="notification-icon">${icons[type] || '•'}</span>
        <span class="notification-message">${message}</span>
    `;
    
    container.appendChild(notification);
    
    if (duration > 0) {
        setTimeout(() => {
            notification.classList.add('removing');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
    
    return notification;
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>}
 */
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textArea);
            return success;
        }
    } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        return false;
    }
}

/**
 * Download file from blob
 * @param {Blob} blob - File blob
 * @param {string} filename - Filename for download
 */
function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Encode text to data URL (for QR generation)
 * @param {string} text - Text to encode
 * @returns {string} Encoded URL-safe string
 */
function encodeQRText(text) {
    return encodeURIComponent(text);
}

/**
 * Generate unique ID
 * @returns {string} Unique id
 */
function generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

/**
 * Truncate text to length
 * @param {string} text - Text to truncate
 * @param {number} length - Max length
 * @returns {string} Truncated text
 */
function truncateText(text, length = 50) {
    return text.length > length ? text.substring(0, length) + '...' : text;
}

/**
 * Check if URL is valid
 * @param {string} url - URL to validate
 * @returns {boolean}
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (err) {
        return false;
    }
}

/**
 * Check if email is valid
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Check if phone number is valid
 * @param {string} phone - Phone to validate
 * @returns {boolean}
 */
function isValidPhone(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]{7,}$/;
    return phoneRegex.test(phone);
}

/**
 * Format date to readable string
 * @param {Date} date - Date to format
 * @returns {string}
 */
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

/**
 * Get current timestamp
 * @returns {number}
 */
function getTimestamp() {
    return Date.now();
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit time in ms
 * @returns {Function} Throttled function
 */
function throttle(func, limit = 300) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Get localStorage item
 * @param {string} key - Key
 * @param {any} defaultValue - Default value if not found
 * @returns {any}
 */
function getLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (err) {
        console.error('Error reading from localStorage:', err);
        return defaultValue;
    }
}

/**
 * Set localStorage item
 * @param {string} key - Key
 * @param {any} value - Value to store
 * @returns {boolean} Success
 */
function setLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (err) {
        console.error('Error writing to localStorage:', err);
        return false;
    }
}

/**
 * Remove localStorage item
 * @param {string} key - Key
 */
function removeLocalStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (err) {
        console.error('Error removing from localStorage:', err);
    }
}

/**
 * Clear all localStorage
 */
function clearLocalStorage() {
    try {
        localStorage.clear();
    } catch (err) {
        console.error('Error clearing localStorage:', err);
    }
}

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if device supports feature
 * @param {string} feature - Feature name
 * @returns {boolean}
 */
function supportsFeature(feature) {
    const features = {
        serviceWorker: 'serviceWorker' in navigator,
        webShare: 'share' in navigator,
        notifications: 'Notification' in window,
        offline: 'onLine' in navigator,
        webWorker: typeof Worker !== 'undefined'
    };
    return features[feature] || false;
}

/**
 * Get device info
 * @returns {Object}
 */
function getDeviceInfo() {
    return {
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        isAndroid: /Android/i.test(navigator.userAgent),
        isIOS: /iPad|iPhone|iPod/i.test(navigator.userAgent),
        isWindows: /Windows/i.test(navigator.userAgent),
        isMac: /Macintosh/i.test(navigator.userAgent),
        isLinux: /Linux/i.test(navigator.userAgent),
        isTouchDevice: () => {
            return (('ontouchstart' in window) ||
                    (navigator.maxTouchPoints > 0) ||
                    (navigator.msMaxTouchPoints > 0));
        }
    };
}

/**
 * Handle errors gracefully
 * @param {Error} error - Error object
 * @param {string} context - Error context
 */
function handleError(error, context = '') {
    console.error(`Error in ${context}:`, error);
    showNotification(`Something went wrong${context ? ' (' + context + ')' : ''}. Please try again.`, 'error');
}

/**
 * Validate input data
 * @param {Object} data - Data to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation result {valid: boolean, errors: Object}
 */
function validateInput(data, rules) {
    const errors = {};
    let valid = true;

    for (const [field, rule] of Object.entries(rules)) {
        const value = data[field];

        if (rule.required && !value) {
            errors[field] = `${field} is required`;
            valid = false;
            continue;
        }

        if (rule.type === 'email' && value && !isValidEmail(value)) {
            errors[field] = 'Invalid email format';
            valid = false;
        }

        if (rule.type === 'url' && value && !isValidUrl(value)) {
            errors[field] = 'Invalid URL format';
            valid = false;
        }

        if (rule.minLength && value && value.length < rule.minLength) {
            errors[field] = `Minimum ${rule.minLength} characters`;
            valid = false;
        }

        if (rule.maxLength && value && value.length > rule.maxLength) {
            errors[field] = `Maximum ${rule.maxLength} characters`;
            valid = false;
        }
    }

    return { valid, errors };
}

/**
 * Performance mark for debugging
 * @param {string} label - Mark label
 */
function perfMark(label) {
    if (window.performance && window.performance.mark) {
        window.performance.mark(label);
    }
}

/**
 * Calculate performance measure
 * @param {string} label - Measure label
 * @param {string} startMark - Start mark
 * @param {string} endMark - End mark
 */
function perfMeasure(label, startMark, endMark) {
    if (window.performance && window.performance.measure) {
        try {
            window.performance.measure(label, startMark, endMark);
            const measure = window.performance.getEntriesByName(label)[0];
            console.log(`${label}: ${measure.duration.toFixed(2)}ms`);
        } catch (err) {
            console.warn('Performance measure failed:', err);
        }
    }
}
