const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        let uri = process.env.MONGO_URI;

        // If the database URI is still untouched or missing, create an in-memory database automatically!
        if (!uri || uri.includes('your_username:your_password') || uri.includes('your_cluster')) {
            console.log('⚠️ No valid MONGO_URI detected. Starting an isolated local memory database purely for testing...');
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongoServer = await MongoMemoryServer.create();
            uri = mongoServer.getUri();
        }

        const conn = await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    }
};

module.exports = connectDB;
