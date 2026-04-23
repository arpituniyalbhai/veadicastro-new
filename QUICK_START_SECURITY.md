# Quick Start - Security Deployment Guide

## ⚡ TL;DR - Do This Now

### 1. Rotate API Keys (5 minutes)
```bash
# Gemini: https://console.cloud.google.com/apis/credentials
# Razorpay: https://dashboard.razorpay.com/app/settings/api-keys
# Copy new keys
```

### 2. Add to Vercel (2 minutes)
Go to: **Vercel Dashboard → Settings → Environment Variables**

```
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_new_secret_key_here
GEMINI_API_KEY=your_new_gemini_key_here
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
```

### 3. Deploy Firestore Rules (2 minutes)
```bash
firebase deploy --only firestore:rules
```

### 4. Redeploy (1 minute)
- Vercel Dashboard → Deployments → Redeploy latest

### 5. Test (5 minutes)
- Try buying a plan
- Check /future page loads
- Verify plan status works

---

## 📋 What Was Fixed

| Issue | Fix | Impact |
|-------|-----|--------|
| Users could pay ₹1 | Backend calculates amount | 💰 Revenue protected |
| API key exposed | Moved to backend | 🔐 API secured |
| Firebase open | Added security rules | 🛡️ Database secured |
| Plan faking | Server-side validation | 👤 User status secured |
| No rate limiting | Added 100 req/min limit | ⚡ API protected |

---

## 🚀 Deployment Checklist

- [ ] Rotate API keys
- [ ] Add to Vercel environment
- [ ] Deploy Firestore rules
- [ ] Redeploy on Vercel
- [ ] Test payment flow
- [ ] Test Gemini API
- [ ] Test plan status
- [ ] Monitor for errors

---

## 📁 Files Changed

**Backend:**
- `api/razorpay/create-order.ts` - Amount validation
- `api/razorpay/verify-payment.ts` - Amount validation
- `api/gemini.ts` - Rate limiting

**Frontend:**
- `src/pages/Pricing.tsx` - Remove amount param
- `src/services/geminiService.ts` - Backend proxy
- `src/lib/firebase.ts` - Env variables
- `src/context/PlanContext.tsx` - Server-side plan

**Config:**
- `firestore.rules` - Security rules (NEW)
- `.env.example` - Env template (NEW)

**Docs:**
- `SECURITY_FIXES.md` - Detailed explanation
- `DEPLOYMENT_SECURITY.md` - Full guide
- `SECURITY_SUMMARY.md` - Overview

---

## ✅ Testing

### Payment Test
```bash
1. Go to /pricing
2. Click "Buy Premium"
3. Verify amount is ₹499 (not ₹1)
4. Complete payment
5. Check Firestore for correct plan
```

### API Test
```bash
1. Go to /future or /instruction
2. Open DevTools → Network
3. Verify requests go to /api/gemini
4. No Google API key exposed
```

### Plan Test
```javascript
// DevTools Console:
localStorage.setItem("userPlan", "Premium");
location.reload();
// Should still show Free plan
```

---

## 🔑 Environment Variables

### Public (Safe for Frontend)
```
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
```

### Secret (Backend Only)
```
RAZORPAY_KEY_SECRET=your_secret_here
GEMINI_API_KEY=your_key_here
```

---

## 🚨 Critical: Do NOT

❌ Commit `.env.local` to git
❌ Hardcode API keys in frontend
❌ Trust localStorage for plan status
❌ Send amount from frontend to backend
❌ Skip Firestore rules deployment

---

## 📞 Troubleshooting

**"Razorpay credentials not found"**
→ Verify env vars in Vercel, redeploy

**"Gemini API error"**
→ Check GEMINI_API_KEY in Vercel, verify API quota

**"Firestore rules rejected"**
→ Deploy rules: `firebase deploy --only firestore:rules`

**"Payment amount wrong"**
→ Verify backend calculates amount correctly

---

## 📚 Full Documentation

- **SECURITY_FIXES.md** - Detailed vulnerability explanations
- **DEPLOYMENT_SECURITY.md** - Complete deployment guide
- **SECURITY_SUMMARY.md** - Overview of all changes

---

## ⏱️ Estimated Time: 15 minutes

1. Rotate keys (5 min)
2. Add to Vercel (2 min)
3. Deploy rules (2 min)
4. Redeploy (1 min)
5. Test (5 min)

**Total: ~15 minutes to production-ready security**

---

## 🎯 Success Criteria

✅ Payment amount validated server-side
✅ Gemini API key not exposed
✅ Firestore rules deployed
✅ Plan status from server
✅ Rate limiting active
✅ All tests passing

---

**Status:** Ready for deployment
**Risk Level:** Low (no breaking changes)
**Rollback:** Easy (revert Vercel deployment)
