// Wraps async controllers so rejected promises reach the error middleware
// instead of crashing the process or requiring try/catch in every controller.
function catchAsync(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = catchAsync;