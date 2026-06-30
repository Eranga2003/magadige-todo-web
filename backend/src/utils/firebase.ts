import admin from 'firebase-admin';

let isFirebaseConfigured = false;
let dbInstance: any = null;
let authInstance: any = null;

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;
const databaseURL = process.env.FIREBASE_DATABASE_URL;

// --- IN-MEMORY DATABASE FALLBACK FOR DEVELOPER MODE ---
const memoryDbStore: Record<string, any> = {};

class MockSnapshot {
  private data: any;
  constructor(data: any) {
    this.data = data;
  }
  exists() {
    return this.data !== undefined && this.data !== null && Object.keys(this.data).length > 0;
  }
  val() {
    return this.data;
  }
}

class MockRef {
  private path: string;
  constructor(path: string) {
    this.path = path;
  }

  child(subpath: string) {
    return new MockRef(`${this.path}/${subpath}`);
  }

  push() {
    const key = `mock_key_${Math.random().toString(36).substring(2, 11)}`;
    return {
      key,
      ref: new MockRef(`${this.path}/${key}`),
    };
  }

  async set(value: any) {
    const cleanPath = this.path.startsWith('/') ? this.path.substring(1) : this.path;
    memoryDbStore[cleanPath] = JSON.parse(JSON.stringify(value));
    return;
  }

  orderByChild(childField: string) {
    return new MockQuery(this.path, childField);
  }

  async once(eventType: string) {
    const cleanPath = this.path.startsWith('/') ? this.path.substring(1) : this.path;
    
    if (cleanPath === 'users') {
      const allUsers: Record<string, any> = {};
      for (const [key, value] of Object.entries(memoryDbStore)) {
        if (key.startsWith('users/')) {
          allUsers[value.id] = value;
        }
      }
      return new MockSnapshot(allUsers);
    }

    return new MockSnapshot(memoryDbStore[cleanPath]);
  }
}

class MockQuery {
  private path: string;
  private childField: string;
  private equalValue: any = null;

  constructor(path: string, childField: string) {
    this.path = path;
    this.childField = childField;
  }

  equalTo(value: any) {
    this.equalValue = value;
    return this;
  }

  async once(eventType: string) {
    const matchedUsers: Record<string, any> = {};
    for (const [key, value] of Object.entries(memoryDbStore)) {
      if (key.startsWith('users/') && value && value[this.childField] === this.equalValue) {
        matchedUsers[value.id] = value;
      }
    }
    return new MockSnapshot(matchedUsers);
  }
}

class MockAuth {
  async verifyIdToken(token: string) {
    if (token.startsWith('mock_')) {
      return {
        uid: `mock_uid_${token.substring(5, 15)}`,
        email: 'mock_social_user@example.com',
        name: 'Mock Social User',
      };
    }
    throw new Error('Real Firebase ID Token verification requires valid credentials in .env.');
  }
}

class MockDb {
  ref(path: string) {
    return new MockRef(path);
  }
}

// --- INITIALIZATION ---
if (projectId && clientEmail && privateKey) {
  try {
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
    dbInstance = admin.database();
    authInstance = admin.auth();
    isFirebaseConfigured = true;
    console.log('✅ Firebase Admin SDK successfully connected to Realtime Database & Auth!');
  } catch (error: any) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
  }
}

if (!isFirebaseConfigured) {
  console.warn('⚠️  DATABASE WARNING: Firebase credentials not set in backend/.env!');
  console.log('💡 Developer Mode active: Using in-memory fallback database. Registration & logins will work locally.');
  dbInstance = new MockDb();
  authInstance = new MockAuth();
}

/**
 * Returns the active Firebase Realtime Database reference (or in-memory mock fallback)
 */
export function getDb(): admin.database.Database {
  return dbInstance;
}

/**
 * Returns the active Firebase Authentication reference (or in-memory mock fallback)
 */
export function getAuth(): admin.auth.Auth {
  return authInstance;
}
