/**
 * Request logger middleware
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.originalUrl} - Status: ${res.statusCode} - ${duration}ms`
    );
  });
  
  next();
};

module.exports = requestLogger;

