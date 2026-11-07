const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const routes = require("./routes");
const { corsOrigin } = require("./config/env");
const { errorMiddleware, notFoundMiddleware } = require("./middlewares/error.middleware");
const { generalLimiter } = require("./middlewares/rateLimiter.middleware");

const app = express();

if (process.env.TRUST_PROXY) {
  const v = process.env.TRUST_PROXY;
  app.set("trust proxy", /^\d=$/.test(v) ? Number(v) : v);
}

app.use(helmet());
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/health", (req, res) => res.json({ status: "ok", uptime: process.uptime() }));

app.use(generalLimiter);
app.use("/api/v1", routes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;