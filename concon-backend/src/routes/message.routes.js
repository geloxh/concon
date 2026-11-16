const express = require("express");
const { getMessages, sendMessage, markRead } = require("../controllers/message.controller");
const authenticate = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { messageLimiter } = require("../middlewares/rateLimiter.middleware");
const { 
    sendMessageSchema, 
    conversationParamsSchema,
    getMessagesQuerySchema,
} = require("../validators/message.validator");
const { z } = require("zod");
const { objectId } = require("../validators/common.validator");

const router = express.Router();

router.use(authenticate);

router.post("/", messageLimiter, validate(sendMessageSchema), sendMessage);

router.get(
    "/:conversationId", 
    validate(conversationParamsSchema, "params"),
    validate(getMessagesQuerySchema, "query"), 
    getMessages
);
router.post("/:conversationId/read",
    validate(conversationParamsSchema, "params"),
    validate(z.object({ messageId: objectId })), 
    markRead
);

module.exports = router;