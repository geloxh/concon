const express = require("express");
const { getPresignedUrl } = require("../controllers/upload.controller");
const authenticate = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { presignSchema } = require("../validators/upload.validator");

const router = express.Router();

router.post("/presign", authenticate, validate(presignSchema), getPresignedUrl);

module.exports = router;