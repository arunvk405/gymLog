import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    signOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const AuthContext = createContext();

// Race getRedirectResult against a short timeout.
// On a normal boot the user is already logged in — Firebase resolves onAuthStateChanged
// from the IndexedDB cache in <500 ms, so we don't need to wait for getRedirectResult.
// On a real post-redirect boot the result resolves in <1 s so the timeout never fires.
const redirectPromise = Promise.race([
    getRedirectResult(auth).catch((error) => {
        console.error("Redirect result error:", error?.code, error?.message);
        return null;
    }),
    new Promise((resolve) => setTimeout(() => resolve(null), 3000)) // 3 s safety timeout
]);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        // onAuthStateChanged resolves from IndexedDB cache almost instantly.
        // Set loading=false as soon as we have a definitive auth state — don't
        // wait for the redirect promise on normal boots.
        const unsubscribe = onAuthStateChanged(auth, (authUser) => {
            if (isMounted) {
                setUser(authUser);
                setLoading(false);
            }
        });

        // Also check redirect result in case we just came back from Google sign-in.
        // If it resolves after onAuthStateChanged already fired, it will update the
        // user state — but it no longer gates the loading spinner.
        redirectPromise.then((result) => {
            if (isMounted && result?.user) {
                setUser(result.user);
            }
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, []);

    const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
    const signup = (email, password) => createUserWithEmailAndPassword(auth, email, password);
    const logout = () => signOut(auth);

    const loginWithGoogle = async () => {
        const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent || '');
        const isStandalone = (typeof window !== 'undefined' && (
            window.navigator.standalone === true ||
            (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
        ));

        // Use redirect on iOS / Standalone PWA where popups cannot share opener storage
        if (isStandalone || isIOS) {
            return signInWithRedirect(auth, googleProvider);
        }

        try {
            return await signInWithPopup(auth, googleProvider);
        } catch (err) {
            console.error("Google Popup Error, attempting redirect fallback:", err);
            if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
                return signInWithRedirect(auth, googleProvider);
            }
            throw err;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, loginWithGoogle }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};


