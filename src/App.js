import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Books from "./pages/Books";
import Questions from "./pages/Questions";
import Search from "./pages/Search";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Welcome from "./pages/Welcome";
import AdminDashboard from "./pages/AdminDashboard";
import AddBook from "./pages/AddBook";
import UploadQuestions from "./pages/UploadQuestions";
import EditQuestionPdf from "./pages/EditQuestionPdf";
import AboutUs from "./pages/About_us";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Maintenance from "./pages/Maintenance";
import SavedItems from "./pages/SavedItems";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { BookProvider } from "./context/BookContext";
import { QuestionProvider } from "./context/QuestionContext";
import { trackVisit } from "./services/TrackingService";
import "@fontsource/nunito"; 

import './App.css'; 

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
              <Navbar setSearchQuery={setSearchQuery} />
              {/* Ensure this div is transparent so the background shows through */}
              <div className="p-6">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/books" element={<Books searchQuery={searchQuery} />} />
                  <Route path="/questions" element={<Questions />} />
                  <Route path="/search" element={<Search searchQuery={searchQuery} />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/welcome" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />
                  <Route path="/saved-items" element={<ProtectedRoute><SavedItems /></ProtectedRoute>} />
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
