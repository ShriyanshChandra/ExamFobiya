import React, { createContext, useState, useContext, useEffect } from 'react';

const BookContext = createContext();

// Initial data from Books.js to bootstrap the app
const initialBooks = [
    {
        id: 1,
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        image: "https://m.media-amazon.com/images/I/81af+MCATTL.jpg",
        description: "A classic novel set in the Jazz Age exploring themes of wealth and identity.",
        contents: "Chapters include: The Party, Gatsby’s Dream, The Fall, The Green Light, and more.",
        sections: ["Best Seller"]
    },
    {
        id: 2,
        title: "Atomic Habits",
        author: "James Clear",
        image: "https://m.media-amazon.com/images/I/91bYsX41DVL.jpg",
        description: "A practical guide on how to form good habits, break bad ones, and master tiny behaviors.",
        contents: "Chapters: The Fundamentals, 1st Law, 2nd Law, 3rd Law, 4th Law.",
        sections: ["Best Seller"]
    },
    {
        id: 3,
        title: "Sapiens",
        author: "Yuval Noah Harari",
        image: "https://m.media-amazon.com/images/I/713jIoMO3UL.jpg",
        description: "A brief history of humankind, exploring evolution, culture, and society.",
        contents: "Sections: Cognitive Revolution, Agricultural Revolution, Scientific Revolution.",
        sections: ["Best Seller"]
    },
    {
        id: 4,
        title: "Rich Dad Poor Dad",
        author: "Robert T. Kiyosaki",
        image: "https://m.media-amazon.com/images/I/81bsw6fnUiL.jpg",
        description: "A personal finance classic teaching financial independence and investing.",
        contents: "Chapters: The Rich Don’t Work for Money, Mind Your Own Business, Work to Learn.",
        sections: ["Best Seller"]
    },
    {
        id: 5,
        title: "Ikigai",
        author: "Héctor García & Francesc Miralles",
        image: "https://m.media-amazon.com/images/I/81l3rZK4lnL.jpg",
        description: "The Japanese secret to a long and happy life.",
        contents: "Topics: The Power of Purpose, Flow, Resilience, Finding Your Ikigai.",
        sections: ["New Arrivals"]
    },
    {
        id: 6,
        title: "The Psychology of Money",
        author: "Morgan Housel",
        image: "https://m.media-amazon.com/images/I/71aG+xDKSYL.jpg",
        description: "Timeless lessons on wealth, greed, and happiness.",
        contents: "Stories about behavior, risk, luck, and compounding.",
        sections: ["Best Seller"]
    },
    {
        id: 7,
        title: "The Alchemist",
        author: "Paulo Coelho",
        image: "https://m.media-amazon.com/images/I/71aFt4+OTOL.jpg",
        description: "A story about following one’s dreams and listening to one’s heart.",
        contents: "Journey of Santiago, The Desert, The Alchemy, The Treasure.",
        sections: ["Best Seller"]
    },
    {
        id: 8,
        title: "Deep Work",
        author: "Cal Newport",
        image: "https://images-na.ssl-images-amazon.com/images/I/81q6ECxcifL.jpg",
        description: "Rules for focused success in a distracted world.",
        contents: "Sections: The Idea, The Rules, Focus Strategies, Implementation.",
        sections: ["New Arrivals"]
    },
    {
        id: 9,
        title: "The Subtle Art of Not Giving a F*ck",
        author: "Mark Manson",
        image: "https://m.media-amazon.com/images/I/71QKQ9mwV7L.jpg",
        description: "A counterintuitive approach to living a good life.",
        contents: "Chapters: Don't Try, Happiness is a Problem, You Are Not Special.",
        sections: ["New Arrivals"]
    },
    {
        id: 10,
        title: "Thinking, Fast and Slow",
        author: "Daniel Kahneman",
        image: "https://m.media-amazon.com/images/I/61fdrEuPJwL.jpg",
        description: "The two systems that drive the way we think.",
        contents: "Parts: Two Systems, Heuristics and Biases, Overconfidence, Choices.",
        sections: ["New Arrivals"]
    }
];

export const BookProvider = ({ children }) => {
    const [books, setBooks] = useState(() => {
        // Try to load from local storage first
        const savedBooks = localStorage.getItem('books');
        let parsedBooks = savedBooks ? JSON.parse(savedBooks) : initialBooks;

        // Data Migration: Ensure 'sections' array exists if only 'section' string is present
        parsedBooks = parsedBooks.map(book => {
            if (book.section && !book.sections) {
                return { ...book, sections: [book.section] };
            }
            return book;
        });

        return parsedBooks;
    });

    useEffect(() => {
        localStorage.setItem('books', JSON.stringify(books));
    }, [books]);

    const addBook = (newBook) => {
        setBooks(prevBooks => {
            const bookWithId = { ...newBook, id: Date.now() }; // Simple ID generation
            return [...prevBooks, bookWithId];
        });
    };

    const removeBook = (id) => {
        setBooks(prevBooks => prevBooks.filter(book => book.id !== id));
    };

    const updateBook = (id, updates) => {
        setBooks(prevBooks => prevBooks.map(book =>
            book.id === id ? { ...book, ...updates } : book
        ));
    };

    const getBooksBySection = (sectionName) => {
        // Return hooks belonging to a specific section (Best Seller, New Arrival, etc.)
        if (!sectionName) return books;
        return books.filter(book => book.sections && book.sections.includes(sectionName));
    };

    return (
        <BookContext.Provider value={{ books, addBook, removeBook, updateBook, getBooksBySection }}>
            {children}
        </BookContext.Provider>
    );
};

export const useBooks = () => useContext(BookContext);
