import React from 'react';

const features = [
  {
    icon: '🌍',
    title: 'Improved Visualization',
    description: 'Enhanced clarity and detail for better analysis of SAR imagery'
  },
  {
    icon: '🤖',
    title: 'AI-Driven Accuracy',
    description: 'State-of-the-art deep learning models for precise colorization'
  },
  {
    icon: '🚀',
    title: 'Fast Processing',
    description: 'Quick turnaround times for rapid analysis and decision making'
  },
  {
    icon: '🔬',
    title: 'Better Interpretation',
    description: 'Clearer distinction of terrain features and objects of interest'
  }
];

export default function Features() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-4 text-white">
          Features & Benefits
        </h2>
        <p className="text-xl text-gray-300 text-center mb-12">
          Why use our SAR Colorization?
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-gray-800/30 rounded-xl backdrop-blur-sm
                         transform hover:scale-105 transition-all duration-300
                         hover:bg-gray-800/50 group"
            >
              {/* Icon */}
              <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 