import { Link } from 'react-router-dom';
import { useBooks } from '../context/BookContext';
import BookCard from '../components/BookCard';
import './ExploreSection.css';

const ExploreSection = () => {
    const { books } = useBooks();

    return (
        <section className="explore-section">
            <h2>Explore Books</h2>
            <div className="book-grid">
                {books.slice(0, 6).map((book, index) => (
                    <BookCard key={book.id} book={book} index={index} />
                ))}
            </div>
            {/* "View All" link could go here if removing the button logic entirely, or valid existing footer buttons? */}
            <div className="explore-footer">
                <Link to="/books" className="view-all-btn">View All Books</Link>
            </div>
        </section>
    );
};

export default ExploreSection;
