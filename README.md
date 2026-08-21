# ExamFobiya - Academic Resource Platform

ExamFobiya is an academic study platform for BCA, DCA, and PGDCA students, offering syllabus outlines, previous year question papers, programming solutions, and diagnostic tools.

## Technology Stack

- **Frontend**: React 19, Vite, React Router v7, Framer Motion
- **Backend**: Node.js, Express 5, Firebase Admin SDK
- **Database & Auth**: Google Cloud Firestore, Firebase Authentication
- **AI Services**: Google Gemini AI (`@google/generative-ai`)
- **Transactional Emails**: Brevo (Sendinblue) REST API v3
- **Search Indexing**: IndexNow Protocol

## Getting Started

### Prerequisites

- Node.js (v18+ or v20+)
- Python 3 (for case-sensitivity validation)
- npm (v9+)

### Installation

1. Install frontend dependencies:
   ```bash
   npm install
   ```

2. Install backend dependencies:
   ```bash
   cd backend && npm install && cd ..
   ```

### Running Locally

Start both the Vite development server and Express backend server concurrently:

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://127.0.0.1:5000`

### Quality & Build

- Check case-sensitive imports:
  ```bash
  python3 check.py
  ```

- Build production bundle:
  ```bash
  npm run build
  ```
