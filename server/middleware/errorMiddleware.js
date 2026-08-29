export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found - ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Prisma known request errors carry a stable code.
  switch (err.code) {
    case "P2002": // unique constraint
      statusCode = 400;
      message = `Duplicate value for: ${err.meta?.target?.join(", ") || "field"}`;
      break;
    case "P2025": // record required but not found
      statusCode = 404;
      message = "Resource not found";
      break;
    case "P2003": // foreign key constraint
      statusCode = 400;
      message = "Related record does not exist";
      break;
    default:
      break;
  }

  // Malformed UUID or wrong argument type reaching the query engine.
  if (err.name === "PrismaClientValidationError") {
    statusCode = 400;
    message = "Invalid request data";
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};
