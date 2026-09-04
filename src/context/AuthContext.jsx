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
    browserLocalPersistence,
    linkWithPopup,
    linkWithCredential,
    unlink,
    GoogleAuthProvider
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { toast } from 'react-hot-toast';

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
            if (err.code === 'auth/popup-blocked') {
                return signInWithRedirect(auth, googleProvider);
            }
            throw err;
        }
    };

    const linkGoogleAccount = async () => {
        if (!auth.currentUser) throw new Error("No active user to link");
        try {
            const res = await linkWithPopup(auth.currentUser, googleProvider);
            setUser({ ...auth.currentUser });
            toast.success("Google account connected!");
            return res;
        } catch (err) {
            console.error("Link Google error:", err);
            if (err.code === 'auth/credential-already-in-use') {
                toast.error("This Google account is already linked to another user.");
            } else {
                toast.error("Failed to link Google: " + err.message);
            }
            throw err;
        }
    };

    const loginWithGoogleRedirect = () => signInWithRedirect(auth, googleProvider);

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            signup,
            logout,
            loginWithGoogle,
            loginWithGoogleRedirect,
            linkGoogleAccount,
            redirectError
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);


