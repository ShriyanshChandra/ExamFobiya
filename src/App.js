import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Books from "./pages/Books";
import Distributors from "./pages/Distributors";
import Papers from "./pages/Papers";
import AboutUs from "./pages/About_us";
import { ThemeProvider } from "./context/ThemeContext";
import "@fontsource/nunito";

import './App.css';

function App() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
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
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;