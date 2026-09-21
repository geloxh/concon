const express = require("express");
const { getMe, updateProfile, searchUsers, getUserById } = require("../controllers/user.controller");
const authenticate = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(authenticate);

router.get("/me", getMe);
router.patch("/me", updateProfile);
router.get("/search", searchUsers);
router.get("/:id", getUserById);

module.exports = router;