const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const routes = require("./routes");
const { errorMiddleware, notFoundMiddleware } = require("./middlewares/error.middleware");
const { generalLimiter } = require("./middlewares/rateLimiter.middleware");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGINS?.split(",") || "*",
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(generalLimiter);

app.get("/health", (req, res) => res.json({ status: "ok", uptime: process.uptime() }));

app.use("/api/v1", routes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;