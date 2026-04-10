/**
 * APP.JS - Enhanced QR Generator with Daily Limits
 * Handles language switching, daily QR limit tracking, and generation
 * Loaded from https://generuoti.sys32.lt/js/app.js
 */

class QRApp {
    constructor() {
        this.LIMIT = 100;
        this.currentLang = 'lt';
        this.init();
    }

    init() {
        // Wait for DOM and QRLib to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.boot());
        } else {
            this.boot();
        }
    }

    async boot() {
        // Wait for QR library to be ready
        await this.waitForQRLib();
        
        this.setupLanguageSwitcher();
        this.setupEventListeners();
        this.updateDailyLimit();
        this.setLanguage(this.currentLang);
        this.setupKeyboardShortcuts();
        this.setupDragAndDrop();
        this.trackSession();
        this.checkFirstLoad();
        this.requestPermissions();
    }

    waitForQRLib() {
        return new Promise((resolve) => {
            const check = () => {
                if (window.qrLib && window.qrLib.ready) {
                    resolve();
                } else {
                    setTimeout(check, 100);
                }
            };
            check();
        });
    }

    // ===== Daily Limit Management =====

    getTodayKey() {
        const today = new Date().toISOString().split('T')[0];
        return 'qr_count_' + today;
    }

    getCount() {
        return parseInt(localStorage.getItem(this.getTodayKey())) || 0;
    }

    incrementCount() {
        const count = this.getCount() + 1;
        localStorage.setItem(this.getTodayKey(), count);
        this.updateDailyLimit();
        return count;
    }

    updateDailyLimit() {
        const count = this.getCount();
        const countValue = document.getElementById('count-value');
        const progressFill = document.getElementById('progress-fill');

        if (countValue) countValue.textContent = count;
        
        if (progressFill) {
            const percentage = (count / this.LIMIT) * 100;
            progressFill.style.width = Math.min(percentage, 100) + '%';
        }

        // Show warning if near limit
        if (count >= this.LIMIT * 0.8) {
            this.showNotification(this.getText('nearLimit'), 'warning');
        }
    }

    canGenerateQR() {
        return this.getCount() < this.LIMIT;
    }

    // ===== Language Management =====

    setupLanguageSwitcher() {
        const ltBtn = document.getElementById('lang-lt');
        const enBtn = document.getElementById('lang-en');

        if (ltBtn) ltBtn.addEventListener('click', () => this.setLanguage('lt'));
        if (enBtn) enBtn.addEventListener('click', () => this.setLanguage('en'));

        // Load saved language preference
        const savedLang = localStorage.getItem('qr_language') || 'lt';
        this.setLanguage(savedLang);
    }

    setLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('qr_language', lang);

        // Update button states
        document.getElementById('lang-lt')?.classList.toggle('active', lang === 'lt');
        document.getElementById('lang-en')?.classList.toggle('active', lang === 'en');

        // Update all elements with data-text-lt or data-text-en
        this.updatePageText(lang);

        // Update page title and description
        this.updatePageMeta(lang);
    }

    updatePageText(lang) {
        const attribute = `data-text-${lang}`;

        document.querySelectorAll(`[${attribute}]`).forEach(el => {
            const text = el.getAttribute(attribute);
            if (text) {
                if (el.tagName === 'INPUT') {
                    el.placeholder = text;
                } else if (el.querySelectorAll('*').length === 0) {
                    el.textContent = text;
                }
            }
        });

        // Handle input placeholders
        document.querySelectorAll('input[data-placeholder-' + lang + ']').forEach(input => {
            input.placeholder = input.getAttribute(`data-placeholder-${lang}`);
        });
    }

    updatePageMeta(lang) {
        const metaData = {
            lt: {
                title: 'QR kodų generatorius nemokamai | Greitas QR Code Generator',
                description: 'Nemokamas online QR kodų generatorius. Sukurk QR kodą tekstui, URL, el. paštui per kelias sekundes.'
            },
            en: {
                title: 'Free QR Code Generator | Fast & Easy QR Codes',
                description: 'Free online QR code generator. Create QR codes for text, URLs, emails in seconds.'
            }
        };

        const data = metaData[lang] || metaData.lt;
        document.title = data.title;

        const descMeta = document.querySelector('meta[name="description"]');
        if (descMeta) descMeta.setAttribute('content', data.description);

        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', data.title);

        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', data.description);

        document.documentElement.lang = lang;
    }

    getText(key) {
        const messages = {
            lt: {
                success: 'QR kodas sukurtas sėkmingai!',
                error: 'Klaida generuojant QR kodą',
                limitReached: 'Pasiektas dienos limitas (100 QR)',
                nearLimit: 'Artėjate prie dienos limito',
                copied: 'Nuoroda nukopijuota',
                downloaded: 'QR kodas atsisiųstas'
            },
            en: {
                success: 'QR code created successfully!',
                error: 'Error generating QR code',
                limitReached: 'Daily limit reached (100 QR)',
                nearLimit: 'Approaching daily limit',
                copied: 'Link copied',
                downloaded: 'QR code downloaded'
            }
        };

        return messages[this.currentLang]?.[key] || '';
    }

    // ===== QR Generation Methods =====

    async generateQR() {
        const input = document.getElementById('qr-input');
        const errorMsg = document.getElementById('error-message');

        if (!input || !input.value.trim()) {
            this.showError('Please enter text', errorMsg);
            return;
        }

        if (!this.canGenerateQR()) {
            this.showError(this.getText('limitReached'), errorMsg);
            return;
        }

        try {
            await window.qrLib.ensureReady();

            const text = input.value.trim();
            const size = 200;
            const errorLevel = 'M';
            const darkColor = '#000000';
            const lightColor = '#ffffff';

            const success = await window.qrLib.generate(text, {
                size,
                errorCorrection: errorLevel,
                darkColor,
                lightColor
            });

            if (success) {
                this.incrementCount();
                this.showNotification(this.getText('success'), 'success');
                this.enableDownloadButtons();
                this.hideError(errorMsg);
            } else {
                this.showError(this.getText('error'), errorMsg);
            }
        } catch (error) {
            console.error('Generation error:', error);
            this.showError(this.getText('error'), errorMsg);
        }
    }

    downloadQR() {
        if (!window.qrLib || !window.qrLib.qrCode) return;

        window.qrLib.download('png');
        this.showNotification(this.getText('downloaded'), 'success');
    }

    copyQRLink() {
        const text = document.getElementById('qr-input')?.value;
        if (!text) return;

        navigator.clipboard.writeText(text).then(() => {
            this.showNotification(this.getText('copied'), 'success');
        }).catch(err => {
            console.error('Copy failed:', err);
        });
    }

    // ===== Event Setup =====

    setupEventListeners() {
        // Type buttons
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', () => this.handleTypeChange(btn));
        });

        // Error correction buttons
        document.querySelectorAll('.error-btn').forEach(btn => {
            btn.addEventListener('click', () => this.handleErrorCorrectionChange(btn));
        });

        // Size presets
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => this.handleSizeChange(btn));
        });

        // Input field
        const input = document.getElementById('qr-input');
        if (input) {
            input.addEventListener('input', (e) => this.updateCharCount(e.target));
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.generateQR();
            });
        }

        // FAQ toggle
        document.querySelectorAll('.faq-question').forEach(q => {
            q.addEventListener('click', () => {
                q.parentElement.classList.toggle('active');
            });
        });
    }

    handleTypeChange(btn) {
        document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    handleErrorCorrectionChange(btn) {
        document.querySelectorAll('.error-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    handleSizeChange(btn) {
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.updateSizeDisplay(btn.dataset.size);
    }

    updateSizeDisplay(size) {
        const sizeValue = document.getElementById('sizeValue');
        if (sizeValue) sizeValue.textContent = size;
    }

    updateCharCount(input) {
        const count = input.value.length;
        const charCount = document.getElementById('char-count');
        if (charCount) charCount.textContent = `${count} / 4296`;
    }

    enableDownloadButtons() {
        document.getElementById('download-btn')?.removeAttribute('disabled');
        document.getElementById('copy-btn')?.removeAttribute('disabled');
    }

    // ===== Helper Methods =====

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                this.downloadQR();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('qr-input')?.focus();
            }
        });
    }

    setupDragAndDrop() {
        const container = document.querySelector('.qr-display-container');
        if (!container) return;

        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            container.style.borderColor = 'var(--primary-color)';
        });

        container.addEventListener('dragleave', () => {
            container.style.borderColor = '';
        });

        container.addEventListener('drop', (e) => {
            e.preventDefault();
            container.style.borderColor = '';
        });
    }

    trackSession() {
        const sessionKey = 'app_session_' + new Date().toISOString().split('T')[0];
        let sessionData = JSON.parse(localStorage.getItem(sessionKey) || '{"visits":0,"qrGenerated":0}');
        sessionData.visits++;
        localStorage.setItem(sessionKey, JSON.stringify(sessionData));
    }

    checkFirstLoad() {
        const firstLoadKey = 'app_first_load';
        const isFirstLoad = !localStorage.getItem(firstLoadKey);

        if (isFirstLoad) {
            localStorage.setItem(firstLoadKey, 'true');
            setTimeout(() => {
                this.showNotification('Welcome to QR.SYS32.LT! 🎉', 'success');
            }, 500);
        }
    }

    requestPermissions() {
        try {
            if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission();
            }
        } catch (error) {
            console.warn('Permission request failed:', error);
        }
    }

    // ===== UI Notifications =====

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            padding: 16px 24px;
            background: ${type === 'success' ? '#00ff88' : type === 'error' ? '#ff4444' : type === 'warning' ? '#ffaa00' : '#00d4ff'};
            color: #0f172a;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            z-index: 10000;
            animation: slideInLeft 0.3s ease-out;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    showError(message, container) {
        if (!container) return;
        container.textContent = message;
        container.style.display = 'block';
    }

    hideError(container) {
        if (!container) return;
        container.style.display = 'none';
    }
}

// Create and initialize app
document.addEventListener('DOMContentLoaded', () => {
    window.app = new QRApp();
});

// Add animation styles
if (!document.getElementById('app-animations')) {
    const style = document.createElement('style');
    style.id = 'app-animations';
    style.textContent = `
        @keyframes slideInLeft {
            from {
                transform: translateX(-100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
}

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

// Handle promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});
