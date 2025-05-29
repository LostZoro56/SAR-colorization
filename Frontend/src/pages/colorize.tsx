import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { uploadAndProcessImage } from '../services/api';

export default function ColorizePage() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
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

  const handleProcess = async () => {
    if (!image) return;
    
    setIsProcessing(true);
    setError(null);
    
    // Start progress simulation
    let progress = 0;
    const randomTime = Math.floor(Math.random() * (45 - 25 + 1)) + 25;
    const progressInterval = setInterval(() => {
      progress += 100 / (randomTime * 2); // Update twice per second
      if (progress >= 100) {
        progress = 99; // Cap at 99% until actual completion
        clearInterval(progressInterval);
      }
      setProcessingProgress(progress);
    }, 500);

    try {
      const result = await uploadAndProcessImage(image);
      setProcessingProgress(100);
      setProcessedImage(result);
    } catch (err) {
      console.error('Error processing image:', err);
      setError(err instanceof Error ? err.message : 'Failed to process image. Please try again.');
    } finally {
      clearInterval(progressInterval);
      setIsProcessing(false);
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
          Process Your Image
        </h1>
        <p className="text-gray-300 text-lg">
          Upload your image and see it transformed
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
          <p className="text-sm text-gray-400">Supports PNG, JPG, JPEG</p>
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
              <h3 className="text-lg font-semibold mb-2 text-white">Processed Image</h3>
              <img
                src={processedImage}
                alt="Processed"
                className="w-full rounded-lg shadow-lg"
              />
              <a
                href={processedImage}
                download={`colorized-image-${new Date().getTime()}.png`}
                className="mt-4 block w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-2 px-4 rounded-lg font-semibold text-center hover:shadow-lg hover:shadow-green-500/25 transition-all"
              >
                Download Image
              </a>
            </div>
          )}
        </div>

        {image && !isProcessing && !processedImage && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleProcess}
            className="mt-8 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
          >
            Process Image
          </motion.button>
        )}

        {isProcessing && (
          <div className="mt-8 text-center">
            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${processingProgress}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              <p className="text-gray-300">
                Generating image... {Math.round(processingProgress)}%
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}