import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';

// ─── CONFIGURATION ────────────────────────────────────────────────────────────
// Remplissez ces valeurs depuis votre projet Firebase :
// https://console.firebase.google.com → Project settings → Your apps → Web app
// Créez un fichier .env.local avec les variables ci-dessous (voir .env.local.example)

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// Détecte si Firebase est configuré
export const FIREBASE_CONFIGURED = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
);

const app  = FIREBASE_CONFIGURED ? initializeApp(firebaseConfig) : null;
export const auth          = FIREBASE_CONFIGURED ? getAuth(app) : null;
export const googleProvider = FIREBASE_CONFIGURED ? new GoogleAuthProvider() : null;
export const githubProvider = FIREBASE_CONFIGURED ? (() => {
  const p = new GithubAuthProvider();
  p.addScope('read:user');
  return p;
})() : null;
