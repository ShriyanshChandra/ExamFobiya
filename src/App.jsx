import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import React, { useEffect, useState, Suspense } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { BookProvider } from "./context/BookContext";
import { QuestionProvider } from "./context/QuestionContext";
import { trackVisit } from "./services/TrackingService";
import "@fontsource/nunito";

import './App.css'; 

// Lazy-loaded pages — these pull in heavy libraries (DotLottie, pdfjs-dist, mammoth, etc.)
// and/or are admin-only / rarely visited, so they are split into separate chunks.
const Books = React.lazy(() => import("./pages/Books"));
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const Questions = React.lazy(() => import("./pages/Questions"));
const Search = React.lazy(() => import("./pages/Search"));
const Welcome = React.lazy(() => import("./pages/Welcome"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const AddBook = React.lazy(() => import("./pages/AddBook"));
const UploadQuestions = React.lazy(() => import("./pages/UploadQuestions"));
const EditQuestionPdf = React.lazy(() => import("./pages/EditQuestionPdf"));
const AboutUs = React.lazy(() => import("./pages/About_us"));
const TermsAndConditions = React.lazy(() => import("./pages/TermsAndConditions"));
const PrivacyPolicy = React.lazy(() => import("./pages/PrivacyPolicy"));
const Maintenance = React.lazy(() => import("./pages/Maintenance"));
const Settings = React.lazy(() => import("./pages/Settings"));
const ProgrammingSolutions = React.lazy(() => import("./pages/ProgrammingSolutions"));
const AddProgrammingSolution = React.lazy(() => import("./pages/AddProgrammingSolution"));

// Lightweight CSS-only fallback (avoids importing DotLottie in the main bundle)
const SuspenseFallback = () => (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
    <div style={{
      width: 40, height: 40, border: "3px solid rgba(100,100,100,0.2)",
      borderTop: "3px solid var(--primary-color, #2575fc)", borderRadius: "50%",
      animation: "suspense-spin 0.8s linear infinite"
    }} />
    <style>{`@keyframes suspense-spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function App() {
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    trackVisit();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <BookProvider>
          <QuestionProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <ScrollToTop />
              <Navbar setSearchQuery={setSearchQuery} />
              {/* Ensure this div is transparent so the background shows through */}
              <div className="p-6" style={{ paddingTop: "4rem" }}>
                <Suspense fallback={<SuspenseFallback />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/books" element={<Books searchQuery={searchQuery} />} />
                    <Route path="/questions" element={<Questions />} />
                    <Route path="/search" element={<Search searchQuery={searchQuery} />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/welcome" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    <Route path="/programming-solutions" element={<ProgrammingSolutions />} />
                    <Route path="/programming-solutions/:id" element={<ProgrammingSolutions />} />
                    <Route path="/add-programming-solution" element={<ProtectedRoute requiredRole="admin"><AddProgrammingSolution /></ProtectedRoute>} />
                    <Route path="/edit-programming-solution/:bookId/:solutionId" element={<ProtectedRoute requiredRole="admin"><AddProgrammingSolution /></ProtectedRoute>} />
                    <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
                    <Route path="/add-book" element={<ProtectedRoute requiredRole="admin"><AddBook /></ProtectedRoute>} />
                    <Route path="/edit-book/:id" element={<ProtectedRoute requiredRole="admin"><AddBook /></ProtectedRoute>} />
                    <Route path="/upload-questions" element={<ProtectedRoute requiredRole="admin"><UploadQuestions /></ProtectedRoute>} />
                    <Route path="/edit-question-pdf" element={<ProtectedRoute requiredRole="admin"><EditQuestionPdf /></ProtectedRoute>} />
                    <Route path="/about" element={<AboutUs />} />
                    <Route path="/terms" element={<TermsAndConditions />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/maintenance" element={<Maintenance />} />
                  </Routes>
                </Suspense>
              </div>
              <Footer />
            </Router>
          </QuestionProvider>
        </BookProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
