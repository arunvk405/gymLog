import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    signOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (err) {
            console.error("Google Login Error:", err);
            if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
                return;
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


