import React, { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';

const QuestionContext = createContext();

// Mock data to seed if database is empty
const MOCK_QUESTIONS = [
    // BCA
    {
        course: "BCA",
        semester: "1",
        subject: "Computer Fundamental and MS-Office",
        university: "University 1",
        year: "2023",
        title: "BCA 1st Sem CF & MS-Office 2023",
        questions: [
            "Q1. What is a Computer? Explain its block diagram.",
            "Q2. Explain valid and invalid variable names in C.",
            "Q3. What is an Operating System? Explain its types.",
            "Q4. Explain the difference between Compiler and Interpreter.",
            "Q5. Write a short note on MS-Word."
        ]
    },
    {
        course: "BCA",
        semester: "5",
        subject: "AI and Expert System",
        university: "University 2",
        year: "2023",
        title: "BCA 5th Sem AI 2023",
        questions: [
            "Q1. Define Artificial Intelligence.",
            "Q2. Explain various search techniques.",
            "Q3. What is an Expert System?",
            "Q4. Explain Neural Networks.",
            "Q5. Write a note on Fuzzy Logic."
        ]
    },
    {
        course: "BCA",
        semester: "6",
        subject: "Computer Security and Cyber Law",
        university: "University 1",
        year: "2022",
        title: "BCA 6th Sem Cyber Law 2022",
        questions: [
            "Q1. What is Cyber Crime?",
            "Q2. Explain Digital Signature.",
            "Q3. What is a Virus? Explain its types.",
            "Q4. Explain IT Act 2000.",
            "Q5. Write a note on Firewall."
        ]
    },
    // DCA
    {
        course: "DCA",
        semester: "1",
        subject: "Programming in C",
        university: "University 2",
        year: "2023",
        title: "DCA 1st Sem C Prog 2023",
        questions: [
            "Q1. Explain Data Types in C.",
            "Q2. Write a program to find the factorial of a number.",
            "Q3. Explain Loops in C.",
            "Q4. What is a Pointer?",
            "Q5. Explain File Handling in C."
        ]
    },
    {
        course: "DCA",
        semester: "2",
        subject: "Internet and Web Technology",
        university: "University 1",
        year: "2023",
        title: "DCA 2nd Sem Web Tech 2023",
        questions: [
            "Q1. What is HTML? Explain its structure.",
            "Q2. Explain CSS and its types.",
            "Q3. What is JavaScript?",
            "Q4. Explain Forms in HTML.",
            "Q5. Write a note on Web Hosting."
        ]
    },
    {
        course: "DCA",
        semester: "2",
        subject: "Print Technology and Desktop Publishing",
        university: "University 2",
        year: "2022",
        title: "DCA 2nd Sem DTP 2022",
        questions: [
            "Q1. What is DTP?",
            "Q2. Explain Offset Printing.",
            "Q3. What is PageMaker?",
            "Q4. Explain CorelDraw tools.",
            "Q5. Write a note on Photoshop."
        ]
    },
    // PGDCA
    {
        course: "PGDCA",
        semester: "1",
        subject: "Fundamental of Computer and Information Technology",
        university: "University 1",
        year: "2023",
        title: "PGDCA 1st Sem FCIT 2023",
        questions: [
            "Q1. Explain Generations of Computer.",
            "Q2. What is Memory? Explain its types.",
            "Q3. Explain Input and Output Devices.",
            "Q4. What is Software? Explain its types.",
            "Q5. Write a note on Internet."
        ]
    },
    {
        course: "PGDCA",
        semester: "2",
        subject: "System Analysis and Design",
        university: "University 2",
        year: "2023",
        title: "PGDCA 2nd Sem SAD 2023",
        questions: [
            "Q1. What is SDLC?",
            "Q2. Explain Feasibility Study.",
            "Q3. What is DFD?",
            "Q4. Explain Testing.",
            "Q5. Write a note on Implementation."
        ]
    },
    {
        course: "PGDCA",
        semester: "2",
        subject: "Relational Database Management System",
        university: "University 1",
        year: "2022",
        title: "PGDCA 2nd Sem RDBMS 2022",
        questions: [
            "Q1. What is DBMS?",
            "Q2. Explain Normalization.",
            "Q3. What is SQL?",
            "Q4. Explain ER Diagram.",
            "Q5. Write a note on Keys in DBMS."
        ]
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
