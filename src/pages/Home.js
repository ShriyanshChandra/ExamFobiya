import { Link } from "react-router-dom";
import "./Home.css";
import Aurora from "./Aurora";
import NewArrivals from "./NewArrivals";
import BestSeller from "./BestSeller";
import ExploreSection from "./ExploreSection";
import BookCategorySection from "../components/BookCategorySection";

const Home = () => {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="aurora-wrapper">
          <Aurora
            colorStops={['#4b6cb7', '#182848', '#ffd700']}
            blend={0.6}
            amplitude={1.2}
            speed={0.4}
          />
        </div>

        <div className="hero-content">
          <h1>
            Welcome to <span className="brand-name">ExamFobiya</span>
          </h1>
          <p>
            Discover new reads, find trusted distributors, and access study
            materials — all in one place!
          </p>
          <div className="hero-buttons">
            <Link to="/books" className="primary-btn">Explore Books</Link>
            <button className="secondary-btn">Find Book Stores</button>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <NewArrivals />

      {/* Best Sellers Section */}
      <BestSeller />

      {/* Course Books Sections */}
      <BookCategorySection title="BCA Books" section="BCA Books" />
      <BookCategorySection title="DCA Books" section="DCA Books" />
      <BookCategorySection title="PGDCA Books" section="PGDCA Books" />

      {/* Explore Section */}
      <ExploreSection />
    </div>
  );
};

export default Home;