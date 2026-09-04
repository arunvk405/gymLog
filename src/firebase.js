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

const isLocal = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.'));

const customAuthDomain = (typeof window !== 'undefined' && window.location.hostname && !isLocal)
    ? window.location.hostname
    : "gymlog-app-83f7f.firebaseapp.com";

const firebaseConfig = {
    apiKey: "AIzaSyDsUw2gtGWv2gb0aVTLCqAvs176UeyvPSQ",
    authDomain: customAuthDomain,
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
