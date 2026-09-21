const express = require("express");
const {
  createConversation,
  getMyConversations,
  getConversationById,
  addParticipant,
  removeParticipant,
} = require("../controllers/conversation.controller");
const authenticate = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { createConversationSchema } = require("../validators/conversation.validator");

const router = express.Router();

router.use(authenticate);

router.post("/", validate(createConversationSchema), createConversation);
router.get("/", getMyConversations);
router.get("/:id", getConversationById);
router.post("/:id/participants", addParticipant);
router.delete("/:id/participants/:userId", removeParticipant);

module.exports = router;