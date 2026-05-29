const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

async function run() {
  let log = '';
  try {
    log += `URI: ${process.env.MONGODB_URI}\n`;
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    log += 'Connected!\n';
    
    const count = await mongoose.connection.db.collection('users').countDocuments();
    log += `Users count: ${count}\n`;
  } catch (err) {
    log += `Error: ${err.message}\n`;
  } finally {
    fs.writeFileSync('db_test_output.txt', log);
    await mongoose.disconnect();
  }
}

run();
