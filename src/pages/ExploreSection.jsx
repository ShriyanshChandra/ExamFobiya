import { Link } from 'react-router-dom';
import { useBooks } from '../context/BookContext';
import BookCard from '../components/BookCard';
import './ExploreSection.css';

const ExploreSection = () => {
    const { books } = useBooks();
    const visibleBooks = books.slice(0, 5);

    return (
        <section className="explore-section container">
            <div className="section-icon-bg">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
            </div>
            <div className="section-header">
                <div>
                    <span className="section-kicker">Explore everything</span>
                    <h2>More books worth a look</h2>
                </div>
                <Link to="/books" className="browse-all-link">View all books</Link>
            </div>
            <div className="book-grid home-book-shelf is-compact">
                {visibleBooks.map((book, index) => (
                    <BookCard key={book.id} book={book} index={index} />
                ))}
            </div>
        </section>
    );
};

export default ExploreSection;
