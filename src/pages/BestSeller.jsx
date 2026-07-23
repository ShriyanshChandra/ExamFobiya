import React from 'react';
import BookCategorySection from '../components/BookCategorySection';

const BestSeller = ({ limit }) => {
  return (
    <BookCategorySection 
      title="Best Sellers"
      section="Best Seller"
      limit={limit}
      kicker="Popular now"
      linkText="See full library"
      className="best-sellers book-category-section container"
      icon={
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
      }
    />
  );
};

export default BestSeller;
