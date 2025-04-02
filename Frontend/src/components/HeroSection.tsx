import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedText from './AnimatedText';

export default function HeroSection() {
  const navigate = useNavigate();
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = useCallback((clientX: number, bounds: DOMRect) => {
    const position = ((clientX - bounds.left) / bounds.width) * 100;
    setSliderPosition(Math.min(Math.max(position, 0), 100));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    const bounds = e.currentTarget.getBoundingClientRect();
    handleMove(e.clientX, bounds);
  }, [handleMove]);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    const bounds = e.currentTarget.getBoundingClientRect();
    handleMove(e.touches[0].clientX, bounds);
  }, [handleMove]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isDragging) {
      const bounds = e.currentTarget.getBoundingClientRect();
      handleMove(e.clientX, bounds);
    }
  }, [isDragging, handleMove]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isDragging) {
      const bounds = e.currentTarget.getBoundingClientRect();
      handleMove(e.touches[0].clientX, bounds);
    }
  }, [isDragging, handleMove]);

  const stopDragging = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    window.addEventListener('mouseup', stopDragging);
    window.addEventListener('touchend', stopDragging);
    return () => {
      window.removeEventListener('mouseup', stopDragging);
      window.removeEventListener('touchend', stopDragging);
    };
  }, [stopDragging]);

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      
      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-32 pb-20">
          {/* Text Content */}
          <div className="max-w-2xl mx-auto lg:mx-0 select-none">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
              Transform SAR Images into{' '}
              <AnimatedText
                text="Colorized Insights"
                className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"
              />
            </h1>
            <p className="text-xl text-gray-300 mb-10">
              Experience the power of AI-driven colorization technology that brings your SAR imagery to life. 
              Enhance interpretation and analysis with vibrant, meaningful colors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/colorize')}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-lg font-semibold 
                         transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
              >
                Try Now
              </button>
              <button
                onClick={() => navigate('/about')}
                className="px-8 py-4 border border-gray-500 text-white rounded-lg text-lg font-semibold 
                         transform transition-all duration-300 hover:border-blue-400"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Image Comparison Slider */}
          <div 
            className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-2xl mx-auto lg:mx-0 max-w-3xl select-none group"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            style={{ touchAction: 'none' }}
          >
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Base SAR Image */}
            <img
              src="/sample-sar.jpg"
              alt="Original SAR Image"
              className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
              draggable="false"
            />
            
            {/* Colorized Image with Mask */}
            <div
              className="absolute top-0 left-0 w-full h-full mix-blend-multiply transition-transform duration-200"
              style={{
                maskImage: `linear-gradient(to right, black ${sliderPosition}%, transparent ${sliderPosition}%)`,
                WebkitMaskImage: `linear-gradient(to right, black ${sliderPosition}%, transparent ${sliderPosition}%)`
              }}
            >
              <img
                src="/sample-colorized.jpg"
                alt="Colorized SAR Image"
                className="w-full h-full object-cover pointer-events-none"
                draggable="false"
              />
            </div>

            {/* Slider Handle */}
            <div
              className="absolute top-0 bottom-0 w-px bg-white/80 cursor-ew-resize select-none group-hover:bg-white transition-colors duration-300"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 group-hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300">
                <svg
                  className="w-6 h-6 text-gray-800/80 group-hover:text-gray-800 pointer-events-none transition-colors duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 5l-7 7 7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 