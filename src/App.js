import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Books from "./pages/Books";
import Distributors from "./pages/Distributors";
import Papers from "./pages/Papers";
import AboutUs from "./pages/About_us";
import "@fontsource/nunito"; 

import './App.css'; 

function App() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Router>
      <Navbar setSearchQuery={setSearchQuery} />
      {/* Ensure this div is transparent so the background shows through */}
      <div className="p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<Books searchQuery={searchQuery} />} />
          <Route path="/distributors" element={<Distributors />} />
          <Route path="/papers" element={<Papers />} />
          <Route path="/about" element={<AboutUs />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;