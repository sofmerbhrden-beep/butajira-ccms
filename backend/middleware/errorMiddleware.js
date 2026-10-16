export function notFound(req, res, next) {
  res.status(404).json({ message: `Not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {

  const status = res.statusCode !== 200 ? res.statusCode : 500;
  console.error(err);
  let message = err.message || "Server error";
  let finalStatus = status >= 400 ? status : 500;

  if (err.name === "ValidationError") {
    finalStatus = 400;
    const firstError = Object.values(err.errors)[0];
    if (firstError) {
      if (firstError.kind === "required") {
        message = "Please fill in all required fields.";
      } else if (firstError.kind === "enum") {
        message = `Invalid option selected for ${firstError.path.split('.').pop()}.`;
      } else {
        message = "Please check your inputs and try again.";
      }
    } else {
      message = "Validation failed. Please check your inputs.";
    }
  }

  res.status(finalStatus).json({
    message,
  });
}
