import { useEffect } from 'react';

const SITE_NAME = 'ExamFobiya';
const SITE_URL = 'https://www.examfobiya.com';
const DEFAULT_IMAGE = `${SITE_URL}/logo512.png`;
const DEFAULT_KEYWORDS = 'ExamFobiya, examfobiya, Examphobia, examphobia, Exam Phobia, exam phobia, Exam Fobiya, BCA books, DCA books, PGDCA books, previous year questions, programming solutions, computer science notes, university study materials';

/**
 * Custom hook for per-page SEO metadata.
 *
 * Sets document title, meta description, canonical URL,
 * Open Graph tags, Twitter Card tags, and keyword tags.
 *
 * @param {Object} options
 * @param {string} options.title   - Page-specific title (appended with " | ExamFobiya")
 * @param {string} options.description - Page meta description
 * @param {string} options.path    - Route path, e.g. "/books"
 * @param {string} [options.image] - OG/Twitter image URL (defaults to logo)
 * @param {string} [options.keywords] - Additional page-specific keywords
 * @param {boolean} [options.noindex=false] - Whether to exclude page from search engine index
 */
const useSEO = ({ title, description, path = '/', image, type = 'website', noindex = false, keywords }) => {
  useEffect(() => {
    // --- Document title ---
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    document.title = fullTitle;

    // --- Helper to create or update a <meta> tag ---
    const setMeta = (attribute, key, content) => {
      let el = document.querySelector(`meta[${attribute}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attribute, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // --- Helper to create or update a <link> tag ---
    const setLink = (rel, href) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    const pageUrl = `${SITE_URL}/${path.replace(/^\//, '')}`;
    const pageImage = image || DEFAULT_IMAGE;
    const pageKeywords = keywords ? `${keywords}, ${DEFAULT_KEYWORDS}` : DEFAULT_KEYWORDS;

    // --- Robots indexing directive ---
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    // --- Meta description ---
    setMeta('name', 'description', description);

    // --- Meta keywords ---
    setMeta('name', 'keywords', pageKeywords);

    // --- Canonical URL ---
    setLink('canonical', pageUrl);

    // --- Open Graph ---
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', pageUrl);
    setMeta('property', 'og:image', pageImage);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:site_name', SITE_NAME);

    // --- Twitter Card ---
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', pageImage);

    // Cleanup: reset title when component unmounts
    return () => {
      document.title = `${SITE_NAME} - BCA, DCA & PGDCA Books & Study Materials`;
    };
  }, [title, description, path, image, type, noindex, keywords]);
};

export default useSEO;
