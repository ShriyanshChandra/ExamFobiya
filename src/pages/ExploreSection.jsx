import { Link } from 'react-router-dom';
import { useBooks } from '../context/BookContext';
import BookCard from '../components/BookCard';
import './ExploreSection.css';

const ExploreSection = () => {
    const { books } = useBooks();
    const hasOverflow = books.length > 5;
    const visibleBooks = books;

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
        <section className="explore-section container" onMouseEnter={handleSectionMouseEnter}>
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
            <div 
                className={`book-grid home-book-shelf ${hasOverflow ? 'is-scrollable' : 'is-compact'}`}
                style={{ '--shelf-count': visibleBooks.length }}
            >
                {visibleBooks.map((book, index) => (
                    <BookCard key={book.id} book={book} index={index} />
                ))}
            </div>
        </section>
    );
};

export default ExploreSection;
