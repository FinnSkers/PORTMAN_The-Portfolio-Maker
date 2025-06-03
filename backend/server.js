// Minimal Express server for CV-to-Dynamic-Website Generator
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const { spawn } = require('child_process');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// User schema and model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  createdAt: { type: Date, default: Date.now },
  cvData: Object
});
const User = mongoose.model('User', userSchema);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running.' });
});

// Simple regex-based NLP extraction for demonstration
function extractBasicInfo(text) {
  const nameMatch = text.match(/Name[:\s]+([A-Za-z .'-]+)/i);
  const emailMatch = text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
  const phoneMatch = text.match(/(\+\d{1,3}[- ]?)?\d{10,}/);
  return {
    name: nameMatch ? nameMatch[1].trim() : '',
    email: emailMatch ? emailMatch[0] : '',
    phone: phoneMatch ? phoneMatch[0] : ''
  };
}

// Advanced regex-based NLP extraction for demonstration
function extractAdvancedInfo(text) {
  const nameMatch = text.match(/Name[:\s]+([A-Za-z .'-]+)/i);
  const emailMatch = text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-ZaZ]{2,}/);
  const phoneMatch = text.match(/(\+\d{1,3}[- ]?)?\d{10,}/);
  const educationMatch = text.match(/Education[:\s\n]+([\s\S]*?)(?=\n\w+:|$)/i);
  const experienceMatch = text.match(/Experience[:\s\n]+([\s\S]*?)(?=\n\w+:|$)/i);
  const skillsMatch = text.match(/Skills?[:\s\n]+([\s\S]*?)(?=\n\w+:|$)/i);
  return {
    name: nameMatch ? nameMatch[1].trim() : '',
    email: emailMatch ? emailMatch[0] : '',
    phone: phoneMatch ? phoneMatch[0] : '',
    education: educationMatch ? educationMatch[1].trim() : '',
    experience: experienceMatch ? experienceMatch[1].trim() : '',
    skills: skillsMatch ? skillsMatch[1].trim() : ''
  };
}

// CV upload endpoint (dynamic)
app.post('/api/upload-cv', upload.single('cv'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  const filePath = req.file.path;
  const fileType = req.file.mimetype;
  let extractedText = '';
  try {
    if (fileType === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text;
    } else if (fileType === 'text/plain') {
      extractedText = fs.readFileSync(filePath, 'utf8');
    } else {
      // For DOCX and others, placeholder for future mammoth integration
      extractedText = '[DOCX parsing not yet implemented]';
    }
    // Always call Python microservice for extraction
    const py = spawn('python', ['deepseek_cv_parser.py']);
    let dataString = '';
    py.stdin.write(JSON.stringify({ text: extractedText }));
    py.stdin.end();
    py.stdout.on('data', (data) => { dataString += data.toString(); });
    py.stderr.on('data', (data) => { console.error('DeepSeek CV Parser error:', data.toString()); });
    py.on('close', (code) => {
      try {
        const result = JSON.parse(dataString);
        // Normalize output: ensure all expected fields are present
        const normalized = normalizeCvData(result);
        res.json({ message: `File ${req.file.originalname} uploaded and parsed!`, extractedText, advancedInfo: normalized });
      } catch (e) {
        res.status(500).json({ message: 'Error parsing file', error: e.message });
      }
      fs.unlinkSync(filePath); // Clean up uploaded file
    });
  } catch (err) {
    fs.unlinkSync(filePath);
    res.status(500).json({ message: 'Error parsing file', error: err.message });
  }
});

// Utility: Normalize CV data to ensure all fields are present and arrays are deduped
function normalizeCvData(data) {
  const schema = {
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    website: '',
    summary: '',
    education: [],
    experience: [],
    skills: { technical: [], soft: [], tools: [] },
    projects: [],
    certifications: [],
    languages: { programming: [], spoken: [] }
  };
  // Fill missing fields
  const out = { ...schema, ...data };
  // Deduplicate arrays
  if (out.education && Array.isArray(out.education)) out.education = dedupeArray(out.education);
  if (out.experience && Array.isArray(out.experience)) out.experience = dedupeArray(out.experience);
  if (out.projects && Array.isArray(out.projects)) out.projects = dedupeArray(out.projects);
  if (out.certifications && Array.isArray(out.certifications)) out.certifications = dedupeArray(out.certifications);
  if (out.skills && typeof out.skills === 'object') {
    Object.keys(schema.skills).forEach(k => {
      if (!Array.isArray(out.skills[k])) out.skills[k] = [];
      out.skills[k] = dedupeArray(out.skills[k]);
    });
  }
  if (out.languages && typeof out.languages === 'object') {
    Object.keys(schema.languages).forEach(k => {
      if (!Array.isArray(out.languages[k])) out.languages[k] = [];
      out.languages[k] = dedupeArray(out.languages[k]);
    });
  }
  // Ensure all string fields are strings
  Object.keys(schema).forEach(k => {
    if (typeof schema[k] === 'string' && typeof out[k] !== 'string') out[k] = '';
  });
  return out;
}
function dedupeArray(arr) {
  return Array.from(new Set(arr.map(x => JSON.stringify(x)))).map(x => JSON.parse(x));
}

// New endpoint: advanced NLP extraction using spaCy microservice
app.post('/api/advanced-parse', async (req, res) => {
  const text = req.body.text;
  if (!text) return res.status(400).json({ error: 'No text provided' });  // Call Python microservice
  const py = spawn('python', ['deepseek_cv_parser.py']);
  let dataString = '';
  py.stdin.write(JSON.stringify({ text }));
  py.stdin.end();
  py.stdout.on('data', (data) => { dataString += data.toString(); });
  py.stderr.on('data', (data) => { console.error('DeepSeek CV Parser error:', data.toString()); });
  py.on('close', (code) => {
    try {
      const result = JSON.parse(dataString);
      res.json(result);    } catch (e) {
      res.status(500).json({ error: 'DeepSeek CV Parser service error', details: e.message });
    }
  });
});

// Auth endpoints
app.post('/api/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const user = new User({ email, password, name });
    await user.save();
    res.json({ message: 'User registered' });
  } catch (err) {
    res.status(400).json({ error: 'Registration failed', details: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, user: { email: user.email, name: user.name } });
});

// Middleware for protected routes
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Save user CV data
app.post('/api/save-cv', auth, async (req, res) => {
  const { cvData } = req.body;
  await User.findByIdAndUpdate(req.userId, { cvData });
  res.json({ message: 'CV data saved' });
});

// Get user CV data
app.get('/api/my-cv', auth, async (req, res) => {
  const user = await User.findById(req.userId);
  res.json({ cvData: user.cvData });
});

// Error logging function
function logBackendError(message, details) {
  const logPath = path.join(__dirname, 'backend_errors.log');
  const entry = `[${new Date().toISOString()}] ${message}\n${details ? 'Details: ' + details + '\n' : ''}\n`;
  fs.appendFileSync(logPath, entry, 'utf8');
}

// Global error handler
app.use((err, req, res, next) => {
  logBackendError('Express Unhandled Exception', err.stack || err.message);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
