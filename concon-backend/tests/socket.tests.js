const http = require("http");
const { io: ioClient } = require("socket.io-client");
const initSocket = require("../src/sockets");
const jwt = require("jsonwebtoken");

describe("Socket.io messaging", () => {
  let server, clientSocket, port;
  const userId = "507f1f77bcf86cd799439011";
  const token = jwt.sign({ sub: userId }, process.env.JWT_SECRET || "test_secret");

  beforeAll((done) => {
    server = http.createServer();
    initSocket(server).then(() => {
      server.listen(() => {
        port = server.address().port;
        done();
      });
    });
  });

  afterAll(() => {
    server.close();
    clientSocket?.close();
  });

  it("connects with a valid token", (done) => {
    clientSocket = ioClient(`http://localhost:${port}`, {
      auth: { token },
    });

    clientSocket.on("connect", () => {
      expect(clientSocket.connected).toBe(true);
      done();
    });
  });

  it("rejects connection without a token", (done) => {
    const badSocket = ioClient(`http://localhost:${port}`, { auth: {} });

    badSocket.on("connect_error", (err) => {
      expect(err.message).toBe("Unauthorized");
      badSocket.close();
      done();
    });
  });
});