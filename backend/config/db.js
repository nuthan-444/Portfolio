import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/MyPortfolio';
    
    if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
      mongoUri = 'mongodb://127.0.0.1:27017/MyPortfolio';
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[DB] MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`[DB Warning] MongoDB Connection Failed (${error.message}).`);
    return false;
  }
};

