import './About_us.css';

export default function AboutUs() {
  const courseCards = [
    {
      shortName: 'PGDCA',
      title: 'Post Graduate Diploma in Computer Applications',
      description: 'Focused resources that help learners move quickly from revision to exam readiness.',
      features: ['Comprehensive textbooks', 'Solved question papers', 'Syllabus breakdown']
    },
    {
      shortName: 'DCA',
      title: 'Diploma in Computer Applications',
      description: 'Foundational materials designed for clarity, practice, and confident progress.',
      features: ['Fundamental concepts', 'Practical guides', 'Exam preparation kits']
    },
    {
      shortName: 'BCA',
      title: 'Bachelor of Computer Applications',
      description: 'Structured academic support for core subjects, projects, and deeper technical study.',
      features: ['Core programming books', 'Advanced topics', 'Project guidelines']
    }
  ];

  const highlights = [
    {
      title: 'Curated for your syllabus',
      description: 'We focus on practical academic material that matches what students actually need for their coursework.'
    },
    {
      title: 'Easy to preview',
      description: 'Detailed indexes help you understand the content before you decide which book is right for you.'
    },
    {
      title: 'Built for exam season',
      description: 'From textbooks to previous year papers, our collection is organized around real preparation needs.'
    }
  ];

  return (
    <div className="about-us-container about-us-page">
      <div className="about-hero-section">
        <div className="about-hero-inner">
          <p className="about-eyebrow">About ExamFobiya</p>
          <h1 className="about-hero-title">A cleaner, calmer way to find the right study material.</h1>
          <p className="about-hero-subtitle">
            We help PGDCA, DCA, and BCA students discover useful books, clear indexes, and exam-focused resources without the usual confusion.
          </p>

          <div className="about-hero-stats">
            <div className="about-stat-card">
              <span className="about-stat-value">3</span>
              <span className="about-stat-label">courses covered</span>
            </div>
            <div className="about-stat-card">
              <span className="about-stat-value">Focused</span>
              <span className="about-stat-label">on academic needs</span>
            </div>
            <div className="about-stat-card">
              <span className="about-stat-value">Simple</span>
              <span className="about-stat-label">to browse and compare</span>
            </div>
          </div>
        </div>
      </div>

      <div className="about-content-wrapper">
        <section className="about-mission-section">
          <div className="about-mission-copy">
            <p className="about-section-kicker">Our mission</p>
            <h2 className="about-section-title">Make exam preparation feel organized, not overwhelming.</h2>
            <p className="about-mission-text">
              At <strong className="brand-name">ExamFobiya</strong>, we simplify the search for reliable academic resources. Instead of forcing students to dig through scattered material, we bring together quality books, detailed indexes, and previous year question papers in one place so study time feels more focused and productive.
            </p>
          </div>

          <div className="about-mission-panel">
            <p className="about-panel-label">What we care about</p>
            <ul className="about-mission-points">
              <li>Useful resources over clutter</li>
              <li>Course-specific guidance for students</li>
              <li>A smoother path from browsing to exam prep</li>
            </ul>
          </div>
        </section>

        <section className="about-courses-section">
          <div className="about-section-heading">
            <p className="about-section-kicker">Courses we cover</p>
            <h2 className="about-section-title">Built around the programs students actually search for.</h2>
          </div>

          <div className="about-course-grid">
            {courseCards.map((course) => (
              <article className="about-course-card" key={course.shortName}>
                <div className="about-card-icon">{course.shortName}</div>
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <ul className="about-course-features">
                  {course.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="about-why-us-section">
          <div className="about-section-heading">
            <p className="about-section-kicker">Why students choose us</p>
            <h2 className="about-section-title">Everything is arranged to reduce friction and save time.</h2>
          </div>

          <div className="about-features-grid">
            {highlights.map((item) => (
              <div className="about-feature-item" key={item.title}>
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </div>
            ))}
          </div>

          <div className="about-closing-banner">
            <p className="about-closing-text">
              Whether you are starting your semester or preparing for final exams, ExamFobiya is built to help you find the right material faster and study with more confidence.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
