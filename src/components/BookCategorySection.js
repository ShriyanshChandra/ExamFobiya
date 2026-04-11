import React from 'react';
import { Link } from 'react-router-dom';
import { useBooks } from '../context/BookContext';
import BookCard from './BookCard';
import './BookCategorySection.css';

const BookCategorySection = ({ title, section, category, limit }) => {
    const { getBooksBySection } = useBooks();
    const books = getBooksBySection(section);
    const hasOverflow = typeof limit === 'number' && books.length > limit;
    const visibleBooks = hasOverflow
        ? books
        : typeof limit === 'number'
            ? books.slice(0, limit)
            : books;

    return (
        <section className="book-category-section">
            <div className="section-header">
                <div>
                    <span className="section-kicker">Course spotlight</span>
                    <h2 data-section={section}>{title}</h2>
                    <p className="section-subtitle">
                        Quick picks from this course collection so visitors can scan the right shelf faster.
                    </p>
                </div>
                <Link
                    to="/books"
                    state={category ? { category } : undefined}
                    className="browse-all-link"
                >
                    View {category || "course"} books
                </Link>
            </div>
            {books.length === 0 ? (
                <p>No books available for {section} at the moment.</p>
            ) : (
                <div className={`book-grid home-book-shelf ${hasOverflow ? 'is-scrollable' : 'is-compact'}`}>
                    {visibleBooks.map((book, index) => (
                        <BookCard key={book.id} book={book} index={index} />
                    ))}
                </div>
            )}
        </section>
    );
};

export default BookCategorySection;
