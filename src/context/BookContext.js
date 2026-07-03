import React, { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';

const BookContext = createContext();

export const BookProvider = ({ children }) => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch Books from Firestore
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'books'), (snapshot) => {
            const booksData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setBooks(booksData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching books:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const addBook = async (newBook) => {
        try {
            await addDoc(collection(db, 'books'), newBook);
        } catch (error) {
            console.error("Error adding book:", error);
            throw error;
        }
    };

    const removeBook = async (id) => {
        try {
            await deleteDoc(doc(db, 'books', id));
        } catch (error) {
            console.error("Error deleting book:", error);
        }
    };

    const updateBook = async (id, updates) => {
        try {
            await updateDoc(doc(db, 'books', id), updates);
        } catch (error) {
            console.error("Error updating book:", error);
            throw error;
        }
    };

    const addProgrammingSolution = async (bookId, solution) => {
        try {
            const book = books.find(b => b.id === bookId);

            // Migrate legacy single-solution field into the array so it isn't lost
            let existing = [];
            if (Array.isArray(book?.programmingSolutions) && book.programmingSolutions.length > 0) {
                existing = book.programmingSolutions;
            } else if (book?.programmingSolution && Object.keys(book.programmingSolution).length > 0) {
                existing = [{ ...book.programmingSolution, id: 'legacy' }];
            }

            const newSolution = { ...solution, id: `sol-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` };
            await updateDoc(doc(db, 'books', bookId), {
                hasProgrammingSolution: true,
                programmingSolutions: [...existing, newSolution]
            });
            return newSolution.id;
        } catch (error) {
            console.error("Error adding programming solution:", error);
            throw error;
        }
    };

    const updateProgrammingSolution = async (bookId, solutionId, updates) => {
        try {
            const book = books.find(b => b.id === bookId);
            const existing = book?.programmingSolutions || [];
            const updated = existing.map(s => s.id === solutionId ? { ...s, ...updates } : s);
            await updateDoc(doc(db, 'books', bookId), { programmingSolutions: updated });
        } catch (error) {
            console.error("Error updating programming solution:", error);
            throw error;
        }
    };

    const deleteProgrammingSolution = async (bookId, solutionId) => {
        try {
            const book = books.find(b => b.id === bookId);
            const existing = book?.programmingSolutions || [];
            const updated = existing.filter(s => s.id !== solutionId);
            await updateDoc(doc(db, 'books', bookId), {
                programmingSolutions: updated,
                hasProgrammingSolution: updated.length > 0
            });
        } catch (error) {
            console.error("Error deleting programming solution:", error);
            throw error;
        }
    };

    const getBooksBySection = (sectionName) => {
        if (!sectionName) return books;
        return books.filter(book => book.sections && book.sections.includes(sectionName));
    };

    const getBooksByCategory = (category) => {
        if (!category) return [];
        return books.filter(book => book.category === category);
    };

    return (
        <BookContext.Provider value={{ books, addBook, removeBook, updateBook, addProgrammingSolution, updateProgrammingSolution, deleteProgrammingSolution, getBooksBySection, getBooksByCategory, loading }}>
            {children}
        </BookContext.Provider>
    );
};

export const useBooks = () => useContext(BookContext);
