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
        // Handle redirect result if user returned from Google redirect flow
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
        const isStandalone = window.navigator.standalone === true ||
            (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);

        if (isStandalone) {
            return signInWithRedirect(auth, googleProvider);
        }

        try {
            return await signInWithPopup(auth, googleProvider);
        } catch (err) {
            if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
                return signInWithRedirect(auth, googleProvider);
            }
            throw err;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, loginWithGoogle }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
