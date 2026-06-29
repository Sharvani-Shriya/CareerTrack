// config/db.js
// This file connects our application to the MongoDB database using Mongoose.

const mongoose = require('mongoose');

// connectDB is an async function that establishes the MongoDB connection
const connectDB = async () => {
  try {
    // mongoose.connect returns a promise, we await it
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/careertrack');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Exit process with failure if DB connection fails
    process.exit(1);
  }
};

module.exports = connectDB;
