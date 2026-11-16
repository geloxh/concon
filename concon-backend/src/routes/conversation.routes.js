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
const { idParamSchema } = require("../validators/common.validator");

const { 
  createConversationSchema,
  addParticipantSchema,
  participantParamsSchema,
} = require("../validators/conversation.validator");

const router = express.Router();

router.use(authenticate);

router.post("/", validate(createConversationSchema), createConversation);
router.get("/", getMyConversations);
router.get("/:id", validate(idParamSchema, "params"), getConversationId);
router.post("/:id/participants", validate(idParamSchema, "params"), validate(addParticipantSchema), addParticipant);
router.delete("/:id/participants/:userId", validate(participantParamsSchema, "params"), removeParticipant);

module.exports = router;