/**
 * HISTORY.JS - QR History Management
 * Manages local storage and display of recently created QR codes
 */

class HistoryManager {
    constructor() {
        this.storageKey = 'qr_history';
        this.maxItems = 20;
        this.history = [];
        this.load();
    }

    /**
     * Load history from localStorage
     */
    load() {
        const stored = getLocalStorage(this.storageKey, []);
        this.history = Array.isArray(stored) ? stored : [];
    }

    /**
     * Save history to localStorage
     */
    save() {
        setLocalStorage(this.storageKey, this.history);
    }

    /**
     * Add item to history
     * @param {Object} item - Item to add {data, type, timestamp}
     */
    add(item) {
        try {
            if (!item || !item.data) return;

            const historyItem = {
                id: generateId(),
                data: item.data,
                type: item.type || 'text',
                timestamp: getTimestamp(),
                settings: item.settings || {}
            };

            // Remove if duplicate (same data and type)
            this.history = this.history.filter(h => 
                !(h.data === historyItem.data && h.type === historyItem.type)
            );

            // Add to beginning
            this.history.unshift(historyItem);

            // Limit items
            if (this.history.length > this.maxItems) {
                this.history = this.history.slice(0, this.maxItems);
            }

            this.save();
            this.render();
        } catch (error) {
            console.error('Error adding to history:', error);
        }
    }

    /**
     * Remove item from history
     * @param {string} id - Item ID
     */
    remove(id) {
        this.history = this.history.filter(item => item.id !== id);
        this.save();
        this.render();
    }

    /**
     * Clear all history
     */
    clear() {
        this.history = [];
        this.save();
        this.render();
    }

    /**
     * Get history item by ID
     * @param {string} id - Item ID
     * @returns {Object}
     */
    getById(id) {
        return this.history.find(item => item.id === id);
    }

    /**
     * Get all history
     * @returns {Array}
     */
    getAll() {
        return this.history;
    }

    /**
     * Render history gallery
     */
    render() {
        const gallery = document.getElementById('historyGallery');
        const count = document.getElementById('historyCount');

        if (!gallery) return;

        if (this.history.length === 0) {
            gallery.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📭</div>
                    <p>No QR codes yet. Create one to get started!</p>
                </div>
            `;
            if (count) count.textContent = '0';
            return;
        }

        gallery.innerHTML = '';

        this.history.forEach(item => {
            const historyItem = this.createHistoryItem(item);
            gallery.appendChild(historyItem);
        });

        if (count) count.textContent = this.history.length;
    }

    /**
     * Create history item element
     * @param {Object} item - History item
     * @returns {HTMLElement}
     */
    createHistoryItem(item) {
        const wrapper = document.createElement('div');
        wrapper.className = 'history-item';
        wrapper.title = truncateText(item.data, 100);

        // Generate QR preview
        const qrContainer = document.createElement('div');
        qrContainer.className = 'history-item-qr';
        
        try {
            const canvas = document.createElement('canvas');
            new QRCode({
                el: canvas,
                text: item.data,
                width: 80,
                height: 80,
                colorDark: item.settings.darkColor || '#000000',
                colorLight: item.settings.lightColor || '#ffffff',
                correctLevel: QRCode.CorrectLevel.L
            });
            qrContainer.appendChild(canvas);
        } catch (error) {
            qrContainer.innerHTML = '<div style="color: #999;">QR Preview</div>';
        }

        // Text label
        const textLabel = document.createElement('div');
        textLabel.className = 'history-item-text';
        textLabel.textContent = truncateText(item.data, 20);

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'history-item-delete';
        deleteBtn.innerHTML = '×';
        deleteBtn.title = 'Delete';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.remove(item.id);
        });

        // Click handler to restore
        wrapper.addEventListener('click', () => {
            this.restoreItem(item);
        });

        wrapper.appendChild(deleteBtn);
        wrapper.appendChild(qrContainer);
        wrapper.appendChild(textLabel);

        return wrapper;
    }

    /**
     * Restore history item
     * @param {Object} item - History item
     */
    restoreItem(item) {
        try {
            // Switch type
            uiHandler.switchType(item.type);

            // Restore settings
            if (item.settings) {
                const sizeSlider = document.getElementById('sizeSlider');
                if (sizeSlider && item.settings.size) {
                    sizeSlider.value = item.settings.size;
                    document.getElementById('sizeValue').textContent = item.settings.size;
                }

                // Set error level
                if (item.settings.errorLevel) {
                    document.querySelectorAll('.error-btn').forEach(btn => {
                        btn.classList.remove('active');
                        if (btn.getAttribute('data-level') === item.settings.errorLevel) {
                            btn.classList.add('active');
                        }
                    });
                }

                // Set colors
                if (item.settings.darkColor) {
                    document.getElementById('darkColor').value = item.settings.darkColor;
                }
                if (item.settings.lightColor) {
                    document.getElementById('lightColor').value = item.settings.lightColor;
                }
            }

            // Restore input based on type
            switch (item.type) {
                case 'text':
                    uiHandler.inputFields['textInput'].value = item.data;
                    break;
                case 'url':
                    uiHandler.inputFields['urlInput'].value = item.data;
                    break;
                case 'email':
                    const emailMatch = item.data.match(/^mailto:([^?]+)/);
                    if (emailMatch && uiHandler.inputFields['emailInput']) {
                        uiHandler.inputFields['emailInput'].value = emailMatch[1];
                    }
                    break;
                case 'phone':
                    const phoneMatch = item.data.match(/^tel:(.+)$/);
                    if (phoneMatch && uiHandler.inputFields['phoneInput']) {
                        uiHandler.inputFields['phoneInput'].value = phoneMatch[1];
                    }
                    break;
                case 'wifi':
                    const ssidMatch = item.data.match(/S:([^;]+)/);
                    const passMatch = item.data.match(/P:([^;]+)/);
                    if (ssidMatch && uiHandler.inputFields['wifiSSID']) {
                        uiHandler.inputFields['wifiSSID'].value = ssidMatch[1];
                    }
                    if (passMatch && uiHandler.inputFields['wifiPassword']) {
                        uiHandler.inputFields['wifiPassword'].value = passMatch[1];
                    }
                    break;
            }

            // Generate QR
            uiHandler.generateQRFromInput();

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });

            showNotification(`Restored QR: ${truncateText(item.data, 30)}`, 'success');
        } catch (error) {
            handleError(error, 'Restore history item');
        }
    }

    /**
     * Export history as JSON
     * @returns {string} JSON string
     */
    export() {
        return JSON.stringify(this.history, null, 2);
    }

    /**
     * Import history from JSON
     * @param {string} jsonString - JSON string
     * @returns {boolean}
     */
    import(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            if (Array.isArray(imported)) {
                this.history = imported.slice(0, this.maxItems);
                this.save();
                this.render();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error importing history:', error);
            return false;
        }
    }

    /**
     * Get history statistics
     * @returns {Object}
     */
    getStats() {
        const stats = {
            total: this.history.length,
            byType: {},
            oldest: null,
            newest: null
        };

        this.history.forEach(item => {
            stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
        });

        if (this.history.length > 0) {
            stats.newest = this.history[0];
            stats.oldest = this.history[this.history.length - 1];
        }

        return stats;
    }

    /**
     * Search history
     * @param {string} query - Search query
     * @returns {Array}
     */
    search(query) {
        const lowerQuery = query.toLowerCase();
        return this.history.filter(item => 
            item.data.toLowerCase().includes(lowerQuery) ||
            item.type.toLowerCase().includes(lowerQuery)
        );
    }
}

// Create global instance
const historyManager = new HistoryManager();
