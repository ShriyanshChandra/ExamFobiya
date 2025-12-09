import { useRef } from 'react';
import { useBooks } from "../context/BookContext";
import BookCard from '../components/BookCard';
import "./NewArrivals.css";

const NewArrivals = () => {
  const { getBooksBySection } = useBooks();
  // Fetch books for 'New Arrivals' (Standardized plural name)
  const newArrivals = getBooksBySection("New Arrivals");

  return (
    <section className="new-arrivals">
      <h2>New Arrivals</h2>
      {newArrivals.length === 0 ? (
        <p>No new arrivals at the moment.</p>
      ) : (
        <div className="book-grid">
          {newArrivals.map((book, index) => (
            <BookCard key={book.id} book={book} index={index} />
          ))}
        </div>
      )}
    </section>
  );
};

export default NewArrivals;
