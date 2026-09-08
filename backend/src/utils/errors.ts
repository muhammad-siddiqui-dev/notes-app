export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Invalid request data.") {
    super(message, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required.") {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Access denied.") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found.`, 404);
  }
}

export class InternalServerError extends AppError {
  constructor(message = "An unexpected error occurred.") {
    super(message, 500, false);
  }
}

export const handleError = (err: unknown, context?: string): AppError => {
  if (err instanceof AppError) {
    return err;
  }
  // Avoid exposing internal error details (security best practice)
  const safeMessage = (err instanceof Error && err.message) ? err.message : "Internal server error.";
  // Log structured error details (Principle V) without exposing to client
  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "error",
      message: safeMessage,
      context: context || "unknown",
      isOperational: false
    })
  );
  return new InternalServerError();
};
