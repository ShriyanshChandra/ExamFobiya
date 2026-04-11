import { Link } from 'react-router-dom';
import { useBooks } from '../context/BookContext';
import BookCard from '../components/BookCard';
import './ExploreSection.css';

const ExploreSection = () => {
    const { books } = useBooks();
    const hasOverflow = books.length > 6;
    const visibleBooks = hasOverflow ? books : books.slice(0, 6);

    return (
        <section className="explore-section">
            <div className="section-header">
                <div>
                    <span className="section-kicker">Explore everything</span>
                    <h2>More books worth a look</h2>
                    <p className="section-subtitle">
                        A broader mix from across the library when visitors want to keep browsing after the highlights.
                    </p>
                </div>
                <Link to="/books" className="browse-all-link">View all books</Link>
            </div>
            <div className={`book-grid home-book-shelf ${hasOverflow ? 'is-scrollable' : 'is-compact'}`}>
                {visibleBooks.map((book, index) => (
                    <BookCard key={book.id} book={book} index={index} />
                ))}
            </div>
        </section>
    );
};

export default ExploreSection;
