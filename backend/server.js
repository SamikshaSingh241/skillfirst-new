const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes Imports
const aiRoutes = require('./routes/ai');
app.use('/api/ai', aiRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillfirst', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['candidate', 'admin', 'recruiter'] },
  verified: { type: Boolean, default: false },
  skillScore: Number,
  experience: String,
  scoreHistory: [Number],
});

const User = mongoose.model('User', userSchema);

// Routes
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, experience, skillScore } = req.body;
    
    // Normalize email
    const normEmail = email.toLowerCase().trim();

    // Check if user already exists (case-insensitive)
    const existingUser = await User.findOne({ email: new RegExp('^' + normEmail + '$', 'i') });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email: normEmail,
      password: hashedPassword,
      role: role || 'candidate',
      experience,
      skillScore: skillScore || 0,
      scoreHistory: []
    });

    await user.save();

    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1h' }
    );

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
        skillScore: user.skillScore,
        experience: user.experience,
        scoreHistory: user.scoreHistory
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user (case-insensitive)
    const normEmail = email.trim();
    const user = await User.findOne({ email: new RegExp('^' + normEmail + '$', 'i') });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check if password matches. Also allow plain text comparison for legacy seeded users
    let isMatch = false;
    if (user.password && user.password.startsWith('$2')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = password === user.password;
    }

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '10h' }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
        skillScore: user.skillScore,
        experience: user.experience,
        scoreHistory: user.scoreHistory
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add more routes as needed

// Update User (Scores & Profile)
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { experience, skillScore, scoreHistory, verified } = req.body;
    
    // Construct the update object strictly limiting what can be modified
    // You could also add Authorization middleware here eventually
    const updateData = {};
    if (experience !== undefined) updateData.experience = experience;
    if (skillScore !== undefined) updateData.skillScore = skillScore;
    if (scoreHistory !== undefined) updateData.scoreHistory = scoreHistory;
    if (verified !== undefined) updateData.verified = verified;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});