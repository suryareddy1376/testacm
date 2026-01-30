const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kare_acm_sigbed';
        
        const conn = await mongoose.connect(mongoURI, {
            // These options are no longer needed in Mongoose 6+
            // but included for compatibility
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed due to app termination');
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        console.log('📌 Continuing without database - using in-memory storage');
        
        // Set flag to use in-memory storage
        global.useInMemoryStorage = true;
    }
};

module.exports = connectDB;
