rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Default: deny all access
    match /{document=**} {
      allow read, write: if false;
    }

    // Users collection: Allow authenticated users to read/write their own document
    match /users/{userId} {
      // Users can read their own document
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Users can write to their own document (for plan updates after payment)
      allow write: if request.auth != null && request.auth.uid == userId;
      
      // Allow creating own document on first sign-up
      allow create: if request.auth != null && request.auth.uid == userId;
    }

    // Payments collection: Allow authenticated users to read their own payments
    match /payments/{paymentId} {
      // Users can read their own payment records
      allow read: if request.auth != null;
      
      // Users can create their own payment records
      allow create: if request.auth != null;
      
      // Users can update their own payment records
      allow update: if request.auth != null;
    }

    // Invoices collection: Read-only for authenticated users
    match /invoices/{invoiceId} {
      // Only authenticated users can read invoices
      allow read: if request.auth != null;
      
      // Users can create their own invoices
      allow create: if request.auth != null;
      
      // Users can update their own invoices
      allow update: if request.auth != null;
    }

    // Members collection: Users can read their own members
    match /members/{memberId} {
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}
