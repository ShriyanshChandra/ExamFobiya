import React from 'react';
import { Link } from 'react-router-dom';
import { useBooks } from '../context/BookContext';
import BookCard from './BookCard';
import './BookCategorySection.css';

const BookCategorySection = ({ title, section, category, limit }) => {
    const { getBooksBySection } = useBooks();
    const sectionBooks = getBooksBySection(section);
    // Filter by category to ensure no cross-category books appear due to stale section tags
    const books = category ? sectionBooks.filter(book => book.category === category) : sectionBooks;
    const hasOverflow = typeof limit === 'number' && books.length > limit;
    const visibleBooks = books;

    return (
        <section className="book-category-section container">
            <div className="section-icon-bg">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            </div>
            <div className="section-header">
                <div>
                    <span className="section-kicker">Course spotlight</span>
                    <h2 data-section={section}>{title}</h2>
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
