const ApiError = require("../utils/apiError");
const logger = require("../utils/logger");

function errorMiddleware(err, req, res, next) {
  let error = err;

  // Convert known non-ApiError issues into ApiError shape
  if (error.name === "ValidationError") {
    error = new ApiError(400, "Validation failed", error.errors);
  } else if (error.name === "CastError") {
    error = new ApiError(400, `Invalid ${error.path}: ${error.value}`);
  } else if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    error = new ApiError(409, `${field} already exists`);
  } else if (error.name === "JsonWebTokenError") {
    error = new ApiError(401, "Invalid token");
  } else if (error.name === "TokenExpiredError") {
    error = new ApiError(401, "Token expired");
  } else if (!(error instanceof ApiError)) {
    error = new ApiError(500, "Internal server error");
  }

  if (error.statusCode >= 500) {
    logger.error(err.message, { stack: err.stack, path: req.path });
  } else {
    logger.warn(error.message, { path: req.path, statusCode: error.statusCode });
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(error.details && { details: error.details }),
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
}

// Catches routes that don't match anything
function notFoundMiddleware(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
}

module.exports = { errorMiddleware, notFoundMiddleware };