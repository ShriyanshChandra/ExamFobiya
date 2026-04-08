import { HashRouter as Router, Routes, Route } from "react-router-dom";
import React from 'react';
import { useState } from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Books from "./pages/Books";
import Distributors from "./pages/Distributors";
import Questions from "./pages/Questions";
import Search from "./pages/Search";
import AboutUs from "./pages/About_us";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Welcome from "./pages/Welcome";
import AdminDashboard from "./pages/AdminDashboard";
import DevDashboard from "./pages/DevDashboard";
import AddBook from "./pages/AddBook";
import UploadQuestions from "./pages/UploadQuestions";
import EditQuestionPdf from "./pages/EditQuestionPdf";

import QRGenerator from "./pages/tools/QRGenerator";
import SpeedTest from "./pages/tools/SpeedTest";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { BookProvider } from "./context/BookContext";
import { QuestionProvider } from "./context/QuestionContext";
import "@fontsource/nunito";
import './App.css';
import { trackVisit } from "./services/TrackingService";
import { useEffect } from "react";
import { SpeedInsights } from "@vercel/speed-insights/react";

function App() {
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    trackVisit();
  }, []);



  return (
    <>
    <BookProvider>
      <AuthProvider>
        <ThemeProvider>
          <QuestionProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <div className="app-container">
                <Navbar setSearchQuery={setSearchQuery} />
                {/* Ensure this div is transparent so the background shows through */}
                <div className="p-6 content-wrap">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/books" element={<Books />} />
                    <Route path="/search" element={<Search searchQuery={searchQuery} />} />
                    <Route path="/distributors" element={<Distributors />} />
                    <Route path="/questions" element={<Questions />} />
                    <Route path="/about" element={<AboutUs />} />

                    <Route path="/tools/qr-generator" element={<QRGenerator />} />
                    <Route path="/tools/speed-test" element={<SpeedTest />} />
                    <Route path="/terms" element={<TermsAndConditions />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/welcome" element={<Welcome />} />

                    <Route
                      path="/add-book"
                      element={
                        <ProtectedRoute>
                          <AddBook />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/upload-questions"
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <UploadQuestions />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/edit-question-pdf"
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <EditQuestionPdf />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/edit-book/:id"
                      element={
                        <ProtectedRoute>
                          <AddBook />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dev"
                      element={
                        <ProtectedRoute requiredRole="developer">
                          <DevDashboard />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </div>
                <Footer />
              </div>
            </Router>
          </QuestionProvider>
        </ThemeProvider>
      </AuthProvider>
    </BookProvider>
    <SpeedInsights />
    </>
  );
}

export default App;