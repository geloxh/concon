const ApiError = require("../utils/apiError");

// Validates req.body / req.query / req.params with a Zod schema and replaces it with the parsed data.
function validate(schema, source = "body") {
  return (req, res, next) => {
    const result = schema.safeParse(req[source] ?? {}); // Express 5: req.body is undefined when no body was sent

    if (!result.success) {
      const details = result.error.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return next(new ApiError(400, "Validation failed", details));
    }

    // Express 5 makes req.query a getter-only property, so plain assignment is silently ignored.
    Object.defineProperty(req, source, {
      value: result.data,
      writable: true,
      configurable: true,
      enumerable: true,
    });
    next();
  };
}

module.exports = validate;