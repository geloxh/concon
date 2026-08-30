const mongoose = require("mongoose");
const { mongoUri } = require("./env");

async function connectDB() {
    await mongoose.connect(mongoUri);
    console.log("MongoDB Connected.");
}

module.exports = connectDB;