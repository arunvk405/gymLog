import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
    initializeAuth,
    indexedDBLocalPersistence,
    browserLocalPersistence,
    browserPopupRedirectResolver,
    GoogleAuthProvider,
    getAuth
} from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Use the site's own hostname as authDomain in production so the OAuth redirect
// goes through our Netlify proxy (/__/auth/*) and is treated as first-party by
// iOS Safari. Falls back to Firebase's default on localhost so dev login works.
const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
const isLocalDev = hostname === 'localhost' || hostname === '127.0.0.1';

const firebaseConfig = {
    apiKey: "AIzaSyDsUw2gtGWv2gb0aVTLCqAvs176UeyvPSQ",
    authDomain: isLocalDev ? "gymlog-app-83f7f.firebaseapp.com" : hostname,
    projectId: "gymlog-app-83f7f",
    storageBucket: "gymlog-app-83f7f.firebasestorage.app",
    messagingSenderId: "618525799175",
    appId: "1:618525799175:web:9ac5765ebb6cccd339cba2"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth with IndexedDB persistence to survive iOS standalone WebKit reloads
let authInstance;
try {
    authInstance = initializeAuth(app, {
        persistence: [indexedDBLocalPersistence, browserLocalPersistence],
        popupRedirectResolver: browserPopupRedirectResolver
    });
} catch (e) {
    authInstance = getAuth(app);
}

export const auth = authInstance;
export const db = getFirestore(app);
export const storage = getStorage(app);

export const googleProvider = new GoogleAuthProvider();
