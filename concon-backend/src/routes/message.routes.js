const express = require("express");
const { getMessages, sendMessage } = require("../controllers/message.controller");
const authenticate = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { messageLimiter } = require("../middlewares/rateLimiter.middleware");
const { sendMessageSchema, getMessagesQuerySchema } = require("../validators/message.validator");

const router = express.Router();

router.use(authenticate);

router.get("/:conversationId", validate(getMessagesQuerySchema, "query"), getMessages);
router.post("/", messageLimiter, validate(sendMessageSchema), sendMessage);

module.exports = router;