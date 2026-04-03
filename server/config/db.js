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
            console.error('❌ FATAL: No valid MONGO_URI detected.');
            console.error('👉 TIP: Please add your MongoDB Atlas connection string to the .env file.');
            throw new Error('Database connection string missing or invalid.');
        }

        console.log(`[DB] Attempting connection to Atlas Cluster...`);
        
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000, // Fail fast (5s) instead of buffering for 30s
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Database connection failed: ${error.message}`);
        throw error; // Re-throw so the server startup logic knows to stop
    }
};

module.exports = connectDB;


