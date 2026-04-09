import React, { useState, useEffect, Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Books from "./pages/Books";
import Search from "./pages/Search";

import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { BookProvider } from "./context/BookContext";
import { QuestionProvider } from "./context/QuestionContext";
import "@fontsource/nunito";
import './App.css';
import { trackVisit } from "./services/TrackingService";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

// LAZY LOADED HEAVY COMPONENTS 

const Questions = lazy(() => import('./pages/Questions'));
const AboutUs = lazy(() => import('./pages/About_us'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Welcome = lazy(() => import('./pages/Welcome'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AddBook = lazy(() => import('./pages/AddBook'));
const UploadQuestions = lazy(() => import('./pages/UploadQuestions'));
const EditQuestionPdf = lazy(() => import('./pages/EditQuestionPdf'));

const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Maintenance = lazy(() => import('./pages/Maintenance'));

function App() {
  const [searchQuery, setSearchQuery] = useState("");

  // ========================================================================================
  // TOGGLE THIS VARIABLE TO "true" WHEN YOU WANT TO PAUSE THE ENTIRE WEBSITE DEPLOYMENT!
  const isMaintenanceMode = false;
  // ========================================================================================

  useEffect(() => {
    trackVisit();
  }, []);

  if (isMaintenanceMode) {
    return (
      <Suspense fallback={<div className="loading-screen">Loading Maintenance...</div>}>
        <Maintenance />
      </Suspense>
    );
  }

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
                    <Suspense fallback={<div className="loading-screen" style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading Page...</div>}>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/books" element={<Books />} />
                        <Route path="/search" element={<Search searchQuery={searchQuery} />} />

                        <Route path="/questions" element={<Questions />} />
                        <Route path="/about" element={<AboutUs />} />


                        <Route path="/terms" element={<TermsAndConditions />} />
                        <Route path="/privacy" element={<PrivacyPolicy />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/welcome" element={<Welcome />} />

                        <Route
                          path="/add-book"
                          element={
                            <ProtectedRoute requiredRole="admin">
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
                            <ProtectedRoute requiredRole="admin">
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
                      </Routes>
                    </Suspense>
                  </div>
                  <Footer />
                </div>
              </Router>
            </QuestionProvider>
          </ThemeProvider>
        </AuthProvider>
      </BookProvider>
      <SpeedInsights />
      <Analytics />
    </>
  );
}

export default App;