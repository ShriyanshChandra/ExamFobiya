import React, { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../firebase';
import { collection, collectionGroup, onSnapshot, addDoc, deleteDoc, doc, updateDoc, writeBatch, setDoc, getDocs } from 'firebase/firestore';

const QuestionContext = createContext();

export const QuestionProvider = ({ children }) => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    // Subjects and Universities will likely be fetched on demand or derived, 
    // but for now we can keep global lists or refetch based on course.
    // However, with nested structure, watching ALL subjects globally might be expensive if scaled.
    // We will stick to watching "universities" globally as it's a flat list.
    const [universities, setUniversities] = useState([]);

    useEffect(() => {
        // 1. Fetch ALL questions using collectionGroup
        // This effectively flattens the nested structure for display
        const unsubscribeQuestions = onSnapshot(collectionGroup(db, 'questions'), (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // We might want to store the parent reference path for easy updates
                parentPath: doc.ref.parent.path
            }));

            if (data.length === 0) {
                // seeding logic might need adjustment for nested, skipping auto-seed for now to avoid mess
            } else {
                setQuestions(data);
            }
        }, (error) => {
            console.error("Error fetching questions:", error);
        });

        const unsubscribeUniversities = onSnapshot(collection(db, 'universities'), (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUniversities(data);
        });

        setLoading(false);

        return () => {
            unsubscribeQuestions();
            unsubscribeUniversities();
        };
    }, []);

    // Helper to add question to nested path
    // Path: courses/{course}/subjects/{subject}/questions
    const addQuestion = async (newQuestion) => {
        const { course, subject } = newQuestion;
        if (!course || !subject) throw new Error("Course and Subject required for nested storage");

        try {
            // Reference to the specific subject's question subcollection
            const questionsRef = collection(db, 'courses', course, 'subjects', subject, 'questions');
            await addDoc(questionsRef, newQuestion);
        } catch (error) {
            console.error("Error adding question:", error);
            throw error;
        }
    };

    // Helper for updating question (needs knowledge of its path or ID if unique enough)
    // collectionGroup IDs are unique, but to update we need full path if we use updateDoc with a specific reference.
    // Fortunately, if we have the question object from our state, we can easily find it?
    // Actually, `updateDoc` needs a `DocumentReference`.
    // If we only have ID, we can't easily find the parent without searching or storing the path.
    // Solution: We stored `parentPath` in the state above.
    const updateQuestion = async (id, updates, parentPath) => {
        try {
            if (!parentPath) {
                // Fallback: try to find it (expensive) or assume flat? 
                // For now, let's assume valid parentPath passed from UI
                console.error("Update requires parentPath for nested docs");
                return;
            }
            // Construct full path: parentPath + "/" + id
            const docRef = doc(db, parentPath, id);
            // OR if parentPath is like "courses/BCA/subjects/Maths/questions"
            await updateDoc(docRef, updates);
        } catch (error) {
            console.error("Error updating question:", error);
        }
    };

    const deleteQuestion = async (id, parentPath) => {
        try {
            if (!parentPath) {
                console.error("Delete requires parentPath for nested docs");
                return;
            }
            const docRef = doc(db, parentPath, id);
            await deleteDoc(docRef);
        } catch (error) {
            console.error("Error deleting question:", error);
        }
    };

    // Subject Management (Nested)
    // Add Subject: courses/{course}/subjects/{name}
    const addSubject = async (subjectData) => {
        // subjectData: { name: string, course: string }
        const { name, course } = subjectData;
        try {
            // Use 'name' as ID for easier uniqueness check or random ID?
            // User wants "Subjects" collection.
            // Let's use the name as ID to enforce uniqueness within the course easily
            const subjectDocRef = doc(db, 'courses', course, 'subjects', name);
            // We can store metadata if needed, or just an empty doc if it's just a container
            await setDoc(subjectDocRef, { name, course });
        } catch (error) {
            console.error("Error adding subject:", error);
            throw error;
        }
    };

    // Cascading Delete Subject
    const deleteSubject = async (course, subjectName) => {
        try {
            // 1. Get all questions in this subject
            const questionsRef = collection(db, 'courses', course, 'subjects', subjectName, 'questions');
            const snapshot = await getDocs(questionsRef);

            // 2. Delete all questions (Batching is best for < 500)
            const batch = writeBatch(db);
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });

            // 3. Delete the subject document itself
            const subjectDocRef = doc(db, 'courses', course, 'subjects', subjectName);
            batch.delete(subjectDocRef);

            await batch.commit();
        } catch (error) {
            console.error("Error deleting subject:", error);
            throw error;
        }
    };

    const addUniversity = async (universityData) => {
        try {
            await addDoc(collection(db, 'universities'), universityData);
        } catch (error) {
            console.error("Error adding university:", error);
            throw error;
        }
    };

    const deleteUniversity = async (id) => {
        try {
            await deleteDoc(doc(db, 'universities', id));
        } catch (error) {
            console.error("Error deleting university:", error);
            throw error;
        }
    };

    // Helper to get subjects (snapshot listener for specific course dropdown?)
    // Or just a one-time fetch helper
    // Helper to get subjects
    const getSubjects = (course) => {
        return collection(db, 'courses', course, 'subjects');
    }

    return (
        <QuestionContext.Provider value={{
            questions,
            universities,
            addQuestion,
            updateQuestion,
            deleteQuestion,
            addSubject,
            deleteSubject,
            addUniversity,
            deleteUniversity,
            loading,
            getSubjects // Export helper to fetch subcollections
        }}>
            {children}
        </QuestionContext.Provider>
    );
};

export const useQuestions = () => useContext(QuestionContext);
