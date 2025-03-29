import React, { useState } from 'react';

const samples = [
  {
    id: 1,
    original: '/sample-sar-1.jpg',
    colorized: '/sample-colorized-1.jpg',
    title: 'Coastal Region'
  },
  {
    id: 2,
    original: '/sample-sar-2.jpg',
    colorized: '/sample-colorized-2.jpg',
    title: 'Urban Area'
  },
  {
    id: 3,
    original: '/sample-sar-3.jpg',
    colorized: '/sample-colorized-3.jpg',
    title: 'Mountain Range'
  }
];

export default function SampleGallery() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <section className="py-20 bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-4 text-white">
          Sample Gallery
        </h2>
        <p className="text-xl text-gray-300 text-center mb-12">
          See the transformation from SAR to colorized imagery
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {samples.map((sample) => (
            <div
              key={sample.id}
              className="relative aspect-square rounded-xl overflow-hidden
                         cursor-pointer group"
              onMouseEnter={() => setHoveredId(sample.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Original Image */}
              <img
                src={sample.original}
                alt={`Original ${sample.title}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              {/* Colorized Image Overlay */}
              <div
                className="absolute inset-0 w-full h-full transition-transform duration-500 ease-in-out"
                style={{
                  transform: hoveredId === sample.id ? 'translateX(0)' : 'translateX(-100%)'
                }}
              >
                <img
                  src={sample.colorized}
                  alt={`Colorized ${sample.title}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Title Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-white font-semibold text-lg">
                  {sample.title}
                </h3>
                <p className="text-gray-300 text-sm">
                  Hover to see colorized version
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 