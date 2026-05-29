const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  try {
    console.log('Connecting to:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully!');
    
    const count = await mongoose.connection.db.collection('users').countDocuments();
    console.log('Users collection count:', count);
    
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log('Users:');
    users.forEach(u => console.log(' -', u.email, u.password));

  } catch (err) {
    console.error('Error connecting or working with DB:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

run();
