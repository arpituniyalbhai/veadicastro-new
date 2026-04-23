# Usage Tracking System

## Overview
All user usage (questions and reports) is now tracked in Firestore per user, ensuring persistence across page refreshes and devices.

## APIs

### 1. Check Usage (`/api/check-usage`)
**Purpose**: Check current usage without incrementing

**Request**:
```json
{
  "uid": "user_id",
  "type": "questions" | "reports"
}
```

**Response** (Questions):
```json
{
  "type": "questions",
  "plan": "Standard",
  "dailyLimit": 10,
  "used": 3,
  "remaining": 7,
  "canUse": true,
  "date": "2025-12-07"
}
```

**Response** (Reports):
```json
{
  "type": "reports",
  "plan": "Standard",
  "monthlyLimit": 5,
  "used": 2,
  "remaining": 3,
  "canUse": true,
  "month": "2025-12"
}
```

### 2. Increment Usage (`/api/increment-usage`)
**Purpose**: Increment usage and check limits

**Request**:
```json
{
  "uid": "user_id",
  "type": "questions" | "reports"
}
```

**Response** (Success):
```json
{
  "success": true,
  "type": "questions",
  "plan": "Standard",
  "dailyLimit": 10,
  "used": 4,
  "remaining": 6,
  "date": "2025-12-07"
}
```

**Response** (Limit Exceeded - 429):
```json
{
  "error": "You have reached your daily question limit. Upgrade your plan to ask more.",
  "type": "questions",
  "plan": "Free",
  "dailyLimit": 5,
  "used": 5,
  "remaining": 0
}
```

## Firestore Data Structure

```
users/{uid}
├── planName: "Free" | "Standard" | "Premium"
├── questionsUsed: {
│   "2025-12-07": 3,
│   "2025-12-06": 5,
│   ...
│ }
├── reportsUsed: {
│   "2025-12": 2,
│   "2025-11": 4,
│   ...
│ }
└── lastUpdated: Timestamp
```

## Usage Limits

### Questions (Daily)
- **Free**: 5 questions/day
- **Standard**: 10 questions/day
- **Premium**: 20 questions/day

### Reports (Monthly)
- **Free**: 1 report/month
- **Standard**: 5 reports/month
- **Premium**: 10 reports/month

## Frontend Integration

### Check Before Action
```typescript
const canAsk = await planContext.canAskMoreQuestions();
if (!canAsk) {
  // Show upgrade prompt
}
```

### Register Usage After Success
```typescript
await planContext.registerQuestionUsage();
```

### Check Report Limit
```typescript
const canGenerate = await planContext.canGenerateReport();
if (!canGenerate) {
  // Show upgrade prompt
}
```

### Register Report Usage
```typescript
await planContext.registerReportUsage();
```

## Key Features

✅ **Persistent Across Refresh**: All data stored in Firestore
✅ **Daily Reset**: Questions reset at midnight (UTC)
✅ **Monthly Reset**: Reports reset on 1st of month
✅ **Plan-Based Limits**: Limits enforced based on user's plan
✅ **Cross-Device**: Usage synced across all devices
✅ **Error Handling**: Graceful fallback if API fails
✅ **Timestamp Tracking**: `lastUpdated` field for auditing

## Migration Notes

- Old localStorage usage keys (`usedQuestions_Free`, etc.) are deprecated
- All new usage is tracked in Firestore only
- Frontend still maintains local state for UI responsiveness
- Backend APIs are source of truth for enforcement
