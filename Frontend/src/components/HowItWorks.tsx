import React from 'react';

const steps = [
  {
    icon: '🖼️',
    title: 'Upload a SAR Image',
    description: 'Drag and drop or select your SAR image file'
  },
  {
    icon: '⚙️',
    title: 'AI Processes the Image',
    description: 'Our advanced AI model analyzes and colorizes your image'
  },
  {
    icon: '📥',
    title: 'Download the Colorized Image',
    description: 'Get your enhanced, colorized result instantly'
  }
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-12 text-white">
          How It Works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative p-6 bg-gray-800/50 rounded-xl backdrop-blur-sm
                         transform hover:scale-105 transition-all duration-300"
            >
              {/* Step Number */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">{index + 1}</span>
              </div>
              
              {/* Icon */}
              <div className="text-4xl mb-4 flex justify-center">
                {step.icon}
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-semibold text-white mb-2 text-center">
                {step.title}
              </h3>
              <p className="text-gray-300 text-center">
                {step.description}
              </p>
              
              {/* Connector Line (except for last item) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-purple-500/50"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 