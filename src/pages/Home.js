import React from "react";
import "./Home.css";
import Aurora from "./Aurora";
import NewArrivals from "./NewArrivals";
import BestSeller from "./BestSeller"; // Import new component

const Home = () => {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="aurora-wrapper">
          <Aurora
            colorStops={['#00ff7b', '#0008ff', '#9500ff']}
            blend={0.5}
            amplitude={1.0}
            speed={0.5}
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