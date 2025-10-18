// create  error class for our custom errors
class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string | undefined, stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.stack = stack;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
