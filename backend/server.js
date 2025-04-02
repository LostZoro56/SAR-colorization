const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5002;

// Model server URL
const MODEL_SERVER_URL = 'http://localhost:8082';

// Middleware
app.use(cors());
app.use(express.json());

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Routes
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Create form data for model server
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    console.log('Forwarding to model server...');
    // Forward the image to the model server
    const modelResponse = await axios.post(`${MODEL_SERVER_URL}/process`, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    console.log('Model server response:', modelResponse.data);

    // Clean up uploaded file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting file:', err);
    });

    // Return the colorized image URL directly from the model server
    res.json({
      message: 'Image processed successfully',
      colorizedImageUrl: modelResponse.data.imageUrl
    });
  } catch (error) {
    console.error('Error processing image:', error);
    
    // Clean up uploaded file
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    
    res.status(500).json({ error: 'Error processing image: ' + error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});