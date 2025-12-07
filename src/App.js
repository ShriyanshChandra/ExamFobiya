import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Books from "./pages/Books";
import Distributors from "./pages/Distributors";
import Papers from "./pages/Papers";
import AboutUs from "./pages/About_us";
import Login from "./pages/Login";
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
            </div>
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </BookProvider>
  );
}

export default App;