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

    const toggleSavedItem = async (itemType, itemId) => {
        if (!user?.uid || !itemId) {
            throw new Error('You must be logged in to save items.');
        }

        const fields = itemType === 'question'
            ? ['savedQuestions', 'savedQuestionIds', 'savedQuestionPdfs']
            : ['savedBooks', 'savedBookIds'];
        const currentSavedItems = [
            ...new Set(fields.flatMap((savedField) => Array.isArray(user[savedField]) ? user[savedField] : []))
        ];
        const isSaved = currentSavedItems.includes(itemId);
        const nextSavedItems = isSaved
            ? currentSavedItems.filter((savedId) => savedId !== itemId)
            : [...currentSavedItems, itemId];
        const savedItemUpdates = fields.reduce((updates, savedField) => ({
            ...updates,
            [savedField]: nextSavedItems
        }), {});

        setUser((currentUser) => ({
            ...currentUser,
            ...savedItemUpdates
        }));

        try {
            await setDoc(doc(db, "users", user.uid), savedItemUpdates, { merge: true });
        } catch (error) {
            const previousSavedItemUpdates = fields.reduce((updates, savedField) => ({
                ...updates,
                [savedField]: currentSavedItems
            }), {});
            setUser((currentUser) => ({
                ...currentUser,
                ...previousSavedItemUpdates
            }));
            throw error;
        }
    };

    const updateUsername = async (newUsername) => {
        if (!user?.uid) throw new Error('Not authenticated.');
        const trimmed = newUsername.trim();
        await setDoc(doc(db, 'users', user.uid), { username: trimmed }, { merge: true });
        setUser((current) => ({ ...current, username: trimmed }));
    };

    const logout = () => {
        return signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, checkAccountExists, toggleSavedItem, updateUsername }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
