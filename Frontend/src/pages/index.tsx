import React from 'react';
import HeroSection from '../components/HeroSection';
import HowItWorks from '../components/HowItWorks';
import SampleGallery from '../components/SampleGallery';

export default function Home() {
  return (
    <div className="w-full">
      <HeroSection />
      <HowItWorks />
      <SampleGallery />
    </div>
  );
}