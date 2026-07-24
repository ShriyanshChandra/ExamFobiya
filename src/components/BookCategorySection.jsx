import React from 'react';
import { Link } from 'react-router-dom';
import { useBooks } from '../context/BookContext';
import BookCard from './BookCard';
import './BookCategorySection.css';

const BookCategorySection = ({ 
    title, 
    section, 
    category, 
    limit,
    kicker = "Course spotlight",
    linkText,
    icon,
    className = "book-category-section container"
}) => {
    const { getBooksBySection } = useBooks();
    const sectionBooks = getBooksBySection(section);
    // Filter by category to ensure no cross-category books appear due to stale section tags
    const books = category ? sectionBooks.filter(book => book.category === category) : sectionBooks;
    const hasOverflow = typeof limit === 'number' && books.length > limit;
    const visibleBooks = books;

    const defaultIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
    );

    const displayLinkText = linkText || (category ? `View ${category} books` : "View course books");

    const handleSectionMouseEnter = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
            const relX = e.clientX - rect.left;
            const relY = e.clientY - rect.top;

            const distLeft = relX;
            const distRight = rect.width - relX;
            const distTop = relY;
            const distBottom = rect.height - relY;

            const minDist = Math.min(distLeft, distRight, distTop, distBottom);

            let edgeX = (relX / rect.width) * 100;
            let edgeY = (relY / rect.height) * 100;

            if (minDist === distLeft) edgeX = 0;
            else if (minDist === distRight) edgeX = 100;
            else if (minDist === distTop) edgeY = 0;
            else if (minDist === distBottom) edgeY = 100;

            e.currentTarget.style.setProperty('--edge-x', `${edgeX}%`);
            e.currentTarget.style.setProperty('--edge-y', `${edgeY}%`);
        }
    };

    return (
        <section className={className} onMouseEnter={handleSectionMouseEnter}>
            <div className="section-icon-bg">
                {icon || defaultIcon}
            </div>
            <div className="section-header">
                <div>
                    <span className="section-kicker">{kicker}</span>
                    <h2 data-section={section}>{title}</h2>
                </div>
                <Link
                    to="/books"
                    state={category ? { category } : undefined}
                    className="browse-all-link"
                >
                    {displayLinkText}
                </Link>
            </div>
            {books.length === 0 ? (
                <p>No books available for {section} at the moment.</p>
            ) : (
                <div 
                    className={`book-grid home-book-shelf ${hasOverflow ? 'is-scrollable' : 'is-compact'}`}
                    style={{ '--shelf-count': visibleBooks.length }}
                >
                    {visibleBooks.map((book, index) => (
                        <BookCard key={book.id} book={book} index={index} />
                    ))}
                </div>
            )}
        </section>
    );
};

export default BookCategorySection;
