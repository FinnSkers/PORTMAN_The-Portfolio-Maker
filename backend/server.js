// Minimal Express server for CV-to-Dynamic-Website Generator
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running.' });
});

// CV upload endpoint (dynamic)
app.post('/api/upload-cv', upload.single('cv'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  // TODO: Parse the file and extract data dynamically
  res.json({ message: `File ${req.file.originalname} uploaded successfully!`, file: req.file });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
