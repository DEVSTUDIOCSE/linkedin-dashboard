/**
 * Firebase App Initialization
 * Uses environment configuration for UAT/PROD switching
 * 
 * NOTE: Firebase is optional - app will run without it for static pages.
 * If Firebase is required for a page, wrap it in a component that checks
 * for Firebase availability.
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getCurrentFirebaseConfig, isFirebaseConfigured } from './config/environments';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

// Only initialize Firebase if all required env vars are set
if (isFirebaseConfigured()) {
  try {
    app = initializeApp(getCurrentFirebaseConfig());
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.warn('Firebase initialization failed. Auth features will be disabled.', error);
  }
}

// Export for service access (may be null if not configured)
export { app as firebaseApp, auth, db, storage };

/**
 * Check if Firebase is available
 */
export function isFirebaseAvailable(): boolean {
  return app !== null && auth !== null && db !== null;
}
