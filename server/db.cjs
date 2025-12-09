const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '.env') });
const { MongoClient } = require('mongodb');


let db = null;
let client = null;

async function connectDB() {
    if (db) {
        return db;
    }
    
    try {
        client = new MongoClient(process.env.MONGODB_URI, {
            tls: true,
            tlsAllowInvalidCertificates: false,
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
        });
        
        await client.connect();
        db = client.db("affirmation_app");
        console.log("Connected to MongoDB");
        return db;
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        // Reset for retry
        db = null;
        client = null;
        throw error;
    }
}

module.exports = {
    connectDB
};

