import admin from 'firebase-admin';

let isFirebaseConfigured = false;
let db: admin.database.Database | null = null;
let authInstance: admin.auth.Auth | null = null;

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;
const databaseURL = process.env.FIREBASE_DATABASE_URL;

// Check if credentials are provided in the environment variables
if (projectId && clientEmail && privateKey) {
  try {
    // Only initialize if there are no active apps
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
        databaseURL,
      });
    }
    db = admin.database();
    authInstance = admin.auth();
    isFirebaseConfigured = true;
    console.log('✅ Firebase Admin SDK successfully connected to Realtime Database & Auth!');
  } catch (error: any) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
  }
} else {
  console.warn('⚠️  DATABASE WARNING: Firebase credentials not set in backend/.env!');
  console.warn('⚠️  Registration and Login requests will fail until Firebase configuration is added.');
}

/**
 * Returns the active Firebase Realtime Database reference
 */
export function getDb(): admin.database.Database {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Database connection failed. Please provide valid Firebase credentials in backend/.env');
  }
  return db;
}

/**
 * Returns the active Firebase Authentication reference
 */
export function getAuth(): admin.auth.Auth {
  if (!isFirebaseConfigured || !authInstance) {
    throw new Error('Firebase Auth initialization failed. Please provide valid Firebase credentials in backend/.env');
  }
  return authInstance;
}
