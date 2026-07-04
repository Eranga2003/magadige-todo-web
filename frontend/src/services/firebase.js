import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let auth = null;
let googleProvider = null;
let facebookProvider = null;
let isFirebaseClientConfigured = false;

if (firebaseConfig.apiKey) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    facebookProvider = new FacebookAuthProvider();
    isFirebaseClientConfigured = true;
    console.log('✅ Client-side Firebase App successfully initialized!');
  } catch (error) {
    console.error('❌ Failed to initialize client-side Firebase:', error.message);
  }
} else {
  console.warn('⚠️  CLIENT WARNING: Firebase VITE environment variables not found in frontend/.env!');
  console.warn('⚠️  Google & Facebook sign-ins will run in Simulated Developer Mode.');
}

/**
 * Triggers Google Sign-in Popup and extracts the ID Token
 */
export async function signInWithGoogle() {
  if (!isFirebaseClientConfigured) {
    console.log('Simulating Google Popup Sign-in...');
    return {
      token: `mock_google_token_${Date.now()}`,
      name: 'Google Explorer',
      email: `google_dev_user_${Math.floor(Math.random() * 10000)}@example.com`,
    };
  }

  const result = await signInWithPopup(auth, googleProvider);
  const token = await result.user.getIdToken();
  return {
    token,
    name: result.user.displayName || 'Google User',
    email: result.user.email,
  };
}

/**
 * Triggers Facebook Sign-in Popup and extracts the ID Token
 */
export async function signInWithFacebook() {
  if (!isFirebaseClientConfigured) {
    console.log('Simulating Facebook Popup Sign-in...');
    return {
      token: `mock_facebook_token_${Date.now()}`,
      name: 'Facebook Member',
      email: `facebook_dev_user_${Math.floor(Math.random() * 10000)}@example.com`,
    };
  }

  const result = await signInWithPopup(auth, facebookProvider);
  const token = await result.user.getIdToken();
  return {
    token,
    name: result.user.displayName || 'Facebook User',
    email: result.user.email,
  };
}
