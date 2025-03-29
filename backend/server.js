const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure upload and colorized directories exist
const uploadDir = path.join(__dirname, 'uploads');
const colorizedDir = path.join(__dirname, 'colorized');
fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(colorizedDir, { recursive: true });

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
app.post('/api/upload', upload.single('image'), async (req, res) => {
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

    // Forward the image to the model server
    const modelResponse = await axios.post('http://localhost:8000/process', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    // Store the colorized image URL
    const colorizedImageUrl = modelResponse.data.imageUrl;

    res.json({
      message: 'Image uploaded successfully',
      jobId: req.file.filename,
      colorizedImageUrl
    });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'Error processing image: ' + error.message });
  }
});

app.get('/api/status/:jobId', (req, res) => {
  const { jobId } = req.params;
  // Check if the colorized image exists
  const colorizedPath = path.join(colorizedDir, jobId);
  if (fs.existsSync(colorizedPath)) {
    res.json({
      status: 'completed',
      imageUrl: `/api/processed/${jobId}`
    });
  } else {
    res.json({ status: 'processing' });
  }
});

app.get('/api/processed/:jobId', (req, res) => {
  const { jobId } = req.params;
  const imagePath = path.join(colorizedDir, jobId);
  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    res.status(404).json({ error: 'Image not found' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 