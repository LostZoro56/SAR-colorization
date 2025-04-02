import React from 'react';
import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const teamMembers = [
  {
    name: "Vaibhav Sharma",
    role: "Lead Developer",
    image: "/team/vaibhav.jpg",
    bio: "Passionate about computer vision and deep learning"
  },
  {
    name: "Team Member 2",
    role: "ML Engineer",
    image: "/team/member2.jpg",
    bio: "Expert in SAR image processing"
  },
  {
    name: "Team Member 3",
    role: "Frontend Developer",
    image: "/team/member3.jpg",
    bio: "Specialized in modern web technologies"
  }
];

const features = [
  {
    title: "Advanced SAR Processing",
    description: "Utilizing state-of-the-art deep learning models for accurate SAR image colorization",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    title: "Real-time Processing",
    description: "Fast and efficient image processing pipeline for quick results",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  {
    title: "High Accuracy",
    description: "Achieving remarkable accuracy in SAR image colorization",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-white mb-4">About SAR Colorization</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Transforming SAR images into vibrant, colorized visualizations using cutting-edge AI technology
          </p>
        </motion.div>

        {/* Project Overview */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="bg-gray-800/30 rounded-xl p-6 shadow-lg backdrop-blur-sm border border-gray-700"
            >
              <div className="text-blue-500 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* How It Works */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-800/30 rounded-xl p-6 shadow-lg backdrop-blur-sm border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">The Process</h3>
              <ol className="space-y-4 text-gray-300">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white mr-3">1</span>
                  Upload your SAR image through our intuitive interface
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white mr-3">2</span>
                  Our AI model analyzes the image structure and patterns
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white mr-3">3</span>
                  Advanced algorithms generate accurate color mappings
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white mr-3">4</span>
                  Download your colorized image in high resolution
                </li>
              </ol>
            </div>
            <div className="bg-gray-800/30 rounded-xl p-6 shadow-lg backdrop-blur-sm border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Technology Stack</h3>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Deep Learning Models for Image Processing
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  React & Next.js for Frontend
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Python Backend with FastAPI
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Cloud Infrastructure for Scalability
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-gray-800/30 rounded-xl p-6 shadow-lg backdrop-blur-sm border border-gray-700 text-center"
              >
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-blue-500">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{member.name}</h3>
                <p className="text-blue-400 mb-2">{member.role}</p>
                <p className="text-gray-300">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 