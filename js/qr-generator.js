/**
 * QR-GENERATOR.JS - QR Code Generation Logic
 * Handles all QR code generation operations
 */

class QRGenerator {
    constructor() {
        this.currentQR = null;
        this.currentData = null;
        this.errorLevel = 'L';
        this.size = 200;
        this.darkColor = '#000000';
        this.lightColor = '#ffffff';
    }

    /**
     * Generate QR code
     * @param {string} data - Data to encode in QR
     * @param {Object} options - QR options
     * @returns {Promise<HTMLCanvasElement>}
     */
    async generate(data, options = {}) {
        try {
            if (!data || data.trim() === '') {
                throw new Error('Please enter data for QR code');
            }

            this.currentData = data;
            this.errorLevel = options.errorLevel || this.errorLevel;
            this.size = options.size || this.size;
            this.darkColor = options.darkColor || this.darkColor;
            this.lightColor = options.lightColor || this.lightColor;

            // Clear previous QR
            this.clearQR();

            // Generate new QR
            this.currentQR = new QRCode(document.getElementById('qrDisplay'), {
                text: data,
                width: this.size,
                height: this.size,
                colorDark: this.darkColor,
                colorLight: this.lightColor,
                correctLevel: this.getCorrectLevel(),
                useSVG: false // Use canvas for better compatibility
            });

            return this.getCanvas();
        } catch (error) {
            handleError(error, 'QR generation');
            throw error;
        }
    }

    /**
     * Get QRCode correct level
     * @returns {number} QR Correct level
     */
    getCorrectLevel() {
        const levels = {
            'L': QRCode.CorrectLevel.L,
            'M': QRCode.CorrectLevel.M,
            'Q': QRCode.CorrectLevel.Q,
            'H': QRCode.CorrectLevel.H
        };
        return levels[this.errorLevel] || QRCode.CorrectLevel.L;
    }

    /**
     * Get canvas element of QR code
     * @returns {HTMLCanvasElement}
     */
    getCanvas() {
        const canvas = document.querySelector('#qrDisplay canvas');
        if (!canvas) {
            throw new Error('QR code canvas not found');
        }
        return canvas;
    }

    /**
     * Export QR as PNG
     * @returns {Promise<Blob>}
     */
    async exportPNG() {
        try {
            if (!this.currentQR) {
                throw new Error('No QR code generated yet');
            }

            const canvas = this.getCanvas();
            return new Promise((resolve) => {
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/png');
            });
        } catch (error) {
            handleError(error, 'PNG export');
            throw error;
        }
    }

    /**
     * Export QR as SVG
     * @returns {Promise<Blob>}
     */
    async exportSVG() {
        try {
            if (!this.currentData) {
                throw new Error('No QR code generated yet');
            }

            const svg = await this.generateSVG(this.currentData);
            const blob = new Blob([svg], { type: 'image/svg+xml' });
            return blob;
        } catch (error) {
            handleError(error, 'SVG export');
            throw error;
        }
    }

    /**
     * Generate SVG QR code
     * @param {string} data - Data to encode
     * @returns {Promise<string>} SVG string
     */
    async generateSVG(data) {
        return new Promise((resolve, reject) => {
            try {
                const qr = new QRCode({
                    text: data,
                    width: this.size,
                    height: this.size,
                    colorDark: this.darkColor,
                    colorLight: this.lightColor,
                    correctLevel: this.getCorrectLevel(),
                    useSVG: true
                });

                // Get SVG string
                const container = document.createElement('div');
                const svg = qr._el.firstChild.cloneNode(true);
                svg.setAttribute('width', this.size);
                svg.setAttribute('height', this.size);
                
                const serializer = new XMLSerializer();
                const svgString = serializer.serializeToString(svg);
                resolve(svgString);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Export QR as PDF
     * @returns {Promise<Blob>}
     */
    async exportPDF() {
        try {
            if (!this.currentQR) {
                throw new Error('No QR code generated yet');
            }

            const canvas = this.getCanvas();
            const imageData = canvas.toDataURL('image/png');

            // Create PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            // Add title
            pdf.setFontSize(16);
            pdf.text('QR Code', pageWidth / 2, 20, { align: 'center' });

            // Add QR code
            const qrSize = 80; // mm
            const x = (pageWidth - qrSize) / 2;
            const y = 40;
            pdf.addImage(imageData, 'PNG', x, y, qrSize, qrSize);

            // Add data if not too long
            if (this.currentData.length <= 100) {
                pdf.setFontSize(10);
                pdf.text('Data: ' + this.currentData, pageWidth / 2, y + qrSize + 20, { align: 'center' });
            }

            // Add timestamp
            pdf.setFontSize(8);
            pdf.text('Generated: ' + new Date().toLocaleString(), pageWidth / 2, pageHeight - 10, { align: 'center' });

            return pdf.output('blob');
        } catch (error) {
            handleError(error, 'PDF export');
            throw error;
        }
    }

    /**
     * Download QR code
     * @param {string} format - Format: 'png', 'svg', 'pdf'
     */
    async download(format = 'png') {
        try {
            let blob, filename;

            switch (format) {
                case 'svg':
                    blob = await this.exportSVG();
                    filename = `qr-code-${getTimestamp()}.svg`;
                    break;
                case 'pdf':
                    blob = await this.exportPDF();
                    filename = `qr-code-${getTimestamp()}.pdf`;
                    break;
                case 'png':
                default:
                    blob = await this.exportPNG();
                    filename = `qr-code-${getTimestamp()}.png`;
            }

            downloadBlob(blob, filename);
            showNotification(`QR code downloaded as ${format.toUpperCase()}`, 'success');
        } catch (error) {
            handleError(error, `${format.toUpperCase()} download`);
        }
    }

    /**
     * Print QR code
     */
    print() {
        try {
            if (!this.currentQR) {
                throw new Error('No QR code to print');
            }

            const printWindow = window.open('', '', 'width=800,height=600');
            const canvas = this.getCanvas();
            const imageData = canvas.toDataURL('image/png');

            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Print QR Code</title>
                    <style>
                        body { 
                            display: flex; 
                            align-items: center; 
                            justify-content: center; 
                            min-height: 100vh;
                            margin: 0;
                            background: white;
                            font-family: Arial, sans-serif;
                        }
                        .print-container {
                            text-align: center;
                        }
                        img {
                            max-width: 400px;
                            border: 2px solid #000;
                            padding: 20px;
                        }
                        p {
                            color: #666;
                            font-size: 12px;
                            margin-top: 20px;
                        }
                        @media print {
                            body { background: white; }
                        }
                    </style>
                </head>
                <body>
                    <div class="print-container">
                        <img src="${imageData}" alt="QR Code">
                        <p>Generated: ${new Date().toLocaleString()}</p>
                    </div>
                </body>
                </html>
            `);

            printWindow.document.close();
            setTimeout(() => {
                printWindow.print();
            }, 250);

            showNotification('Print dialog opened', 'info');
        } catch (error) {
            handleError(error, 'Print');
        }
    }

    /**
     * Get QR as image URL
     * @returns {string} Image data URL
     */
    getImageURL() {
        try {
            if (!this.currentQR) {
                return null;
            }
            const canvas = this.getCanvas();
            return canvas.toDataURL('image/png');
        } catch (error) {
            console.error('Error getting image URL:', error);
            return null;
        }
    }

    /**
     * Clear current QR code
     */
    clearQR() {
        const container = document.getElementById('qrDisplay');
        container.innerHTML = '';
        this.currentQR = null;
    }

    /**
     * Generate data for WiFi QR
     * @param {Object} wifiData - {ssid, password, security}
     * @returns {string} WiFi QR string
     */
    generateWiFiQR(wifiData) {
        const { ssid, password, security = 'WPA' } = wifiData;
        // WiFi QR format: WIFI:T:WPA;S:ssid;P:password;;
        const escapedSSID = ssid.replace(/([;:,\\"])/g, '\\$1');
        const escapedPassword = password.replace(/([;:,\\"])/g, '\\$1');
        return `WIFI:T:${security};S:${escapedSSID};P:${escapedPassword};;`;
    }

    /**
     * Generate data for Email QR
     * @param {Object} emailData - {email, subject, body}
     * @returns {string} Email link
     */
    generateEmailQR(emailData) {
        const { email, subject = '', body = '' } = emailData;
        const params = new URLSearchParams();
        if (subject) params.append('subject', subject);
        if (body) params.append('body', body);
        return `mailto:${email}${params.toString() ? '?' + params.toString() : ''}`;
    }

    /**
     * Generate data for Phone QR
     * @param {string} phone - Phone number
     * @returns {string} Phone link
     */
    generatePhoneQR(phone) {
        return `tel:${phone}`;
    }

    /**
     * Generate data for vCard (contact)
     * @param {Object} contactData - Contact information
     * @returns {string} vCard string
     */
    generateVCard(contactData) {
        const { name, phone, email } = contactData;
        let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
        if (name) vcard += `FN:${name}\n`;
        if (phone) vcard += `TEL:${phone}\n`;
        if (email) vcard += `EMAIL:${email}\n`;
        vcard += 'END:VCARD';
        return vcard;
    }

    /**
     * Update QR settings
     * @param {Object} settings - Settings to update
     */
    updateSettings(settings) {
        if (settings.errorLevel) this.errorLevel = settings.errorLevel;
        if (settings.size) this.size = settings.size;
        if (settings.darkColor) this.darkColor = settings.darkColor;
        if (settings.lightColor) this.lightColor = settings.lightColor;
    }

    /**
     * Get current settings
     * @returns {Object} Current settings
     */
    getSettings() {
        return {
            errorLevel: this.errorLevel,
            size: this.size,
            darkColor: this.darkColor,
            lightColor: this.lightColor,
            data: this.currentData
        };
    }
}

// Create global instance
const qrGenerator = new QRGenerator();
