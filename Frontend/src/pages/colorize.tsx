import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5002/api';

export default function ColorizePage() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setProcessedImage(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1
  });

  const handleColorize = async () => {
    if (!image) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', image);

      console.log('Uploading image to backend...');
      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
          console.log(`Upload progress: ${percentCompleted}%`);
        },
      });

      console.log('Upload response:', response.data);
      if (response.data.colorizedImageUrl) {
        setProcessedImage(response.data.colorizedImageUrl);
        setIsProcessing(false);
      } else {
        throw new Error('No colorized image URL in response');
      }
    } catch (err) {
      console.error('Upload error:', err);
      if (axios.isAxiosError(err)) {
        if (err.response) {
          setError(`Server error: ${err.response.data.error || 'Failed to upload image'}`);
        } else if (err.request) {
          setError('No response from server. Please check if the backend is running.');
        } else {
          setError(`Error: ${err.message}`);
        }
      } else {
        setError('Failed to upload image. Please try again.');
      }
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!processedImage) return;
    
    try {
      // Extract filename from URL
      const filename = processedImage.split('/').pop() || 'colorized_image.jpg';
      
      // Create a link and trigger download
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download image');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-white mb-4">
          Colorize Your SAR Image
        </h1>
        <p className="text-gray-300 text-lg">
          Upload your SAR image and watch it transform into a vibrant, colorized visualization
        </p>
      </motion.div>

      <div className="max-w-2xl mx-auto">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-blue-500'}`}
        >
          <input {...getInputProps()} />
          <p className="text-lg mb-2 text-white">
            {isDragActive ? 'Drop the image here' : 'Drag & drop an image here, or click to select'}
          </p>
          <p className="text-sm text-gray-400">Supports PNG, JPG, JPEG (max 10MB)</p>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 text-red-400 rounded-lg border border-red-500">
            {error}
          </div>
        )}

        <div className="mt-8 grid grid-cols-2 gap-8">
          {preview && (
            <div>
              <h3 className="text-lg font-semibold mb-2 text-white">Original Image</h3>
              <img
                src={preview}
                alt="Original"
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          )}
          
          {processedImage && (
            <div>
              <h3 className="text-lg font-semibold mb-2 text-white">Colorized Image</h3>
              <div className="relative">
                <img
                  src={processedImage}
                  alt="Colorized"
                  className="w-full rounded-lg shadow-lg"
                />
                <button
                  onClick={handleDownload}
                  className="absolute bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Download
                </button>
              </div>
            </div>
          )}
        </div>

        {image && !isProcessing && !processedImage && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleColorize}
            className="mt-8 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
          >
            Colorize Image
          </motion.button>
        )}

        {isProcessing && (
          <div className="mt-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-300">Processing image...</p>
          </div>
        )}
      </div>
    </div>
  );
}