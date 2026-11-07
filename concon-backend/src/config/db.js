const mongoose = require("mongoose");
const { mongoUri } = require("./env");
const logger = require("../utils/logger");

async function connectDB() {
    await mongoose.connect(mongoUri);
    logger.info("MongoDB Connected.");
}

module.exports = connectDB;