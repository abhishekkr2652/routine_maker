require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    let admin = await User.findOne({ username: 'admin' });
    if (admin) {
      console.log('Admin already exists. Skipping.');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin', salt);

    admin = new User({
      username: 'admin',
      password: hashedPassword,
      department: 'Main Administration',
      role: 'main_admin'
    });

    await admin.save();
    console.log('Main Admin successfully created!');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

seedAdmin();
