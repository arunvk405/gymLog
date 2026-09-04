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

// Immediately invoke getRedirectResult on app boot to capture redirect state before storage changes
const redirectPromise = getRedirectResult(auth).catch((error) => {
    console.error("Redirect result error:", error?.code, error?.message);
    return null;
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        // Check if returning from a redirect
        redirectPromise.then((result) => {
            if (isMounted && result?.user) {
                setUser(result.user);
                setLoading(false);
            }
        });

        // Listen for standard auth state changes
        const unsubscribe = onAuthStateChanged(auth, (authUser) => {
            if (isMounted) {
                setUser(authUser);
                setLoading(false);
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


