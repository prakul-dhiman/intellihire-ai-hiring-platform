import mongoose from 'mongoose';
import { getConfig } from './validate.js';

const connectDB = async () => {
  try {
    const config = getConfig();
    
    const conn = await mongoose.connect(
      config.database.uri,
      config.database.options
    );

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Set up connection event listeners
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB Disconnected');
    });

    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB Connection Error:', error.message);
    });

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
