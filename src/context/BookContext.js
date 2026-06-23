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
            alert("Failed to add book. check console.");
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
        <BookContext.Provider value={{ books, addBook, removeBook, updateBook, getBooksBySection, getBooksByCategory, loading }}>
            {children}
        </BookContext.Provider>
    );
};

export const useBooks = () => useContext(BookContext);
