const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

let db = null;

try {
  // BULLETPROOF SOLUTION: Read from ENV var on Vercel, or fallback to local JSON
  let serviceAccount;
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } else {
    serviceAccount = require('./firebase-service-account.json');
  }

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    db = admin.firestore();
    console.log('Firebase Admin SDK initialized successfully.');
  } else {
    console.warn(`[WARNING] Firebase credentials not found. Database operations will fail.`);
  }
} catch (error) {
  console.error('[ERROR] Failed to initialize Firebase Admin SDK:', error.message);
}

module.exports = { admin, db };
