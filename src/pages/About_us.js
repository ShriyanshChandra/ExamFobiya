import './About_us.css';

export default function AboutUs() {
  return (
    <div className="about-us-container">
      <div className="about-hero-section">
        <h1 className="about-hero-title">Empowering Your Academic Journey</h1>
        <p className="about-hero-subtitle">
          Your one-stop destination for PGDCA, DCA, and BCA course materials.
        </p>
      </div>

      <div className="about-content-wrapper">
        <section className="about-mission-section">
          <h2 className="about-section-title">Our Mission</h2>
          <p className="about-mission-text">
            At <strong className="brand-name">ExamFobiya</strong>, we are dedicated to simplifying the learning process for university students. We understand the challenges of finding reliable study materials, which is why we curate and provide high-quality books, detailed indexes, and previous year question papers. Our goal is to ensure that every student has the resources they need to excel in their exams.
          </p>
        </section>

        <section className="about-courses-section">
          <h2 className="about-section-title">Courses We Cover</h2>
          <div className="about-course-grid">
            <div className="about-course-card">
              <div className="about-card-icon"></div>
              <h3>PGDCA</h3>
              <p>Post Graduate Diploma in Computer Applications</p>
              <ul className="about-course-features">
                <li>Comprehensive Textbooks</li>
                <li>Solved Question Papers</li>
                <li>Syllabus Breakdown</li>
              </ul>
            </div>

            <div className="about-course-card">
              <div className="about-card-icon"></div>
              <h3>DCA</h3>
              <p>Diploma in Computer Applications</p>
              <ul className="about-course-features">
                <li>Fundamental Concepts</li>
                <li>Practical Guides</li>
                <li>Exam Preparation Kits</li>
              </ul>
            </div>

            <div className="about-course-card">
              <div className="about-card-icon"></div>
              <h3>BCA</h3>
              <p>Bachelor of Computer Applications</p>
              <ul className="about-course-features">
                <li>Core Programming Books</li>
                <li>Advanced Topics</li>
                <li>Project Guidelines</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="about-why-us-section">
          <h2 className="about-section-title">Why Choose ExamFobiya?</h2>
          <div className="about-features-grid">
            <div className="about-feature-item">
              <h4>Extensive Library</h4>
              <p>A wide range of books tailored specifically for your course curriculum.</p>
            </div>
            <div className="about-feature-item">
              <h4>Detailed Indexes</h4>
              <p>Preview book contents before you buy to ensure it fits your needs.</p>
            </div>
            <div className="about-feature-item">
              <h4>Offline Availability</h4>
              <p>We prioritize knowing exactly where to find physical copies for your convenience.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}