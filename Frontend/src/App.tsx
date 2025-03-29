import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700">
      <Navbar />
      <main className="flex-grow flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/colorize" 
            element={<div className="pt-24 px-4 text-white min-h-screen">Colorize Page</div>} 
          />
          <Route 
            path="/about" 
            element={<div className="pt-24 px-4 text-white min-h-screen">About Page</div>} 
          />
          <Route 
            path="/contact" 
            element={<div className="pt-24 px-4 text-white min-h-screen">Contact Page</div>} 
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
} 