# Deployment & Security Configuration Guide

## Step 1: Rotate All Exposed API Keys

### 1.1 Gemini API Key
```bash
# 1. Go to: https://console.cloud.google.com/apis/credentials
# 2. Find your current API key
# 3. Delete the old key
# 4. Create a new API key
# 5. Copy the new key
```

### 1.2 Razorpay Keys
```bash
# 1. Go to: https://dashboard.razorpay.com/app/settings/api-keys
# 2. Regenerate API Key and Secret
# 3. Copy both values
```

### 1.3 Firebase Keys (Optional)
```bash
# Firebase API keys are public, but verify in:
# https://console.firebase.google.com/project/YOUR_PROJECT/settings/general
```

---

## Step 2: Configure Vercel Environment Variables

### 2.1 Add Environment Variables to Vercel

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these variables:

```
# Production Environment
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_new_secret_key_here
GEMINI_API_KEY=your_new_gemini_key_here

# Optional: Firebase (if using env-based config)
VITE_FIREBASE_API_KEY=AIzaSyDj9p3Fgq5ROH4xaKNXe8F_OYtxJolIJ64
VITE_FIREBASE_PROJECT_ID=vedicastro111
VITE_FIREBASE_AUTH_DOMAIN=vedicastro111.firebaseapp.com
# ... other Firebase vars

# Frontend Public Keys (VITE_ prefix)
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
```

### 2.2 Verify Environment Variables

```bash
# After adding to Vercel, redeploy:
# 1. Go to Deployments
# 2. Click "Redeploy" on latest deployment
# 3. Vercel will use new environment variables
```

---

## Step 3: Deploy Firestore Security Rules

### 3.1 Deploy via Firebase CLI

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy rules
firebase deploy --only firestore:rules
```

### 3.2 Deploy via Firebase Console

```
1. Go to: https://console.firebase.google.com
2. Select your project (vedicastro-data)
3. Go to Firestore Database → Rules
4. Copy content from firestore.rules file
5. Click "Publish"
```

### 3.3 Verify Rules

```bash
# Test rules in Firebase Console
# Try to read/write as different users
# Verify that:
# - Users can only read their own document
# - Users cannot write to any document
# - Invoices are read-only
```

---

## Step 4: Clean Up Git History

### 4.1 Remove Exposed Files from Git

```bash
# Remove from git tracking (but keep locally for reference)
git rm --cached .env.local gemini.env

# Add to .gitignore
echo ".env.local" >> .gitignore
echo "gemini.env" >> .gitignore
echo ".env" >> .gitignore
echo ".env.*.local" >> .gitignore

# Commit changes
git add .gitignore
git commit -m "Remove exposed environment files and update gitignore"

# Push to remote
git push origin main
```

### 4.2 Remove from Git History (Optional but Recommended)

```bash
# Install git-filter-repo (or use BFG Repo-Cleaner)
pip install git-filter-repo

# Remove files from entire history
git filter-repo --invert-paths --path .env.local --path gemini.env

# Force push (CAREFUL - this rewrites history)
git push origin main --force
```

---

## Step 5: Test Security Fixes

### 5.1 Test Payment Flow

```bash
# 1. Go to /pricing page
# 2. Try to buy Premium plan
# 3. Verify:
#    - Amount is NOT sent to backend
#    - Backend calculates amount (49900 paise)
#    - Payment succeeds with correct amount
#    - Firestore records correct plan
```

### 5.2 Test Gemini API

```bash
# 1. Go to /future or /instruction page
# 2. Verify content loads
# 3. Open DevTools → Network tab
# 4. Check that:
#    - Requests go to /api/gemini (not Google API)
#    - No API key is exposed in requests
#    - Response contains generated content
```

### 5.3 Test Plan Status

```javascript
// Open DevTools Console and run:
localStorage.setItem("userPlan", "Premium");
location.reload();

// Verify:
// - Page still shows "Free" plan
// - Real plan comes from Firestore
// - Premium features are locked
```

### 5.4 Test Rate Limiting

```bash
# Send multiple requests rapidly
for i in {1..110}; do
  curl -X POST https://your-domain/api/gemini \
    -H "Content-Type: application/json" \
    -d '{"prompt": "test"}' &
done

# Verify:
# - First 100 requests succeed
# - 101st+ requests return 429 Too Many Requests
```

---

## Step 6: Monitor & Maintain

### 6.1 Set Up Monitoring

```bash
# Monitor API usage
# 1. Google Cloud Console → Gemini API → Quotas
# 2. Razorpay Dashboard → Transactions
# 3. Firebase Console → Firestore → Usage
```

### 6.2 Set Up Alerts

```bash
# Vercel Alerts
# 1. Vercel Dashboard → Settings → Alerts
# 2. Enable alerts for:
#    - Failed deployments
#    - High error rates
#    - Unusual traffic

# Google Cloud Alerts
# 1. Cloud Console → Monitoring → Alerting
# 2. Alert on:
#    - API quota exceeded
#    - Unusual API usage
```

### 6.3 Regular Security Audits

```bash
# Monthly:
# - Review Firestore access logs
# - Check for suspicious API calls
# - Verify rate limiting is working
# - Review payment transactions

# Quarterly:
# - Rotate API keys
# - Update dependencies
# - Run security scan
```

---

## Troubleshooting

### Issue: "Razorpay credentials not found"

**Solution:**
```bash
# 1. Verify environment variables are set in Vercel
# 2. Redeploy the project
# 3. Check Vercel logs: vercel logs --follow
# 4. Ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set
```

### Issue: "Gemini API error"

**Solution:**
```bash
# 1. Verify GEMINI_API_KEY is set in Vercel
# 2. Check Google Cloud Console for quota limits
# 3. Verify API is enabled: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
# 4. Check rate limiting isn't blocking requests
```

### Issue: "Firestore rules rejected"

**Solution:**
```bash
# 1. Verify rules are deployed: firebase deploy --only firestore:rules
# 2. Check rules in Firebase Console
# 3. Test rules with sample data
# 4. Ensure user is authenticated before accessing Firestore
```

### Issue: "Payment amount mismatch"

**Solution:**
```bash
# 1. Verify VALID_PLAN_PRICES in create-order.ts
# 2. Check that frontend is NOT sending amount
# 3. Verify backend calculates amount correctly
# 4. Test with: curl -X POST /api/razorpay/create-order -d '{"planName": "Premium"}'
```

---

## Verification Checklist

- [ ] All API keys rotated
- [ ] Vercel environment variables set
- [ ] Firestore rules deployed
- [ ] Git history cleaned
- [ ] Payment flow tested
- [ ] Gemini API tested
- [ ] Plan status tested
- [ ] Rate limiting tested
- [ ] Monitoring set up
- [ ] Alerts configured
- [ ] Team notified of changes
- [ ] Backup of old keys created (for reference only)

---

## Rollback Plan

If something goes wrong:

```bash
# 1. Revert to previous deployment
# Vercel Dashboard → Deployments → Click "Rollback"

# 2. Restore old environment variables
# Vercel Dashboard → Settings → Environment Variables

# 3. Restore old Firestore rules
# firebase deploy --only firestore:rules

# 4. Notify team and investigate
```

---

## Security Checklist (Post-Deployment)

- [ ] No API keys in source code
- [ ] No API keys in git history
- [ ] All environment variables in Vercel
- [ ] Firestore rules restrict access
- [ ] Payment amounts validated server-side
- [ ] Plan status comes from Firestore
- [ ] Rate limiting enabled
- [ ] HTTPS enforced
- [ ] Monitoring active
- [ ] Alerts configured

---

## Support

If you encounter issues:

1. Check Vercel logs: `vercel logs --follow`
2. Check Firebase logs: Firebase Console → Logs
3. Check browser DevTools → Network tab
4. Review SECURITY_FIXES.md for detailed changes
5. Contact support with error messages and logs
