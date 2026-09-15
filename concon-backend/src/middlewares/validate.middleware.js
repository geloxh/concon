const ApiError = require("../utils/apiError");

// Wraps a Zod schema; validates req.body (or query/params) and normalizes errors
function validate(schema, source = "body") {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return next(new ApiError(400, "Validation failed", details));
    }

    req[source] = result.data; // parsed/sanitized data replaces raw input
    next();
  };
}

module.exports = validate;