# Firebase Admin SDK Setup for vedicastro-data Project

## Required Environment Variables

Add these to your Vercel environment variables:

```
# Firebase Admin SDK for vedicastro-data project
FIREBASE_DATA_PROJECT_ID=vedicastro-data
FIREBASE_CLIENT_EMAIL=your-service-account-email@vedicastro-data.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## How to Get These Values

### 1. Go to Firebase Console
- https://console.firebase.google.com
- Select the **vedicastro-data** project
- Go to Project Settings → Service accounts

### 2. Generate Service Account Key
1. Click "Generate new private key"
2. Select JSON format
3. Click "Generate key"
4. Download the JSON file

### 3. Extract Values from JSON
Your downloaded JSON will look like:
```json
{
  "type": "service_account",
  "project_id": "vedicastro-data",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "your-service-account-email@vedicastro-data.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/your-service-account-email%40vedicastro-data.iam.gserviceaccount.com"
}
```

### 4. Add to Vercel Environment Variables
Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these:
```
FIREBASE_DATA_PROJECT_ID=vedicastro-data
FIREBASE_CLIENT_EMAIL=your-service-account-email@vedicastro-data.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Important:** Make sure to:
- Copy the exact values from the JSON
- Keep the `\n` characters in the private key
- Wrap the private key in quotes to handle newlines

## Test the Setup

After adding the environment variables:

1. **Redeploy on Vercel**
2. **Test payment flow**
3. **Check vedicastro-data Firestore**
   - Go to Firebase Console → vedicastro-data project
   - Firestore Database → users collection
   - You should see the user document with plan data

## Security Notes

- The service account has admin access to Firestore
- Only the backend can use these credentials
- Frontend never sees these secrets
- The API endpoint validates all inputs

## Troubleshooting

### Error: "Missing required fields"
- Check that uid and planName are being sent
- Verify the user is authenticated

### Error: "Invalid plan"
- Check that planName is one of: Free, Standard, Premium

### Error: "Failed to save user plan"
- Check Firebase Admin SDK environment variables
- Verify the service account has Firestore permissions
- Check Vercel function logs

### Error: "PERMISSION_DENIED"
- Make sure the service account has Firestore admin role
- Check that FIREBASE_DATA_PROJECT_ID matches the correct project
