/**
 * QR Library Wrapper - qr-lib.js
 * Handles QR code generation with daily limits
 * Loaded from https://generuoti.sys32.lt/js/qr-lib.js
 */

// Wait for QRCode library to load
function waitForQRCode() {
    return new Promise((resolve) => {
        if (typeof QRCode !== 'undefined') {
            resolve();
        } else {
            const checkInterval = setInterval(() => {
                if (typeof QRCode !== 'undefined') {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        }
    });
}

class QRLibrary {
    constructor() {
        this.qrCode = null;
        this.ready = false;
        this.initPromise = waitForQRCode().then(() => {
            this.ready = true;
        });
    }

    async ensureReady() {
        await this.initPromise;
    }

    async generate(text, options = {}) {
        await this.ensureReady();

        const {
            size = 200,
            errorCorrection = 'M',
            darkColor = '#000000',
            lightColor = '#ffffff'
        } = options;

        // Clear previous QR code
        const container = document.getElementById('qr-canvas-wrapper');
        if (container) {
            container.innerHTML = '';
        }

        // Generate new QR code
        try {
            this.qrCode = new QRCode(container || document.body, {
                text: text,
                width: size,
                height: size,
                colorDark: darkColor,
                colorLight: lightColor,
                correctLevel: this.getCorrectLevel(errorCorrection)
            });

            return true;
        } catch (error) {
            console.error('QR Generation Error:', error);
            return false;
        }
    }

    getCorrectLevel(level) {
        const levels = {
            'L': QRCode.CorrectLevel.L,
            'M': QRCode.CorrectLevel.M,
            'Q': QRCode.CorrectLevel.Q,
            'H': QRCode.CorrectLevel.H
        };
        return levels[level] || QRCode.CorrectLevel.M;
    }

    async exportPNG() {
        await this.ensureReady();

        if (!this.qrCode) return null;

        try {
            const canvas = document.querySelector('#qr-canvas-wrapper canvas');
            if (canvas) {
                return canvas.toDataURL('image/png');
            }
        } catch (error) {
            console.error('PNG Export Error:', error);
        }
        return null;
    }

    async exportSVG() {
        await this.ensureReady();

        if (!this.qrCode) return null;

        try {
            const canvas = document.querySelector('#qr-canvas-wrapper canvas');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                // Simple SVG generation from canvas
                let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}">`;
                svg += `<rect width="100%" height="100%" fill="#ffffff"/>`;

                // Convert image data to SVG rects
                const pixelSize = 1;
                for (let i = 0; i < data.length; i += 4) {
                    if (data[i + 3] > 128) { // alpha > 128
                        const pixelIndex = i / 4;
                        const x = (pixelIndex % canvas.width) * pixelSize;
                        const y = Math.floor(pixelIndex / canvas.width) * pixelSize;
                        svg += `<rect x="${x}" y="${y}" width="${pixelSize}" height="${pixelSize}" fill="#000000"/>`;
                    }
                }
                svg += '</svg>';
                return svg;
            }
        } catch (error) {
            console.error('SVG Export Error:', error);
        }
        return null;
    }

    async download(format = 'png') {
        await this.ensureReady();

        try {
            const canvas = document.querySelector('#qr-canvas-wrapper canvas');
            if (!canvas) return false;

            const link = document.createElement('a');
            const timestamp = new Date().toISOString().slice(0, 10);

            if (format === 'png') {
                link.href = canvas.toDataURL('image/png');
                link.download = `qr-code-${timestamp}.png`;
            } else if (format === 'svg') {
                const svg = await this.exportSVG();
                if (svg) {
                    const blob = new Blob([svg], { type: 'image/svg+xml' });
                    link.href = URL.createObjectURL(blob);
                    link.download = `qr-code-${timestamp}.svg`;
                }
            }

            link.click();
            if (format === 'svg') {
                URL.revokeObjectURL(link.href);
            }
            return true;
        } catch (error) {
            console.error('Download Error:', error);
            return false;
        }
    }

    clear() {
        const container = document.getElementById('qr-canvas-wrapper');
        if (container) {
            container.innerHTML = '';
        }
        this.qrCode = null;
    }
}

// Create global instance
window.qrLib = new QRLibrary();
