import { HashRouter as Router, Routes, Route } from "react-router-dom";
import React from 'react';
import { useState } from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Books from "./pages/Books";
import Distributors from "./pages/Distributors";
import Questions from "./pages/Questions";
import AboutUs from "./pages/About_us";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import DevDashboard from "./pages/DevDashboard";
import AddBook from "./pages/AddBook";
import Tools from "./pages/Tools";
import QRGenerator from "./pages/tool-pages/QRGenerator";
import SpeedTest from "./pages/tool-pages/SpeedTest";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { BookProvider } from "./context/BookContext";
import { QuestionProvider } from "./context/QuestionContext";
import AddQuestion from "./pages/AddQuestion";
import "@fontsource/nunito";
import './App.css';
import { trackVisit } from "./services/TrackingService";
import { useEffect } from "react";

function App() {
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    trackVisit();
  }, []);



  return (
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
                    <Route path="/books" element={<Books searchQuery={searchQuery} />} />
                    <Route path="/distributors" element={<Distributors />} />
                    <Route path="/questions" element={<Questions />} />
                    <Route path="/about" element={<AboutUs />} />
                    <Route path="/tools" element={<Tools />} />
                    <Route path="/tools/qr-generator" element={<QRGenerator />} />
                    <Route path="/tools/speed-test" element={<SpeedTest />} />
                    <Route path="/terms" element={<TermsAndConditions />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route
                      path="/add-book"
                      element={
                        <ProtectedRoute>
                          <AddBook />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/add-question"
                      element={
                        <ProtectedRoute>
                          <AddQuestion />
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
  );
}

export default App;