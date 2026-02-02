import React, { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';

const QuestionContext = createContext();

// Mock data to seed if database is empty - Plain text format for space efficiency
const MOCK_QUESTIONS = [
    // BCA
    {
        course: "BCA",
        subject: "Computer Fundamental and MS-Office",
        university: "University 1",
        year: 2023,
        tags: ["#ComputerFundamental", "#MSOFFICE"],
        question: "What is a Computer? Explain its block diagram.",
        answer: "A computer is an electronic device that processes data according to instructions. Its block diagram includes: Input Unit, CPU (Control Unit + ALU), Memory Unit, and Output Unit."
    },
    {
        course: "BCA",
        subject: "Computer Fundamental and MS-Office",
        university: "University 1",
        year: 2023,
        tags: ["#ComputerFundamental", "#MSOFFICE"],
        question: "Explain valid and invalid variable names in C.",
        answer: "Valid variable names must start with a letter or underscore, can contain letters, digits, and underscores. Invalid names start with digits, contain special characters, or use reserved keywords."
    },
    {
        course: "BCA",
        subject: "AI and Expert System",
        university: "University 2",
        year: 2023,
        tags: ["#AI", "#ExpertSystem"],
        question: "Define Artificial Intelligence.",
        answer: "Artificial Intelligence (AI) is the simulation of human intelligence in machines programmed to think and learn like humans, performing tasks that typically require human intelligence."
    },
    {
        course: "BCA",
        subject: "AI and Expert System",
        university: "University 2",
        year: 2023,
        tags: ["#AI", "#SearchTechniques"],
        question: "Explain various search techniques.",
        answer: "Search techniques in AI include: Breadth-First Search (BFS), Depth-First Search (DFS), Uniform Cost Search, A* Search, and Heuristic Search methods."
    },
    // DCA
    {
        course: "DCA",
        subject: "Programming in C",
        university: "University 2",
        year: 2023,
        tags: ["#C", "#DataTypes"],
        question: "Explain Data Types in C.",
        answer: "C data types include: int (integers), float (floating-point), double (double precision), char (characters), and void. Each has different size and range."
    },
    {
        course: "DCA",
        subject: "Internet and Web Technology",
        university: "University 1",
        year: 2023,
        tags: ["#HTML", "#WebTech"],
        question: "What is HTML? Explain its structure.",
        answer: "HTML (HyperText Markup Language) is the standard markup language for web pages. Its structure includes: <!DOCTYPE>, <html>, <head>, and <body> elements."
    },
    // PGDCA
    {
        course: "PGDCA",
        subject: "Fundamental of Computer and Information Technology",
        university: "University 1",
        year: 2023,
        tags: ["#Computer", "#Generations"],
        question: "Explain Generations of Computer.",
        answer: "Computer generations: 1st (Vacuum Tubes, 1940-56), 2nd (Transistors, 1956-63), 3rd (ICs, 1964-71), 4th (Microprocessors, 1971-present), 5th (AI, present-future)."
    },
    {
        course: "PGDCA",
        subject: "Relational Database Management System",
        university: "University 1",
        year: 2022,
        tags: ["#DBMS", "#Database"],
        question: "What is DBMS?",
        answer: "DBMS (Database Management System) is software that manages databases. It provides an interface for users to create, read, update, and delete data while ensuring data security and integrity."
    }
];

export const QuestionProvider = ({ children }) => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'questions'), (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            if (data.length === 0) {
                seedQuestions();
            } else {
                setQuestions(data);
                setLoading(false);
            }
        }, (error) => {
            console.error("Error fetching questions:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const seedQuestions = async () => {
        console.log("Seeding Questions Database...");
        const batch = writeBatch(db);
        MOCK_QUESTIONS.forEach(q => {
            const docRef = doc(collection(db, "questions"));
            batch.set(docRef, q);
        });

        try {
            await batch.commit();
            console.log("Questions seeded successfully!");
        } catch (error) {
            console.error("Error seeding questions:", error);
        }
    };

    const addQuestion = async (newQuestion) => {
        try {
            await addDoc(collection(db, 'questions'), newQuestion);
        } catch (error) {
            console.error("Error adding question:", error);
            throw error;
        }
    };

    const updateQuestion = async (id, updates) => {
        try {
            await updateDoc(doc(db, 'questions', id), updates);
        } catch (error) {
            console.error("Error updating question:", error);
        }
    };

    const deleteQuestion = async (id) => {
        try {
            await deleteDoc(doc(db, 'questions', id));
        } catch (error) {
            console.error("Error deleting question:", error);
        }
    };

    return (
        <QuestionContext.Provider value={{ questions, addQuestion, updateQuestion, deleteQuestion, loading }}>
            {children}
        </QuestionContext.Provider>
    );
};

export const useQuestions = () => useContext(QuestionContext);
