const { z } = require("zod");

const createConversationSchema = z.object({
  type: z.enum(["direct", "group"]),
  participants: z.array(z.string()).min(1),
  groupName: z.string().min(1).max(100).optional(),
}).refine(
  (data) => data.type === "direct" || (data.type === "group" && data.groupName),
  { message: "groupName is required for group conversations" }
);

module.exports = { createConversationSchema };