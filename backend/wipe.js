require('dotenv').config();
const mongoose = require('mongoose');

async function wipeDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    await mongoose.connection.dropDatabase();
    console.log('Database wiped successfully');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

wipeDB();
