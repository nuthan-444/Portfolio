import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const createAdmin = async () => {
  const args = process.argv.slice(2);
  const email = args[0];
  const password = args[1];

  if (!email || !password) {
    console.log('Usage: node scripts/createAdmin.js <email> <password>');
    console.log('Example: node scripts/createAdmin.js admin@mycompany.com mySecretPass123');
    process.exit(1);
  }

  try {
    let mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/MyPortfolio';
    if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
      mongoUri = 'mongodb://127.0.0.1:27017/MyPortfolio';
    }

    await mongoose.connect(mongoUri);
    console.log('[DB] Connected to MongoDB...');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        name: 'Admin User',
        email: email.toLowerCase(),
        password: hashedPassword,
        isAdmin: true,
      },
      { upsert: true, new: true }
    );

    console.log(`[Success] Admin user created/updated successfully!`);
    console.log(`Email: ${user.email}`);
    console.log(`Admin Status: ${user.isAdmin}`);
    process.exit(0);
  } catch (err) {
    console.error('[Error] Failed to create admin user:', err.message);
    process.exit(1);
  }
};

createAdmin();
