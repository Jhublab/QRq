/**
 * UI-HANDLER.JS - User Interface Management
 * Handles all UI interactions and updates
 */

class UIHandler {
    constructor() {
        this.currentType = 'text';
        this.inputFields = {};
    }

    /**
     * Initialize UI handlers
     */
    init() {
        this.setupTypeTabListeners();
        this.setupControlPanelListeners();
        this.setupActionButtonListeners();
        this.setupInputFieldListeners();
        this.renderInputFields();
    }

    /**
     * Setup input type tab listeners
     */
    setupTypeTabListeners() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const type = btn.getAttribute('data-type');
                this.switchType(type);
            });
        });
    }

    /**
     * Switch QR input type
     * @param {string} type - Type of QR: 'text', 'url', 'email', 'phone', 'wifi'
     */
    switchType(type) {
        this.currentType = type;

        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-type') === type) {
                btn.classList.add('active');
            }
        });

        // Render new input fields
        this.renderInputFields();
    }

    /**
     * Render input fields based on type
     */
    renderInputFields() {
        const container = document.getElementById('inputFields');
        container.innerHTML = '';
        this.inputFields = {};

        const fields = {
            text: [
                { id: 'textInput', label: 'Enter Text', type: 'textarea', placeholder: 'Type any text here...' }
            ],
            url: [
                { id: 'urlInput', label: 'Enter URL', type: 'url', placeholder: 'https://example.com' }
            ],
            email: [
                { id: 'emailInput', label: 'Email Address', type: 'email', placeholder: 'name@example.com' },
                { id: 'emailSubject', label: 'Subject (Optional)', type: 'text', placeholder: 'Email subject...' },
                { id: 'emailBody', label: 'Message (Optional)', type: 'textarea', placeholder: 'Email body...' }
            ],
            phone: [
                { id: 'phoneInput', label: 'Phone Number', type: 'tel', placeholder: '+1 (555) 123-4567' }
            ],
            wifi: [
                { id: 'wifiSSID', label: 'Network Name (SSID)', type: 'text', placeholder: 'Your WiFi name...' },
                { id: 'wifiPassword', label: 'Password', type: 'text', placeholder: 'Your WiFi password...' },
                { id: 'wifiSecurity', label: 'Security Type', type: 'select', options: ['WPA', 'WEP', 'nopass'] }
            ]
        };

        const fieldDefinitions = fields[this.currentType] || [];

        fieldDefinitions.forEach(field => {
            if (field.type === 'textarea') {
                const textarea = document.createElement('textarea');
                textarea.id = field.id;
                textarea.placeholder = field.placeholder;
                textarea.rows = 4;

                const label = document.createElement('label');
                label.setAttribute('for', field.id);
                label.textContent = field.label;
                label.style.display = 'block';
                label.style.marginBottom = 'var(--spacing-sm)';

                container.appendChild(label);
                container.appendChild(textarea);

                this.inputFields[field.id] = textarea;
            } else if (field.type === 'select') {
                const select = document.createElement('select');
                select.id = field.id;

                const label = document.createElement('label');
                label.setAttribute('for', field.id);
                label.textContent = field.label;
                label.style.display = 'block';
                label.style.marginBottom = 'var(--spacing-sm)';

                field.options?.forEach(option => {
                    const opt = document.createElement('option');
                    opt.value = option;
                    opt.textContent = option;
                    select.appendChild(opt);
                });

                container.appendChild(label);
                container.appendChild(select);

                this.inputFields[field.id] = select;
            } else {
                const input = document.createElement('input');
                input.id = field.id;
                input.type = field.type;
                input.placeholder = field.placeholder;

                const label = document.createElement('label');
                label.setAttribute('for', field.id);
                label.textContent = field.label;
                label.style.display = 'block';
                label.style.marginBottom = 'var(--spacing-sm)';

                container.appendChild(label);
                container.appendChild(input);

                this.inputFields[field.id] = input;
            }
        });

        this.setupInputFieldListeners();
    }

    /**
     * Setup input field listeners for real-time QR generation
     */
    setupInputFieldListeners() {
        Object.values(this.inputFields).forEach(field => {
            field.addEventListener('input', debounce(() => {
                this.generateQRFromInput();
            }, 300));

            field.addEventListener('change', () => {
                this.generateQRFromInput();
            });
        });
    }

    /**
     * Generate QR from current input
     */
    async generateQRFromInput() {
        try {
            let data = '';

            switch (this.currentType) {
                case 'text':
                    data = this.inputFields['textInput']?.value || '';
                    break;
                case 'url':
                    data = this.inputFields['urlInput']?.value || '';
                    break;
                case 'email':
                    data = qrGenerator.generateEmailQR({
                        email: this.inputFields['emailInput']?.value || '',
                        subject: this.inputFields['emailSubject']?.value || '',
                        body: this.inputFields['emailBody']?.value || ''
                    });
                    break;
                case 'phone':
                    data = qrGenerator.generatePhoneQR(this.inputFields['phoneInput']?.value || '');
                    break;
                case 'wifi':
                    data = qrGenerator.generateWiFiQR({
                        ssid: this.inputFields['wifiSSID']?.value || '',
                        password: this.inputFields['wifiPassword']?.value || '',
                        security: this.inputFields['wifiSecurity']?.value || 'WPA'
                    });
                    break;
            }

            if (data && data.trim() !== '') {
                const options = {
                    errorLevel: document.querySelector('.error-btn.active')?.getAttribute('data-level') || 'L',
                    size: parseInt(document.getElementById('sizeSlider')?.value || 200),
                    darkColor: document.getElementById('darkColor')?.value || '#000000',
                    lightColor: document.getElementById('lightColor')?.value || '#ffffff'
                };

                await qrGenerator.generate(data, options);
                this.updateActionButtons(true);
            } else {
                qrGenerator.clearQR();
                this.updateActionButtons(false);
            }
        } catch (error) {
            console.error('Error generating QR:', error);
        }
    }

    /**
     * Setup control panel listeners
     */
    setupControlPanelListeners() {
        // Size slider
        const sizeSlider = document.getElementById('sizeSlider');
        const sizeValue = document.getElementById('sizeValue');

        sizeSlider?.addEventListener('input', (e) => {
            const size = e.target.value;
            sizeValue.textContent = size;
            debounce(() => this.generateQRFromInput(), 100)();
        });

        // Size presets
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const size = btn.getAttribute('data-size');
                sizeSlider.value = size;
                sizeValue.textContent = size;

                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                this.generateQRFromInput();
            });
        });

        // Error correction buttons
        document.querySelectorAll('.error-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.error-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.generateQRFromInput();
            });
        });

        // Color pickers
        const darkColorPicker = document.getElementById('darkColor');
        const lightColorPicker = document.getElementById('lightColor');

        darkColorPicker?.addEventListener('change', debounce(() => {
            this.generateQRFromInput();
        }, 300));

        lightColorPicker?.addEventListener('change', debounce(() => {
            this.generateQRFromInput();
        }, 300));
    }

    /**
     * Setup action button listeners
     */
    setupActionButtonListeners() {
        document.getElementById('downloadPng')?.addEventListener('click', () => {
            qrGenerator.download('png');
        });

        document.getElementById('downloadSvg')?.addEventListener('click', () => {
            qrGenerator.download('svg');
        });

        document.getElementById('downloadPdf')?.addEventListener('click', () => {
            qrGenerator.download('pdf');
        });

        document.getElementById('printQr')?.addEventListener('click', () => {
            qrGenerator.print();
        });

        document.getElementById('clearHistory')?.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all QR history?')) {
                historyManager.clear();
                showNotification('History cleared', 'success');
            }
        });

        document.getElementById('emailQr')?.addEventListener('click', () => {
            this.openEmailDialog();
        });
    }

    /**
     * Update action button states
     * @param {boolean} hasQR - Whether QR code exists
     */
    updateActionButtons(hasQR) {
        const buttons = [
            'downloadPng', 'downloadSvg', 'downloadPdf', 'printQr',
            'shareFacebook', 'shareTwitter', 'shareWhatsapp', 'shareTelegram',
            'shareNative', 'copyLink', 'emailQr'
        ];

        buttons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.disabled = !hasQR;
            }
        });
    }

    /**
     * Open email dialog
     */
    openEmailDialog() {
        try {
            const qrImage = qrGenerator.getImageURL();
            if (!qrImage) {
                showNotification('QR code not available', 'error');
                return;
            }

            const email = prompt('Enter email address:', '');
            if (!email) return;

            if (!isValidEmail(email)) {
                showNotification('Invalid email address', 'error');
                return;
            }

            const subject = 'Check out my QR Code';
            const body = 'I created this QR code. Scan it to see what it contains!';
            const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

            window.open(mailtoLink);
            showNotification('Email client opened', 'success');
        } catch (error) {
            handleError(error, 'Email dialog');
        }
    }

    /**
     * Show loading state
     */
    showLoading() {
        const display = document.getElementById('qrDisplay');
        display.classList.add('generating');
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        const display = document.getElementById('qrDisplay');
        display.classList.remove('generating');
    }

    /**
     * Focus input field
     * @param {string} fieldId - Field ID
     */
    focusField(fieldId) {
        const field = this.inputFields[fieldId];
        if (field) {
            field.focus();
            field.select?.();
        }
    }

    /**
     * Get input values
     * @returns {Object}
     */
    getInputValues() {
        const values = {};
        Object.entries(this.inputFields).forEach(([key, field]) => {
            values[key] = field.value;
        });
        return values;
    }

    /**
     * Set input values
     * @param {Object} values - Values to set
     */
    setInputValues(values) {
        Object.entries(values).forEach(([key, value]) => {
            if (this.inputFields[key]) {
                this.inputFields[key].value = value;
            }
        });
    }
}

// Create global instance
const uiHandler = new UIHandler();
