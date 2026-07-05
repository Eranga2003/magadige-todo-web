import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';

// Load environment variables immediately on module import
dotenv.config();

let isFirebaseConfigured = false;
let dbInstance: any = null;
let authInstance: any = null;

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

// --- IN-MEMORY DATABASE FALLBACK FOR OFFLINE DEVELOPER MODE (FIRESTORE) ---
const memoryDbStore: Record<string, any> = {};

class MockDocSnapshot {
  id: string;
  private docData: any;
  exists: boolean;

  constructor(id: string, docData: any) {
    this.id = id;
    this.docData = docData;
    this.exists = docData !== undefined && docData !== null;
  }

  data() {
    return this.docData;
  }
}

class MockQuerySnapshot {
  docs: MockDocSnapshot[];
  empty: boolean;

  constructor(docs: MockDocSnapshot[]) {
    this.docs = docs;
    this.empty = docs.length === 0;
  }
}

class MockDocRef {
  id: string;
  private collectionName: string;

  constructor(collectionName: string, id: string) {
    this.collectionName = collectionName;
    this.id = id;
  }

  async get() {
    const data = memoryDbStore[`${this.collectionName}/${this.id}`];
    return new MockDocSnapshot(this.id, data);
  }

  async set(data: any) {
    memoryDbStore[`${this.collectionName}/${this.id}`] = JSON.parse(JSON.stringify(data));
    return;
  }

  async delete() {
    delete memoryDbStore[`${this.collectionName}/${this.id}`];
    return;
  }
}

class MockCollectionRef {
  private name: string;
  private queries: Array<{ field: string; op: string; value: any }> = [];

  constructor(name: string) {
    this.name = name;
  }

  doc(id?: string) {
    const docId = id || `mock_doc_${Math.random().toString(36).substring(2, 11)}`;
    return new MockDocRef(this.name, docId);
  }

  where(field: string, op: string, value: any) {
    const query = new MockCollectionRef(this.name);
    query.queries = [...this.queries, { field, op, value }];
    return query;
  }

  async get() {
    const matchedDocs: MockDocSnapshot[] = [];
    const prefix = `${this.name}/`;

    for (const [key, data] of Object.entries(memoryDbStore)) {
      if (key.startsWith(prefix)) {
        const id = key.substring(prefix.length);
        
        let matches = true;
        for (const q of this.queries) {
          if (q.op === '==' && data[q.field] !== q.value) {
            matches = false;
            break;
          }
        }
        
        if (matches) {
          matchedDocs.push(new MockDocSnapshot(id, data));
        }
      }
    }
    
    return new MockQuerySnapshot(matchedDocs);
  }
}

class MockFirestore {
  collection(name: string) {
    return new MockCollectionRef(name);
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

// --- INITIALIZATION ---
if (projectId && clientEmail && privateKey) {
  try {
    if (getApps().length === 0) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
    }
    dbInstance = getFirestore();
    authInstance = getAdminAuth();
    isFirebaseConfigured = true;
    console.log('✅ Firebase Admin SDK successfully connected to Cloud Firestore & Auth!');
  } catch (error: any) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
  }
}

if (!isFirebaseConfigured) {
  console.warn('⚠️  DATABASE WARNING: Firebase credentials not set in backend/.env!');
  console.log('💡 Developer Mode active: Using in-memory fallback Cloud Firestore. Registration & logins will work locally.');
  dbInstance = new MockFirestore();
  authInstance = new MockAuth();
}

/**
 * Returns the active Firestore Database reference (or in-memory mock fallback)
 */
export function getDb() {
  return dbInstance;
}

/**
 * Returns the active Firebase Authentication reference (or in-memory mock fallback)
 */
export function getAuth() {
  return authInstance;
}
