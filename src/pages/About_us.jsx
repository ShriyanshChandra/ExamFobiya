import useSEO from '../utils/useSEO';
import './About_us.css';

export default function AboutUs() {
  const courseCards = [
    {
      shortName: 'PGDCA',
      title: 'Post Graduate Diploma in Computer Applications',
      description: 'Focused resources that help learners move quickly from revision to exam readiness.',
      features: ['Comprehensive textbooks', 'Solved questions', 'Syllabus breakdown']
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
      description: 'From textbooks to previous year questions, our collection is organized around real preparation needs.'
    }
  ];

  const teamSections = [
    {
      category: 'Owner',
      title: 'Leadership & Founder',
      members: [
        {
          id: 'owner-placeholder',
          name: 'Owner Profile',
          role: 'Platform Leadership',
          bio: 'Owner details and leadership profile will be announced soon.',
          initials: 'EF',
          tags: ['Leadership', 'ExamFobiya'],
          socials: {
            email: 'mailto:contact@examfobiya.com'
          }
        }
      ]
    },
    {
      category: 'Developers',
      title: 'Engineering & Development',
      members: [
        {
          id: 'shriyansh',
          name: 'Shriyansh',
          role: 'Lead Developer & Software Engineer',
          bio: 'Architecting and building ExamFobiya to deliver a seamless, high-performance study resource discovery platform.',
          initials: 'S',
          tags: ['Full-Stack Dev', 'React & Node.js', 'System Architecture'],
          socials: {
            website: 'https://portfolio-iota-murex-53.vercel.app/',
            email: 'mailto:chandrashriyansh@gmail.com'
          }
        }
      ]
    },
    {
      category: 'Editor',
      title: 'Editorial & Academic Content',
      members: [
        {
          id: 'editor-placeholder',
          name: 'Editorial Team',
          role: 'Academic Content Editor',
          bio: 'Editor profile and academic curation team details will be updated soon.',
          initials: 'ED',
          tags: ['Content Curation', 'Syllabus Review'],
          socials: {
            email: 'mailto:support@examfobiya.com'
          }
        }
      ]
    }
  ];

  useSEO({
    title: 'About Us - Student Exam Prep Resource Platform',
    description: 'Learn about ExamFobiya — a student resource platform for BCA, DCA, and PGDCA exam preparation materials and study guides.',
    path: '/about'
  });

  return (
    <div className="about-us-container about-us-page">
      <div className="about-hero-section">
        <div className="about-hero-inner container">
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

      <div className="about-content-wrapper container">
        <section className="about-mission-section">
          <div className="about-mission-copy">
            <p className="about-section-kicker">Our mission</p>
            <h2 className="about-section-title">Make exam preparation feel organized, not overwhelming.</h2>
            <p className="about-mission-text">
              At <strong className="brand-name">ExamFobiya</strong>, we simplify the search for reliable academic resources. Instead of forcing students to dig through scattered material, we bring together quality books, detailed indexes, and previous year questions in one place so study time feels more focused and productive.
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

        {/* Small compact section at bottom for Developer & Editor */}
        <section className="about-compact-team-section">
          <div className="about-compact-team-header">
            <h3 className="about-compact-team-title">Meet Our Team</h3>
          </div>

          <div className="about-compact-team-grid">
            <div className="about-compact-team-card">
              <div className="about-compact-avatar">S</div>
              <div className="about-compact-info">
                <h4 className="about-compact-name">Shriyansh</h4>
                <p className="about-compact-role">Lead Developer & Software Engineer</p>
              </div>
              <div className="about-compact-socials">
                <a href="https://portfolio-iota-murex-53.vercel.app/" target="_blank" rel="noopener noreferrer" aria-label="Portfolio Website" className="about-social-link">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                </a>
                <a href="mailto:chandrashriyansh@gmail.com" aria-label="Email Contact" className="about-social-link">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </a>
              </div>
            </div>

            <div className="about-compact-team-card">
              <div className="about-compact-avatar">B</div>
              <div className="about-compact-info">
                <h4 className="about-compact-name">Bhavesh</h4>
                <p className="about-compact-role">Software Engineer & Tester</p>
              </div>
              <div className="about-compact-socials">
                <a href="https://www.instagram.com/_bhaxvsh/" target="_blank" rel="noopener noreferrer" aria-label="Instagram Profile" className="about-social-link">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
              </div>
            </div>

            <div className="about-compact-team-card">
              <div className="about-compact-avatar">A</div>
              <div className="about-compact-info">
                <h4 className="about-compact-name">Ansh</h4>
                <p className="about-compact-role">Editor</p>
              </div>
              <div className="about-compact-socials">
                <a href="https://www.instagram.com/_yours_truly_8055_/" target="_blank" rel="noopener noreferrer" aria-label="Instagram Profile" className="about-social-link">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
