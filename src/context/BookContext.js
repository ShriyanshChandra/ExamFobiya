import React, { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';

const BookContext = createContext();

// Initial data to see the database if empty
const initialBooks = [
    {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        image: "https://m.media-amazon.com/images/I/81af+MCATTL.jpg",
        description: "A classic novel set in the Jazz Age exploring themes of wealth and identity.",
        contents: "Chapters include: The Party, Gatsby’s Dream, The Fall, The Green Light, and more.",
        sections: ["Best Seller"]
    },
    {
        title: "Atomic Habits",
        author: "James Clear",
        image: "https://m.media-amazon.com/images/I/91bYsX41DVL.jpg",
        description: "A practical guide on how to form good habits, break bad ones, and master tiny behaviors.",
        contents: "Chapters: The Fundamentals, 1st Law, 2nd Law, 3rd Law, 4th Law.",
        sections: ["Best Seller"]
    },
    {
        title: "Sapiens",
        author: "Yuval Noah Harari",
        image: "https://m.media-amazon.com/images/I/713jIoMO3UL.jpg",
        description: "A brief history of humankind, exploring evolution, culture, and society.",
        contents: "Sections: Cognitive Revolution, Agricultural Revolution, Scientific Revolution.",
        sections: ["Best Seller"]
    },
    {
        title: "Rich Dad Poor Dad",
        author: "Robert T. Kiyosaki",
        image: "https://m.media-amazon.com/images/I/81bsw6fnUiL.jpg",
        description: "A personal finance classic teaching financial independence and investing.",
        contents: "Chapters: The Rich Don’t Work for Money, Mind Your Own Business, Work to Learn.",
        sections: ["Best Seller"]
    },
    {
        title: "Ikigai",
        author: "Héctor García & Francesc Miralles",
        image: "https://m.media-amazon.com/images/I/81l3rZK4lnL.jpg",
        description: "The Japanese secret to a long and happy life.",
        contents: "Topics: The Power of Purpose, Flow, Resilience, Finding Your Ikigai.",
        sections: ["New Arrivals"]
    },
    {
        title: "The Psychology of Money",
        author: "Morgan Housel",
        image: "https://m.media-amazon.com/images/I/71aG+xDKSYL.jpg",
        description: "Timeless lessons on wealth, greed, and happiness.",
        contents: "Stories about behavior, risk, luck, and compounding.",
        sections: ["Best Seller"]
    },
    {
        title: "The Alchemist",
        author: "Paulo Coelho",
        image: "https://m.media-amazon.com/images/I/71aFt4+OTOL.jpg",
        description: "A story about following one’s dreams and listening to one’s heart.",
        contents: "Journey of Santiago, The Desert, The Alchemy, The Treasure.",
        sections: ["Best Seller"]
    },
    {
        title: "Deep Work",
        author: "Cal Newport",
        image: "https://images-na.ssl-images-amazon.com/images/I/81q6ECxcifL.jpg",
        description: "Rules for focused success in a distracted world.",
        contents: "Sections: The Idea, The Rules, Focus Strategies, Implementation.",
        sections: ["New Arrivals"]
    },
    {
        title: "The Subtle Art of Not Giving a F*ck",
        author: "Mark Manson",
        image: "https://m.media-amazon.com/images/I/71QKQ9mwV7L.jpg",
        description: "A counterintuitive approach to living a good life.",
        contents: "Chapters: Don't Try, Happiness is a Problem, You Are Not Special.",
        sections: ["New Arrivals"]
    },
    {
        title: "Thinking, Fast and Slow",
        author: "Daniel Kahneman",
        image: "https://m.media-amazon.com/images/I/61fdrEuPJwL.jpg",
        description: "The two systems that drive the way we think.",
        contents: "Parts: Two Systems, Heuristics and Biases, Overconfidence, Choices.",
        sections: ["New Arrivals"]
    }
];

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

            // Auto-Seed if empty
            if (booksData.length === 0) { // Removed localStorage check
                seedDatabase();
            } else {
                setBooks(booksData);
                setLoading(false);
            }
        }, (error) => {
            console.error("Error fetching books:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const seedDatabase = async () => {
        console.log("Seeding Database...");
        const batch = writeBatch(db);
        initialBooks.forEach(book => {
            const docRef = doc(collection(db, "books"));
            batch.set(docRef, book);
        });

        try {
            await batch.commit();
            console.log("Database seeded successfully!");
            // Removed localStorage.setItem('booksSeeded', 'true');
        } catch (error) {
            console.error("Error seeding database:", error);
        }
    };

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
