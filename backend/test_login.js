const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find();
    fs.writeFileSync('out.json', JSON.stringify(users, null, 2));
  } catch(e) {
    fs.writeFileSync('out.json', JSON.stringify({ error: e.message }));
  } finally {
    mongoose.connection.close();
  }
}

run();
