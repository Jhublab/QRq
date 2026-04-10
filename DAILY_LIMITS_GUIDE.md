# Daily Limits Technical Guide
## QR Code Generation Limit System

---

## Overview

The QR.SYS32.LT enhanced version includes a **100 QR codes per day** limit for each user. This limit is:
- **Per-user** (tracked via browser localStorage)
- **Per-day** (resets at UTC midnight automatically)
- **Client-side only** (no backend needed)
- **Privacy-respecting** (only stored locally in browser)

---

## How It Works

### Storage Key Format
```javascript
// Today's key: "qr_count_YYYY-MM-DD"
// Examples:
"qr_count_2024-12-18"
"qr_count_2024-12-19"
```

### Daily Counter Reset
The key format automatically changes each day:
- **Tuesday:** `localStorage['qr_count_2024-12-17']` = 45 QRs used
- **Wednesday:** `localStorage['qr_count_2024-12-18']` = 0 (new day, fresh start)
- **Thursday:** `localStorage['qr_count_2024-12-19']` = 0 (another new day)

### Lifecycle

```
User Actions:
1. User visits qr.sys32.lt (today)
2. Page loads → getTodayKey() returns "qr_count_2024-12-18"
3. Gets today's count from localStorage (0 initially)
4. Displays: "Naudota šiandien: 0 / 100"

5. User generates QR code #1
   → incrementCount() called
   → count becomes 1
   → localStorage['qr_count_2024-12-18'] = 1
   → Display updates: "Naudota šiandien: 1 / 100"

6. User generates QRs #2-100 (same process)

7. User tries to generate QR #101
   → canGenerateQR() returns false
   → Error message: "Pasiektas dienos limitas (100 QR)"
   → Generation blocked

8. Next day (UTC midnight passes)
   → User visits site again
   → getTodayKey() returns "qr_count_2024-12-19" (new date!)
   → localStorage['qr_count_2024-12-19'] doesn't exist yet
   → getCount() returns 0 (default)
   → User can generate QRs again
   → Counter starts at 0 for new day
```

---

## Implementation Details

### Files Involved

#### 1. `js/app.js` - Main Limit Management
```javascript
class QRApp {
    constructor() {
        this.LIMIT = 100; // Daily limit
    }

    // Generate storage key based on today's date
    getTodayKey() {
        const today = new Date().toISOString().split('T')[0]; // "2024-12-18"
        return 'qr_count_' + today;
    }

    // Get current day's count
    getCount() {
        return parseInt(localStorage.getItem(this.getTodayKey())) || 0;
    }

    // Increment when QR is generated
    incrementCount() {
        const count = this.getCount() + 1;
        localStorage.setItem(this.getTodayKey(), count);
        this.updateDailyLimit(); // Update UI
        return count;
    }

    // Check if more QRs can be generated
    canGenerateQR() {
        return this.getCount() < this.LIMIT; // true if < 100
    }

    // Update UI with current usage
    updateDailyLimit() {
        const count = this.getCount();
        document.getElementById('count-value').textContent = count;
        
        // Update progress bar
        const percentage = (count / this.LIMIT) * 100;
        document.getElementById('progress-fill').style.width = percentage + '%';
        
        // Show warning at 80%
        if (count >= this.LIMIT * 0.8) {
            this.showNotification('Artėjate prie dienos limito'); // Approaching limit
        }
    }
}
```

#### 2. `js/qr-lib.js` - QR Library Integration
```javascript
class QRLibrary {
    async generate(text, options = {}) {
        // QR generation happens here
        // Calling function is responsible for checking limit and incrementing
    }
}
```

### Flow Diagram

```
User Clicks "Generate" Button
    ↓
app.generateQR() called
    ↓
Check canGenerateQR()
    ├─ If false: Show error "Daily limit reached" → STOP
    └─ If true: Continue
    ↓
window.qrLib.generate(text, options)
    ↓
QR code displays on screen
    ↓
app.incrementCount()
    │
    ├─ getCount() → get current (e.g., 5)
    ├─ count++ → 6
    ├─ localStorage.setItem('qr_count_2024-12-18', 6)
    └─ updateDailyLimit() → Update UI to "6 / 100"
    ↓
Progress bar fills (6%)
    ↓
User sees success notification
```

---

## Configuration

### Change Daily Limit

**Option 1: Edit `js/app.js`**
```javascript
// Line ~12
this.LIMIT = 100; // Change to desired number
```

**Option 2: Environment-based**
```javascript
const LIMITS = {
    free: 100,
    pro: 500,
    unlimited: 999999
};
this.LIMIT = LIMITS[userTier]; // 'free' by default
```

---

## User Experience

### UI Elements

1. **Progress Bar** (top of generator card)
   ```
   ┌─────────────────────────────────────┐
   │ Naudota šiandien: 25 / 100          │
   │ [██████░░░░░░░░░░░░░░░░░░] 25%      │
   └─────────────────────────────────────┘
   ```

2. **Limit Reached Message**
   ```
   ┌────────────────────────────────────┐
   │ ❌ Pasiektas dienos limitas (100 QR) │
   └────────────────────────────────────┘
   ```

3. **Warning Notification** (at 80% = 80 QRs)
   ```
   ┌────────────────────────────────────┐
   │ ⚠️  Artėjate prie dienos limito     │
   └────────────────────────────────────┘
   ```

### Usage Thresholds

| QR Count | % Used | Status | UI Indication |
|----------|--------|--------|----------------|
| 0-50 | 0-50% | Green zone | Normal |
| 51-80 | 51-80% | Yellow zone | Warning shown |
| 81-99 | 81-99% | Red zone | "Approaching limit" |
| 100+ | 100%+ | Over limit | Blocked |

---

## Testing

### Manual Testing Workflow

**Test 1: Basic Counter**
```
Steps:
1. Open Developer Tools (F12)
2. Go to Application → LocalStorage
3. Generate 1 QR code
4. Check: 'qr_count_2024-12-18' = 1
5. Generate 4 more QRs
6. Check: 'qr_count_2024-12-18' = 5
✓ Counter increments correctly
```

**Test 2: Daily Reset**
```
Steps:
1. In Console, set past date:
   localStorage.setItem('qr_count_2024-12-17', 100);
2. Check UI: Shows "100 / 100"
3. Simulate date change:
   // Modify getTodayKey() to return '2024-12-18'
4. Refresh page
5. Check UI: Shows "0 / 100"
✓ Daily reset works
```

**Test 3: Limit Enforcement**
```
Steps:
1. In Console, set count to 99:
   localStorage.setItem('qr_count_' + new Date().toISOString().split('T')[0], 99);
2. Refresh page → Shows "99 / 100"
3. Generate 1 QR → Shows "100 / 100"
4. Try to generate another → Error message appears
✓ Limit enforcement works
```

**Test 4: Warning Threshold**
```
Steps:
1. Set count to 79:
   localStorage.setItem('qr_count_2024-12-18', 79);
2. Refresh → No warning yet
3. Generate 1 QR → Shows "80 / 100" + warning notification
✓ Warning triggers at 80%
```

### Automated Testing (JavaScript)
```javascript
// Test helper
async function testDailyLimit() {
    const app = window.app;
    
    // Clear today's count
    localStorage.removeItem(app.getTodayKey());
    
    // Test 1: Initial count = 0
    console.assert(app.getCount() === 0, 'Initial count should be 0');
    
    // Test 2: Can generate
    console.assert(app.canGenerateQR() === true, 'Should allow generation');
    
    // Test 3: Increment
    app.incrementCount();
    console.assert(app.getCount() === 1, 'Count should increment to 1');
    
    // Test 4: Multiple increments
    for (let i = 1; i < 100; i++) {
        app.incrementCount();
    }
    console.assert(app.getCount() === 100, 'Count should reach 100');
    
    // Test 5: Cannot exceed limit
    console.assert(app.canGenerateQR() === false, 'Should block at limit');
    
    console.log('✓ All tests passed');
}

// Run: testDailyLimit()
```

---

## Monitoring

### Check Current Usage
```javascript
// In browser console
window.app.getCount() // Returns number of QRs today
window.app.LIMIT // Returns 100
window.app.getTodayKey() // Returns storage key
```

### View All Limits (Last 7 Days)
```javascript
// In browser console
const today = new Date();
for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const key = 'qr_count_' + date.toISOString().split('T')[0];
    const count = parseInt(localStorage.getItem(key)) || 0;
    console.log(`${key}: ${count}/100`);
}
```

### Export Usage Statistics
```javascript
function exportLimitStats() {
    const stats = {};
    for (let key in localStorage) {
        if (key.startsWith('qr_count_')) {
            const date = key.replace('qr_count_', '');
            const count = localStorage.getItem(key);
            stats[date] = {
                used: count,
                limit: 100,
                percentage: Math.round((count/100)*100) + '%'
            };
        }
    }
    console.table(stats);
    return stats;
}

// Run: exportLimitStats()
```

---

## Advanced Features

### Per-User Limits (Future Enhancement)

If you want different limits per user:

```javascript
class QRApp {
    constructor(userTier = 'free') {
        const TIERS = {
            free: { limit: 100, storageKey: 'qr_free' },
            pro: { limit: 500, storageKey: 'qr_pro' },
            business: { limit: 9999, storageKey: 'qr_business' }
        };
        
        this.tier = TIERS[userTier];
        this.LIMIT = this.tier.limit;
    }

    getTodayKey() {
        const today = new Date().toISOString().split('T')[0];
        return this.tier.storageKey + '_' + today;
    }
}

// Usage:
// const app = new QRApp('pro'); // Gets 500 limit
```

### Time-Based Warnings

```javascript
function getTimeUntilReset() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntil = tomorrow - now;
    const hours = Math.floor(timeUntil / 3600000);
    const minutes = Math.floor((timeUntil % 3600000) / 60000);
    
    return `${hours}h ${minutes}m`;
}

// Show: "Counter resets in 3h 45m"
```

---

## Troubleshooting

### Problem: Counter Not Resetting
**Cause:** LocalStorage not being cleared, or date parsing issue

**Solution:**
```javascript
// Clear and reset
localStorage.clear();
location.reload();
```

### Problem: Counter Showing Wrong Value
**Cause:** localStorage date key mismatch

**Solution:**
```javascript
// Check current key
console.log(window.app.getTodayKey());

// Check all QR keys
for (let key in localStorage) {
    if (key.includes('qr_count')) {
        console.log(`${key}: ${localStorage[key]}`);
    }
}
```

### Problem: Limit Not Enforcing
**Cause:** `canGenerateQR()` not being called

**Solution:**
```javascript
// Verify in generateQR()
if (!this.canGenerateQR()) {
    console.log('Limit check working');
    return;
}
```

---

## Security Considerations

### Client-Side Limit Notes
1. **Limit can be bypassed** (localStorage is local)
   - Solution: For production with strict limits, use backend
   
2. **No enforcement**: User can clear localStorage
   - Acceptable for free tier
   - For paid: Use backend verification

3. **Recommendation**:
   - Current setup: Perfect for free tier
   - Add backend for paid tiers
   - Keep localStorage for UX feedback

---

## Performance Impact

- **Daily counter check**: < 1ms
- **Storage write**: < 2ms
- **UI update**: < 5ms
- **Total per QR generation**: Negligible (< 10ms)

No performance degradation.

---

## Statistics & Analytics

### Optional: Track Additional Metrics
```javascript
function saveSessionData() {
    const key = 'session_' + new Date().toISOString();
    localStorage.setItem(key, JSON.stringify({
        timestamp: Date.now(),
        qrsGenerated: window.app.getCount(),
        language: window.app.currentLang,
        duration: performance.now() / 1000
    }));
}

// Call on: beforeunload event
window.addEventListener('beforeunload', saveSessionData);
```

---

## Changelog

- **v1.0.0** - Initial implementation
  - 100 QR/day limit
  - Daily reset at UTC midnight
  - Progress bar UI
  - Warning at 80%
  - Multilingual support

---

*Technical documentation for QR.SYS32.LT Daily Limits System*
