const mongoose = require('mongoose');
require('dotenv').config();

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

const users = [
  {
    name: "Rahul Sharma",
    email: "rahul@test.com",
    password: "1234",
    role: "candidate",
    verified: true,
    skillScore: 75,
    experience: "2 Years – Web Dev",
    scoreHistory: [60, 75],
  },
  {
    name: "Priya Patel",
    email: "priya@test.com",
    password: "1234",
    role: "candidate",
    verified: false,
    skillScore: 92,
    experience: "4 Years – Data Science",
    scoreHistory: [85, 92],
  },
  {
    name: "Arjun Singh",
    email: "arjun@test.com",
    password: "1234",
    role: "candidate",
    verified: true,
    skillScore: 88,
    experience: "3 Years – Full Stack",
    scoreHistory: [70, 80, 88],
  },
  {
    name: "Admin User",
    email: "admin@test.com",
    password: "1234",
    role: "admin",
  },
  {
    name: "Recruiter User",
    email: "hr@test.com",
    password: "1234",
    role: "recruiter",
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillfirst');
    await User.deleteMany(); // Clear existing
    await User.insertMany(users);
    console.log('Database seeded');
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
}

seed();