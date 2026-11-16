const express = require("express");
const { register, login, refresh, logout } = require("../controllers/auth.controller");
const validate = require("../middlewares/validate.middleware");
const authenticate = require("../middlewares/auth.middleware");
const { authLimiter } = require("../middlewares/rateLimiter.middleware");
const { registerSchema, loginSchema, refreshSchema } = require("../validators/auth.validator");

const router = express.Router();

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/refresh", validate(refreshSchema), refresh);
// Logout works with an expired access token, as long as the refresh token is presented
router.post("/logout", validate(refreshSchema), logout);

module.exports = router;