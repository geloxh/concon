const { z } = require("zod");

const sendMessageSchema = z.object({
  conversationId: z.string().min(1),
  contentType: z.enum(["text", "image", "file", "video"]),
  content: z.object({
    text: z.string().max(5000).optional(),
    url: z.string().url().optional(),
    mimeType: z.string().optional(),
    size: z.number().optional(),
  }),
});

const getMessagesQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});

module.exports = { sendMessageSchema, getMessagesQuerySchema };