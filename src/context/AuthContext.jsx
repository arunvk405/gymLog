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

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Handle credential returned from Google redirect flow
        getRedirectResult(auth)
            .then((result) => {
                if (result?.user) {
                    setUser(result.user);
                }
            })
            .catch((error) => {
                console.error("Firebase getRedirectResult error:", error);
            });

        const unsubscribe = onAuthStateChanged(auth, (authUser) => {
            setUser(authUser);
            setLoading(false);
        });

        return unsubscribe;
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


