# Deployment Guide - QR.SYS32.LT

Complete step-by-step guide to deploy your QR generator to Cloudflare Pages and custom domain.

## 📋 Prerequisites

- Cloudflare account (free: https://cloudflare.com)
- Custom domain (optional, but recommended)
- GitHub account (for GitHub integration method)
- Git installed locally (optional)

## 🚀 Deployment Methods

### Method 1: GitHub Integration (Recommended) ⭐

This method is best for automatic deployments when you push to GitHub.

#### Step 1: Prepare GitHub

1. **Create GitHub Repository**
   - Go to https://github.com/new
   - Repository name: `qr-sys32-lt`
   - Description: "Next-gen QR Code Generator - Fast, Private, Powerful"
   - Public or Private (your choice)
   - Click "Create repository"

2. **Clone & Push Code**
   ```bash
   git clone https://github.com/yourusername/qr-sys32-lt.git
   cd qr-sys32-lt
   
   # Copy all files into this directory
   
   git add .
   git commit -m "Initial commit: QR.SYS32.LT v1.0.0"
   git push -u origin main
   ```

#### Step 2: Connect to Cloudflare Pages

1. **Log in to Cloudflare**
   - Visit https://dash.cloudflare.com
   - Sign in with your account

2. **Create Pages Project**
   - Left sidebar: **Pages**
   - Click **Create a project**
   - Select **Connect to Git**

3. **Authorize GitHub**
   - Click "Connect GitHub"
   - Authorize Cloudflare access to your GitHub account
   - Select your GitHub organization/account

4. **Select Repository**
   - Find and select `qr-sys32-lt` repository
   - Click "Begin setup"

5. **Configure Build**
   - **Project name**: `qr-sys32-lt` (or your custom name)
   - **Production branch**: `main`
   - **Framework preset**: `None` (static site)
   - **Build command**: *(leave empty)*
   - **Build output directory**: *(leave empty or put `.`)*
   - **Environment variables**: *(leave as is)*

6. **Deploy**
   - Click **Save and Deploy**
   - Wait for deployment to complete (1-2 minutes)
   - Your site is now live at `qr-sys32-lt.pages.dev`

#### Step 3: Connect Custom Domain

1. **Add Custom Domain**
   - In Pages project settings
   - Tab: **Custom domains**
   - Click **+ Add domain**
   - Enter your domain: `qr.sys32.lt`

2. **DNS Setup**
   - Cloudflare will check your domain registrar
   - If domain is already on Cloudflare:
     - DNS record auto-created
     - Wait 5-10 minutes for propagation
   - If domain is NOT on Cloudflare:
     - Update nameservers at your registrar:
       - `nathan.ns.cloudflare.com`
       - `susan.ns.cloudflare.com`
     - Wait 24-48 hours for DNS propagation

3. **Verify & Enable SSL**
   - Cloudflare automatically:
     - Provisions SSL certificate
     - Enables HTTPS
     - Redirects HTTP to HTTPS

---

### Method 2: Direct Upload (Easiest) 🎯

For quick testing or if you prefer not to use GitHub.

#### Step 1: Prepare Files

1. **Zip the project**
   ```bash
   # On Windows
   # Right-click qr-sys32-lt folder → Send to → Compressed folder
   
   # On Mac/Linux
   zip -r qr-sys32-lt.zip qr-sys32-lt/
   ```

#### Step 2: Upload to Cloudflare

1. **Go to Cloudflare Pages**
   - https://dash.cloudflare.com
   - Pages → **Create a project**
   - Select **"Upload assets"** (not "Connect to Git")

2. **Drop Files**
   - Drag and drop the `qr-sys32-lt` folder
   - Or click to select files
   - Select ALL files:
     - `index.html`
     - `privacy.html`
     - All in `css/`, `js/` directories
     - `manifest.json`, `robots.txt`, `sitemap.xml`
     - `sw.js`
     - `_redirects`

3. **Wait for Upload**
   - Cloudflare processes files
   - Your site is live at: `projectname.pages.dev`

#### Step 3: Connect Domain (Same as Method 1, Step 3)

---

### Method 3: CLI Deployment (Advanced) 🔧

For developers who prefer command line.

#### Step 1: Install Wrangler

```bash
# Install Node.js first if needed
npm install -g @cloudflare/wrangler

# Or with Yarn
yarn global add @cloudflare/wrangler
```

#### Step 2: Authenticate

```bash
wrangler login
# Browser opens → Authorize Cloudflare access
```

#### Step 3: Deploy

```bash
cd qr-sys32-lt
wrangler pages deploy .
```

#### Step 4: Configure Domain

```bash
# In wrangler.toml, set:
route = "qr.sys32.lt/*"
zone_id = "YOUR_ZONE_ID"  # Get from Cloudflare dashboard

# Re-deploy
wrangler pages deploy .
```

---

## ✅ Post-Deployment Checklist

### 1. Test Functionality

- [ ] Visit http://yourcomain.com (redirect to HTTPS)
- [ ] Try generating QR codes
- [ ] Test all input types: text, URL, email, phone, WiFi
- [ ] Download as PNG, SVG, PDF
- [ ] Test print functionality
- [ ] Test dark/light theme toggle
- [ ] Test social sharing (if online)
- [ ] Test history/localStorage

### 2. Mobile Testing

- [ ] Visit on iPhone Safari
- [ ] Visit on Android Chrome
- [ ] Test touch interactions
- [ ] Test "Add to Home Screen" (PWA)
- [ ] Test in landscape orientation

### 3. SEO Verification

- [ ] Open Chrome DevTools → Network
- [ ] Check `meta` tags are loaded
- [ ] Verify `robots.txt` returns 200
- [ ] Verify `sitemap.xml` returns 200
- [ ] Check `manifest.json` loads correctly
- [ ] Run Lighthouse audit

### 4. Performance Check

```bash
# Use Chrome DevTools → Lighthouse
Ctrl+Shift+I → Lighthouse → Generate report

# Target scores:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 100
```

### 5. Security Check

- [ ] HTTPS enabled
- [ ] No console errors
- [ ] No mixed content warnings
- [ ] Service worker registered
- [ ] CSP headers set

### 6. Analytics Setup (Optional)

```html
<!-- Add to index.html if desired -->
<script>
  // Minimal analytics (optional)
  // Cloudflare provides built-in analytics
</script>
```

---

## 🔄 Updating Your Site

### If Using GitHub Integration

1. **Make changes locally**
```bash
git add .
git commit -m "Update description"
git push origin main
```

2. **Automatic deployment**
   - Cloudflare automatically redeploys
   - Takes 1-2 minutes
   - Monitor at: Dashboard → Pages → Deployments

### If Using Direct Upload

1. **Modify files locally**
2. **Re-upload** via Cloudflare Pages dashboard
3. **Clear browser cache**: Ctrl+Shift+Delete

---

## 🆘 Troubleshooting

### Issue: Site shows 404

**Solution:**
- Check `_redirects` file exists in root
- Ensure all files were uploaded
- Clear Cloudflare cache:
  - Dashboard → Caching → Purge Cache
  - Select "Purge everything"

### Issue: Dark mode doesn't work on mobile

**Solution:**
```javascript
// Clear browser storage
// DevTools → Application → Clear storage
// Or use "Clear History" button in app
```

### Issue: QR code library not loading

**Solution:**
- Check internet connection
- Verify CDN is accessible:
  - https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js
- Try in incognito window (no cache issue)

### Issue: Service worker not updating

**Solution:**
```javascript
// Hard refresh
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)

// Or in DevTools:
// Application → Service Workers → Unregister
// Then refresh page
```

### Issue: Custom domain DNS not resolving

**Solution:**
- Check DNS propagation: https://dnschecker.org
- Verify nameservers at registrar:
  - Should point to Cloudflare nameservers
- Wait 24-48 hours if just changed
- Clear local DNS cache:
  ```bash
  # Windows
  ipconfig /flushdns
  
  # Mac
  sudo dscacheutil -flushcache
  
  # Linux
  sudo systemctl restart systemd-resolved
  ```

---

## 📊 Monitoring

### Cloudflare Dashboard

1. **Analytics**
   - Pages → Your project → Analytics
   - View traffic, requests, cache rates

2. **Deployments**
   - Pages → Your project → Deployments
   - View build logs, rollback if needed

3. **Custom Domains**
   - Pages → Custom domains
   - Verify SSL status (green checkmark)

### Browser Console

```javascript
// Check status in browser console
console.log(app.getInfo())
// View app version, features, history stats
```

---

## 🚀 Advanced Configuration

### Cloudflare Rules

1. **Cache everything**
   - Dashboard → Caching → Page Rules
   - Pattern: `qr.sys32.lt/*`
   - Setting: "Cache Level" = Cache Everything
   - TTL: 1 month

2. **Security**
   - Dashboard → Security → WAF → Managed Rules
   - Enable "OWASP Core Ruleset"

### Environment Variables (if expanding later)

```toml
# wrangler.toml
[env.production]
vars = { ENVIRONMENT = "production", DOMAIN = "qr.sys32.lt" }
```

---

## 📱 PWA Distribution

### Share Installation Links

1. **Direct link**
   ```
   https://qr.sys32.lt
   ```

2. **Deep link to features**
   ```
   https://qr.sys32.lt?type=url
   ```

3. **App store listings**
   - Web App Manifest automatically detected
   - Appears in app stores on supported platforms

---

## 🎉 Deployment Complete!

Your QR.SYS32.LT application is now live!

### What's Next?

- [ ] Test all features
- [ ] Share with users
- [ ] Monitor analytics
- [ ] Collect feedback
- [ ] Plan improvements

### Share Your App

- Tweet: "Just launched QR.SYS32.LT - the next-gen QR code generator! Fast, private, and powerful. Try it: https://qr.sys32.lt"
- Reddit: r/webdev, r/javascript, r/productlaunch
- Product Hunt (when ready)
- Dev communities

---

## 📞 Support

If deployment fails:

1. **Check Cloudflare Status**: https://www.cloudflarestatus.com
2. **Review build logs**: Pages → your project → recent deployment
3. **Verify files**: Make sure all files are in root directory
4. **Browser cache**: Clear all and hard refresh
5. **Check console**: DevTools → Console for errors

---

**Happy Deployment! 🚀**

For questions or issues, refer back to README.md or check Cloudflare documentation.
