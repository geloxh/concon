const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../src/app");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Auth", () => {
  it("registers a new user", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it("rejects duplicate email", async () => {
    await request(app).post("/api/v1/auth/register").send({
      username: "user2",
      email: "dupe@example.com",
      password: "password123",
    });

    const res = await request(app).post("/api/v1/auth/register").send({
      username: "user3",
      email: "dupe@example.com",
      password: "password123",
    });

    expect(res.status).toBe(409);
  });

  it("logs in with correct credentials", async () => {
    await request(app).post("/api/v1/auth/register").send({
      username: "loginuser",
      email: "login@example.com",
      password: "password123",
    });

    const res = await request(app).post("/api/v1/auth/login").send({
      email: "login@example.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it("rejects wrong password", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "login@example.com",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
  });
});