const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        let uri = process.env.MONGO_URI;

        // Force a usable URI if missing or placeholder
        const isPlaceholder = !uri || 
                            uri === "" || 
                            uri.includes('your_username:your_password') || 
                            uri.includes('your_cluster');

        if (isPlaceholder) {
            console.warn('⚠️ No valid MONGO_URI detected. Attempting to use Local MongoDB fallback...');
            // Try connecting to a default local instance if Atlas isn't configured
            uri = 'mongodb://127.0.0.1:27017/intellihire'; 
        }

        console.log(`[DB] Attempting connection to: ${uri.split('@').pop()}`); // Log sanitized URI
        
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000, // Fail fast if no server is available
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        
        // If local also fails, explain what to do
        if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('your_username')) {
            console.error('👉 TIP: Please add a valid MONGO_URI to your server/.env file or ensure a local MongoDB is running.');
        }
        
        // We don't exit process here because we want the app to potentially show 500s 
        // with descriptive error messages rather than just crashing silently.
    }
};

module.exports = connectDB;

