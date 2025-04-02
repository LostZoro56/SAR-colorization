import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages';
import ColorizePage from './pages/colorize';
import AboutPage from './pages/about';
import ContactPage from './pages/contact';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/colorize" element={<div className="pt-32"><ColorizePage /></div>} />
            <Route path="/about" element={<div className="pt-32"><AboutPage /></div>} />
            <Route path="/contact" element={<div className="pt-32"><ContactPage /></div>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
} 