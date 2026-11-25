import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async (mongoUri) => {
  if (isConnected) return true;

  try {
    const uri =
      mongoUri ||
      'mongodb://127.0.0.1:27017/MyPortfolio';

    if (
      !uri.startsWith('mongodb://') &&
      !uri.startsWith('mongodb+srv://')
    ) {
      console.warn('[DB] Invalid MONGODB_URI format.');
      return false;
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false, // Required for serverless/edge environments
    });

    isConnected = true;
    console.log(`[DB] MongoDB Connected: ${mongoose.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`[DB Warning] MongoDB Connection Failed: ${error.message}`);
    isConnected = false;
    return false;
  }
};
