import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getApiUrl } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (item) => {
            if (item) {
                // User is signed in, fetch additional data (role) from Firestore
                try {
                    const userDoc = await getDoc(doc(db, "users", item.uid));
                    if (userDoc.exists()) {
                        setUser({ ...item, ...userDoc.data() });
                    } else {
                        // User exists in Auth but not Firestore (e.g. created in Console)
                        // Create default user doc
                        await setDoc(doc(db, "users", item.uid), {
                            email: item.email,
                            role: 'user',
                            username: item.email.split('@')[0],
                            createdAt: new Date()
                        });
                        setUser({ ...item, role: 'user' });
                    }
                } catch (error) {
                    console.error("Error fetching/creating user data:", error);
                    setUser(item);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const checkAccountExists = async (email) => {
        const normalizedEmail = email.trim().toLowerCase();
        const response = await fetch(getApiUrl('/api/check-account-exists'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: normalizedEmail })
        });

        if (response.status === 404) {
            return false;
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to verify account.');
        }

        return true;
    };

    const register = async (email, password, role, username) => {
        const normalizedEmail = email.trim().toLowerCase();
        let result;

        try {
            result = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                throw new Error('Account already exists. Please login.');
            }

            throw error;
        }

        // Create user document with role
        await setDoc(doc(db, "users", result.user.uid), {
            email: normalizedEmail,
            role,
            username,
            createdAt: new Date()
        });
        return result;
    };

    const logout = () => {
        return signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, checkAccountExists }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
