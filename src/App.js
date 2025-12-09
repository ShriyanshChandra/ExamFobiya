import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { DotLottiePlayer } from '@dotlottie/react-player';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Books from "./pages/Books";
import Distributors from "./pages/Distributors";
import Papers from "./pages/Papers";
import AboutUs from "./pages/About_us";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import DevDashboard from "./pages/DevDashboard";
import AddBook from "./pages/AddBook";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { BookProvider } from "./context/BookContext";
import "@fontsource/nunito";
import './App.css';

function App() {
  const [searchQuery, setSearchQuery] = useState("");



  return (
    <BookProvider>
      <AuthProvider>
        <ThemeProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="app-container">
              <Navbar setSearchQuery={setSearchQuery} />
              {/* Ensure this div is transparent so the background shows through */}
              <div className="p-6 content-wrap">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/books" element={<Books searchQuery={searchQuery} />} />
                  <Route path="/distributors" element={<Distributors />} />
                  <Route path="/papers" element={<Papers />} />
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  <Route
                    path="/add-book"
                    element={
                      <ProtectedRoute>
                        {/* Accessible to any logged in user with role check inside if needed, or refine ProtectedRoute */}
                        {/* Ideally restrict to admin/dev, but for now allow logged in or use specific role */}
                        <AddBook />
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
              <div style={{ textAlign: 'center', color: 'red', fontWeight: 'bold', padding: '10px 10px 0 10px', background: 'rgba(255,255,255,0.8)' }}>
                This website is under development!
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '20px', background: 'rgba(255,255,255,0.8)' }}>
                <DotLottiePlayer
                  src="https://assets-v2.lottiefiles.com/a/7169871e-9f86-11ee-8945-b7fc8fe73392/u7ih0FXafS.lottie"
                  loop
                  autoplay
                  style={{ width: '200px', height: '200px' }}
                />
              </div>
            </div>
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </BookProvider>
  );
}

export default App;