import React, { useState } from "react";
import "./Books.css";

// Search results styling
const searchResultsStyle = `
.search-results {
  margin: 1rem 0;
  padding: 0.5rem 1rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  color: #6c757d;
}
`;

// Add styles to head
const styleSheet = document.createElement("style");
styleSheet.innerText = searchResultsStyle;
document.head.appendChild(styleSheet);

const booksData = [
  {
    id: 1,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    image: "https://m.media-amazon.com/images/I/81af+MCATTL.jpg",
    description: "A classic novel set in the Jazz Age exploring themes of wealth and identity.",
    contents: "Chapters include: The Party, Gatsby’s Dream, The Fall, The Green Light, and more."
  },
  {
    id: 2,
    title: "Atomic Habits",
    author: "James Clear",
    image: "https://m.media-amazon.com/images/I/91bYsX41DVL.jpg",
    description: "A practical guide on how to form good habits, break bad ones, and master tiny behaviors.",
    contents: "Chapters: The Fundamentals, 1st Law, 2nd Law, 3rd Law, 4th Law."
  },
  {
    id: 3,
    title: "Sapiens",
    author: "Yuval Noah Harari",
    image: "https://m.media-amazon.com/images/I/713jIoMO3UL.jpg",
    description: "A brief history of humankind, exploring evolution, culture, and society.",
    contents: "Sections: Cognitive Revolution, Agricultural Revolution, Scientific Revolution."
  },
  {
    id: 4,
    title: "Rich Dad Poor Dad",
    author: "Robert T. Kiyosaki",
    image: "https://m.media-amazon.com/images/I/81bsw6fnUiL.jpg",
    description: "A personal finance classic teaching financial independence and investing.",
    contents: "Chapters: The Rich Don’t Work for Money, Mind Your Own Business, Work to Learn."
  },
  {
    id: 5,
    title: "Ikigai",
    author: "Héctor García & Francesc Miralles",
    image: "https://m.media-amazon.com/images/I/81l3rZK4lnL.jpg",
    description: "The Japanese secret to a long and happy life.",
    contents: "Topics: The Power of Purpose, Flow, Resilience, Finding Your Ikigai."
  },
  {
    id: 6,
    title: "The Psychology of Money",
    author: "Morgan Housel",
    image: "https://m.media-amazon.com/images/I/71aG+xDKSYL.jpg",
    description: "Timeless lessons on wealth, greed, and happiness.",
    contents: "Stories about behavior, risk, luck, and compounding."
  },
  {
    id: 7,
    title: "The Alchemist",
    author: "Paulo Coelho",
    image: "https://m.media-amazon.com/images/I/71aFt4+OTOL.jpg",
    description: "A story about following one’s dreams and listening to one’s heart.",
    contents: "Journey of Santiago, The Desert, The Alchemy, The Treasure."
  },
  {
    id: 8,
    title: "Deep Work",
    author: "Cal Newport",
    image: "https://m.media-amazon.com/images/I/81xXAyf5TLL.jpg",
    description: "Rules for focused success in a distracted world.",
    contents: "Sections: The Idea, The Rules, Focus Strategies, Implementation."
  },
  {
    id: 9,
    title: "The Subtle Art of Not Giving a F*ck",
    author: "Mark Manson",
    image: "https://m.media-amazon.com/images/I/71QKQ9mwV7L.jpg",
    description: "A counterintuitive approach to living a good life.",
    contents: "Chapters: Don't Try, Happiness is a Problem, You Are Not Special."
  },
  {
    id: 10,
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    image: "https://m.media-amazon.com/images/I/61fdrEuPJwL.jpg",
    description: "The two systems that drive the way we think.",
    contents: "Parts: Two Systems, Heuristics and Biases, Overconfidence, Choices."
  }
];

function Books({ searchQuery }) {
  const [selectedBook, setSelectedBook] = useState(null);

  // Filter books based on search query
  const filteredBooks = booksData.filter(book =>
    searchQuery
      ? book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div className="books-page">
      <div className="books-content">
        <h1>Available Books</h1>
        {searchQuery && (
          <p className="search-results">
            Showing results for: "{searchQuery}" ({filteredBooks.length} books found)
          </p>
        )}
        <div className="books-grid">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="book-card"
              onClick={() => setSelectedBook(book)}
            >
              <img src={book.image} alt={book.title} />
              <h3>{book.title}</h3>
              <p>{book.author}</p>
            </div>
          ))}
        </div>
      </div>

      {selectedBook && (
        <div className="book-modal">
          <div className="book-modal-content">
            <span className="close-btn" onClick={() => setSelectedBook(null)}>
              &times;
            </span>
            <h2>{selectedBook.title}</h2>
            <p><strong>Author:</strong> {selectedBook.author}</p>
            <p><strong>Description:</strong> {selectedBook.description}</p>
            <p><strong>Contents:</strong> {selectedBook.contents}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Books;
