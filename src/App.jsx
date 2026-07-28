import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
import React, { useEffect, useState, Suspense } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import GlobalErrorMonitor from "./components/GlobalErrorMonitor";
import Home from "./pages/Home";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { BookProvider } from "./context/BookContext";
import { QuestionProvider } from "./context/QuestionContext";
import { subscribeToMaintenanceMode, fetchMaintenanceMode } from "./services/SystemSettingsService";

import PWAInstallBanner from "./components/PWAInstallBanner";

import "@fontsource/nunito";

import './App.css';

// Helper to auto-retry dynamic imports if a new deployment changed chunk hashes
const lazyWithRetry = (componentImport) =>
  React.lazy(async () => {
    const pageHasBeenRefreshed = window.sessionStorage.getItem('chunk_retry_refreshed');
    try {
      const component = await componentImport();
      window.sessionStorage.removeItem('chunk_retry_refreshed');
      return component;
    } catch (error) {
      if (!pageHasBeenRefreshed) {
        window.sessionStorage.setItem('chunk_retry_refreshed', 'true');
        window.location.reload();
        return { default: () => null };
      }
      throw error;
    }
  });

// Lazy-loaded pages with auto-reload protection on stale chunks
const Books = lazyWithRetry(() => import("./pages/Books"));
const Login = lazyWithRetry(() => import("./pages/Login"));
const Register = lazyWithRetry(() => import("./pages/Register"));
const Questions = lazyWithRetry(() => import("./pages/Questions"));
const Search = lazyWithRetry(() => import("./pages/Search"));
const Welcome = lazyWithRetry(() => import("./pages/Welcome"));
const AdminDashboard = lazyWithRetry(() => import("./pages/AdminDashboard"));
const AddBook = lazyWithRetry(() => import("./pages/AddBook"));
const UploadQuestions = lazyWithRetry(() => import("./pages/UploadQuestions"));
const EditQuestionPdf = lazyWithRetry(() => import("./pages/EditQuestionPdf"));
const AboutUs = lazyWithRetry(() => import("./pages/About_us"));
const TermsAndConditions = lazyWithRetry(() => import("./pages/TermsAndConditions"));
const PrivacyPolicy = lazyWithRetry(() => import("./pages/PrivacyPolicy"));
const Maintenance = lazyWithRetry(() => import("./pages/Maintenance"));
const Settings = lazyWithRetry(() => import("./pages/Settings"));
const ProgrammingSolutions = lazyWithRetry(() => import("./pages/ProgrammingSolutions"));
const AddProgrammingSolution = lazyWithRetry(() => import("./pages/AddProgrammingSolution"));
const ResetPassword = lazyWithRetry(() => import("./pages/ResetPassword"));

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

function MaintenanceGuard({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMaintenance, setIsMaintenance] = useState(false);

  useEffect(() => {
    // Initial quick fetch
    fetchMaintenanceMode().then(active => setIsMaintenance(!!active)).catch(() => {});

    // Real-time Firestore listener
    const unsubscribe = subscribeToMaintenanceMode((active) => {
      setIsMaintenance(!!active);
    });

    // 8-second polling backup for PWA / offline recovery
    const pollInterval = setInterval(() => {
      fetchMaintenanceMode().then(active => setIsMaintenance(!!active)).catch(() => {});
    }, 8000);

    return () => {
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAdmin = user?.role === 'admin';
    const currentPath = location.pathname;

    if (isMaintenance && !isAdmin) {
      if (currentPath !== '/maintenance' && currentPath !== '/login' && currentPath !== '/admin') {
        console.log('[MaintenanceGuard] Maintenance is ON. Redirecting user to /maintenance');
        navigate('/maintenance', { replace: true });
      }
    } else if (!isMaintenance) {
      if (currentPath === '/maintenance') {
        console.log('[MaintenanceGuard] Maintenance is OFF. Restoring navigation to home');
        navigate('/', { replace: true });
      }
    }
  }, [isMaintenance, user, loading, location.pathname, navigate]);

  const isAdmin = user?.role === 'admin';

  return (
    <>
      {isMaintenance && isAdmin && (
        <div style={{
          background: 'linear-gradient(90deg, #f59e0b, #d97706)',
          color: '#ffffff',
          padding: '0.5rem 1rem',
          textAlign: 'center',
          fontWeight: '700',
          fontSize: '0.875rem',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 99999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.75rem',
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
        }}>
          <span>⚡ System Maintenance Mode is currently ACTIVE for standard users.</span>
          <a href="/admin" style={{ color: '#ffffff', textDecoration: 'underline', fontWeight: '800' }}>
            Manage in Dashboard
          </a>
        </div>
      )}
      {children}
    </>
  );
}

function App() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <GlobalErrorMonitor>
      <ThemeProvider>
        <AuthProvider>
          <BookProvider>
            <QuestionProvider>
              <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <MaintenanceGuard>
                  <ScrollToTop />
                  <Navbar setSearchQuery={setSearchQuery} />
                  {/* Ensure this div is transparent so the background shows through */}
                  <main className="p-6" style={{ paddingTop: "4rem" }}>
                    <ErrorBoundary>
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
                          <Route path="/reset-password" element={<ResetPassword />} />
                        </Routes>
                      </Suspense>
                    </ErrorBoundary>
                  </main>
                  <Footer />
                  <PWAInstallBanner />
                </MaintenanceGuard>
              </Router>
            </QuestionProvider>
          </BookProvider>
        </AuthProvider>
      </ThemeProvider>
    </GlobalErrorMonitor>
  );
}

export default App;
