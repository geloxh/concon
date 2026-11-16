const express = require("express");
const { getMe, updateProfile, searchUsers, getUserById } = require("../controllers/user.controller");
const authenticate = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { updateProfileSchema, searchUsersQuerySchema } = require("../validators/user.validator");
const { idParamSchema } = require("../validators/common.validator");

const router = express.Router();

router.use(authenticate);

router.get("/me", getMe);
router.patch("/me", validate(updateProfileSchema), updateProfile);
router.get("/search", validate(searchUsersQuerySchema, "query"), searchUsers);
router.get("/:id", validate(idParamSchema, "params"), getUserById);

module.exports = router;
