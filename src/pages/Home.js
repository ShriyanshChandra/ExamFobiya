import React from "react";
import "./Home.css";
import Aurora from "./Aurora";
import NewArrivals from "./NewArrivals";
import BestSeller from "./BestSeller";

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
            Welcome to <span className="brand-name">ExamFobia</span>
          </h1>
          <p>
            Discover new reads, find trusted distributors, and access study
            materials — all in one place!
          </p>
          <div className="hero-buttons">
            <button className="primary-btn">Explore Books</button>
            <button className="secondary-btn">Find Distributors</button>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <NewArrivals />

      {/* Best Sellers Section */}
      <BestSeller />
    </div>
  );
};

export default Home;