import React from 'react';
import { useBooks } from '../context/BookContext';
import BookCard from './BookCard';
import './BookCategorySection.css';

const BookCategorySection = ({ title, section }) => {
    const { getBooksBySection } = useBooks(); // Use section filter
    const books = getBooksBySection(section);

    return (
        <section className="book-category-section">
            <h2 data-section={section}>{title}</h2>
            {books.length === 0 ? (
                <p>No books available for {section} at the moment.</p>
            ) : (
                <div className="book-grid">
                    {books.map((book, index) => (
                        <BookCard key={book.id} book={book} index={index} />
                    ))}
                </div>
            )}
        </section>
    );
};

export default BookCategorySection;
