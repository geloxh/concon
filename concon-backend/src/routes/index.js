const express = require("express");
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const conversationRoutes = require("./conversation.routes");
const messageRoutes = require("./message.routes");
const uploadRoutes = require("./upload.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/conversations", conversationRoutes);
router.use("/messages", messageRoutes);
router.use("/upload", uploadRoutes);

module.exports = router;