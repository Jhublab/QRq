/**
 * SHARING.JS - Social Sharing & Sharing Features
 * Handles sharing to social media and other platforms
 */

class SharingManager {
    constructor() {
        this.shareUrl = 'https://qr.sys32.lt';
    }

    /**
     * Initialize sharing handlers
     */
    init() {
        this.setupSocialButtons();
    }

    /**
     * Setup social media buttons
     */
    setupSocialButtons() {
        document.getElementById('shareFacebook')?.addEventListener('click', () => {
            this.shareFacebook();
        });

        document.getElementById('shareTwitter')?.addEventListener('click', () => {
            this.shareTwitter();
        });

        document.getElementById('shareWhatsapp')?.addEventListener('click', () => {
            this.shareWhatsapp();
        });

        document.getElementById('shareTelegram')?.addEventListener('click', () => {
            this.shareTelegram();
        });

        document.getElementById('shareNative')?.addEventListener('click', () => {
            this.shareNative();
        });

        document.getElementById('copyLink')?.addEventListener('click', () => {
            this.copyShareLink();
        });
    }

    /**
     * Share to Facebook
     */
    shareFacebook() {
        try {
            const url = this.getShareData();
            const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.shareUrl)}&quote=${encodeURIComponent(url)}`;
            window.open(facebookUrl, 'facebook-share', 'width=600,height=400');
            showNotification('Opening Facebook...', 'success');
        } catch (error) {
            handleError(error, 'Facebook sharing');
        }
    }

    /**
     * Share to Twitter/X
     */
    shareTwitter() {
        try {
            const url = this.getShareData();
            const text = `Check out my QR code! Generated with QR.SYS32.LT - Next-gen QR tools. Fast. Private. Powerful.`;
            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(this.shareUrl)}`;
            window.open(twitterUrl, 'twitter-share', 'width=600,height=400');
            showNotification('Opening Twitter...', 'success');
        } catch (error) {
            handleError(error, 'Twitter sharing');
        }
    }

    /**
     * Share to WhatsApp
     */
    shareWhatsapp() {
        try {
            const text = `Check out my QR code created with QR.SYS32.LT - Next-gen QR tools.`;
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + this.shareUrl)}`;
            window.open(whatsappUrl, 'whatsapp-share', 'width=600,height=400');
            showNotification('Opening WhatsApp...', 'success');
        } catch (error) {
            handleError(error, 'WhatsApp sharing');
        }
    }

    /**
     * Share to Telegram
     */
    shareTelegram() {
        try {
            const text = `Check out my QR code from QR.SYS32.LT!`;
            const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(this.shareUrl)}&text=${encodeURIComponent(text)}`;
            window.open(telegramUrl, 'telegram-share', 'width=600,height=400');
            showNotification('Opening Telegram...', 'success');
        } catch (error) {
            handleError(error, 'Telegram sharing');
        }
    }

    /**
     * Share using native share API
     */
    async shareNative() {
        try {
            if (!supportsFeature('webShare')) {
                showNotification('Native share not supported on this device', 'error');
                return;
            }

            const imageUrl = qrGenerator.getImageURL();
            const shareData = {
                title: 'QR.SYS32.LT - QR Code',
                text: 'Check out the QR code I created with QR.SYS32.LT',
                url: this.shareUrl
            };

            if (navigator.share) {
                await navigator.share(shareData);
                showNotification('Shared successfully', 'success');
            } else {
                showNotification('Share not available', 'error');
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                handleError(error, 'Native share');
            }
        }
    }

    /**
     * Copy share link to clipboard
     */
    async copyShareLink() {
        try {
            const success = await copyToClipboard(this.shareUrl);
            if (success) {
                showNotification('Share link copied to clipboard!', 'success', 2000);
            } else {
                showNotification('Failed to copy link', 'error');
            }
        } catch (error) {
            handleError(error, 'Copy link');
        }
    }

    /**
     * Get share data/URL
     * @returns {string}
     */
    getShareData() {
        const qrData = qrGenerator.currentData || '';
        return `QR Data: ${truncateText(qrData, 50)}`;
    }

    /**
     * Generate share metadata
     * @returns {Object}
     */
    generateShareMetadata() {
        const imageUrl = qrGenerator.getImageURL();
        return {
            title: 'QR.SYS32.LT - QR Code Generator',
            description: 'Fast, private, and powerful QR code generation tool.',
            image: imageUrl,
            url: this.shareUrl
        };
    }

    /**
     * Create share link with QR data encoded
     * @returns {string}
     */
    createShareLink() {
        try {
            const data = btoa(qrGenerator.currentData || '');
            return `${this.shareUrl}?data=${data}`;
        } catch (error) {
            console.error('Error creating share link:', error);
            return this.shareUrl;
        }
    }

    /**
     * Share as image (download and share)
     */
    async shareAsImage() {
        try {
            const blob = await qrGenerator.exportPNG();
            
            if (navigator.share && navigator.canShare) {
                const file = new File([blob], 'qr-code.png', { type: 'image/png' });
                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: 'QR Code',
                        text: 'Check out my QR code!'
                    });
                    showNotification('Image shared', 'success');
                    return;
                }
            }

            downloadBlob(blob, 'qr-code.png');
            showNotification('QR code image saved', 'success');
        } catch (error) {
            handleError(error, 'Image sharing');
        }
    }

    /**
     * Update share URL
     * @param {string} url - New URL
     */
    updateShareUrl(url) {
        this.shareUrl = url;
    }

    /**
     * Get all share options
     * @returns {Array}
     */
    getShareOptions() {
        return [
            { id: 'facebook', name: 'Facebook', icon: 'f' },
            { id: 'twitter', name: 'Twitter/X', icon: '𝕏' },
            { id: 'whatsapp', name: 'WhatsApp', icon: '💬' },
            { id: 'telegram', name: 'Telegram', icon: '✈️' },
            { id: 'native', name: 'Share', icon: '🔗' },
            { id: 'copy', name: 'Copy Link', icon: '📋' }
        ];
    }
}

// Create global instance
const sharingManager = new SharingManager();
