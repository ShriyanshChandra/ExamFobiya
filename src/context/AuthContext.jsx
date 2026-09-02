import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db, googleProvider } from '../firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
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


    const updateUsername = async (newUsername) => {
        if (!user?.uid) throw new Error('Not authenticated.');
        const trimmed = newUsername.trim();
        await setDoc(doc(db, 'users', user.uid), { username: trimmed }, { merge: true });
        setUser((current) => ({ ...current, username: trimmed }));
    };

    const loginWithGoogle = async () => {
        let result;
        try {
            result = await signInWithPopup(auth, googleProvider);
        } catch (error) {
            // Popup closed by user or blocked — surface a clean error
            if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
                throw new Error('Sign-in cancelled. Please try again.');
            }
            if (error.code === 'auth/popup-blocked') {
                throw new Error('Popup was blocked by your browser. Please allow popups for this site and try again.');
            }
            if (error.code === 'auth/network-request-failed') {
                throw new Error('Network error. Please check your connection and try again.');
            }
            throw new Error(error.message.replace('Firebase: ', '') || 'Google sign-in failed. Please try again.');
        }

        const { user } = result;
        // Upsert Firestore user doc — preserves existing role if already set
        try {
            const userDocRef = doc(db, 'users', user.uid);
            const existingDoc = await getDoc(userDocRef);
            if (!existingDoc.exists()) {
                // New user — create doc with default role
                await setDoc(userDocRef, {
                    email: user.email,
                    username: user.displayName || user.email.split('@')[0],
                    photoURL: user.photoURL || '',
                    role: 'user',
                    createdAt: new Date(),
                    provider: 'google'
                });
            } else {
                // Returning user — just update photoURL/username if present
                await setDoc(userDocRef, {
                    photoURL: user.photoURL || existingDoc.data().photoURL || '',
                    username: existingDoc.data().username || user.displayName || user.email.split('@')[0]
                }, { merge: true });
            }
        } catch (firestoreError) {
            console.error('[AuthContext] Firestore upsert failed after Google sign-in:', firestoreError);
            // Don't block the user — auth succeeded even if Firestore fails
        }

        return result;
    };

    const logout = () => {
        return signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, checkAccountExists, updateUsername, loginWithGoogle }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
