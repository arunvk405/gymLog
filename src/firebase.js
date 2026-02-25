import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDsUw2gtGWv2gb0aVTLCqAvs176UeyvPSQ",
    authDomain: "gymlog-app-83f7f.firebaseapp.com",
    projectId: "gymlog-app-83f7f",
    storageBucket: "gymlog-app-83f7f.firebasestorage.app",
    messagingSenderId: "618525799175",
    appId: "1:618525799175:web:9ac5765ebb6cccd339cba2"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export const googleProvider = new GoogleAuthProvider();
