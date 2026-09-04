import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    signOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    setPersistence,
    browserLocalPersistence
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [redirectError, setRedirectError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        let authResolved = false;
        let redirectResolved = false;

        const maybeFinishLoading = () => {
            if (authResolved && redirectResolved && isMounted) {
                setLoading(false);
            }
        };

        // Ensure persistence is set to browser local storage
        setPersistence(auth, browserLocalPersistence).catch(err => {
            console.warn("Persistence setting notice:", err);
        });

        // 1. Process any pending redirect results (from mobile or fallback redirects)
        getRedirectResult(auth)
            .then((result) => {
                if (result?.user && isMounted) {
                    setUser(result.user);
                }
            })
            .catch((err) => {
                console.error("Firebase Redirect Login Error:", err);
                if (isMounted) {
                    setRedirectError(err);
                }
            })
            .finally(() => {
                redirectResolved = true;
                maybeFinishLoading();
            });

        // 2. Listen to active auth state
        const unsubscribe = onAuthStateChanged(auth, (authUser) => {
            if (isMounted) {
                if (authUser) {
                    setUser(authUser);
                } else {
                    setUser(prev => prev || null);
                }
                authResolved = true;
                maybeFinishLoading();
            }
        });

        // Failsafe timer so loading is never stuck indefinitely on slow mobile networks
        const failsafe = setTimeout(() => {
            if (isMounted) {
                authResolved = true;
                redirectResolved = true;
                maybeFinishLoading();
            }
        }, 3500);

        return () => {
            isMounted = false;
            clearTimeout(failsafe);
            unsubscribe();
        };
    }, []);

    const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
    const signup = (email, password) => createUserWithEmailAndPassword(auth, email, password);
    const logout = () => signOut(auth);

    const loginWithGoogle = async () => {
        try {
            return await signInWithPopup(auth, googleProvider);
        } catch (err) {
            console.error("Google Sign-In Error:", err);
            // If popup was explicitly blocked by mobile browser popup blocker, fallback to redirect
            if (err.code === 'auth/popup-blocked') {
                console.log("Popup blocked by browser, attempting redirect...");
                return signInWithRedirect(auth, googleProvider);
            }
            throw err;
        }
    };

    const loginWithGoogleRedirect = () => signInWithRedirect(auth, googleProvider);

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, loginWithGoogle, loginWithGoogleRedirect, redirectError }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);


