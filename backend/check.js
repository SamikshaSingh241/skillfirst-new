const mongoose = require('mongoose');
require('dotenv').config();

// Simple schema to read anything from User collection
const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find({ email: /vishnu/i });
    console.log("Users found:", JSON.stringify(users, null, 2));
  } catch(e) {
    console.error(e);
  } finally {
    mongoose.connection.close();
  }
}

run();
