import React from "react";
import BookCategorySection from "../components/BookCategorySection";

const NewArrivals = ({ limit }) => {
  return (
    <BookCategorySection 
      title="New Arrivals"
      section="New Arrivals"
      limit={limit}
      kicker="Fresh picks"
      linkText="Browse all books"
      className="new-arrivals book-category-section container"
      icon={
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
      }
    />
  );
};

export default NewArrivals;
