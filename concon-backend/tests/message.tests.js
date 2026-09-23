const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../src/app");

let mongoServer;
let accessToken;
let conversationId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const registerRes = await request(app).post("/api/v1/auth/register").send({
    username: "msguser1",
    email: "msg1@example.com",
    password: "password123",
  });
  accessToken = registerRes.body.data.accessToken;

  const otherUser = await request(app).post("/api/v1/auth/register").send({
    username: "msguser2",
    email: "msg2@example.com",
    password: "password123",
  });

  const convoRes = await request(app)
    .post("/api/v1/conversations")
    .set("Authorization", `Bearer ${accessToken}`)
    .send({ type: "direct", participants: [otherUser.body.data.user.id] });

  conversationId = convoRes.body.data.conversation._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Messages", () => {
  it("sends a text message", async () => {
    const res = await request(app)
      .post("/api/v1/messages")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        conversationId,
        contentType: "text",
        content: { text: "Hello there" },
      });

    expect(res.status).toBe(201);
    expect(res.body.data.message.content.text).toBe("Hello there");
  });

  it("fetches messages with pagination", async () => {
    const res = await request(app)
      .get(`/api/v1/messages/${conversationId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("rejects unauthenticated requests", async () => {
    const res = await request(app).get(`/api/v1/messages/${conversationId}`);
    expect(res.status).toBe(401);
  });
});