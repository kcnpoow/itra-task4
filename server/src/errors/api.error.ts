export class ApiError extends Error {
  public status: number;

  constructor(message = "Unexpected error", status = 500) {
    super(message);

    this.status = status;
  }

  static BadRequest(message: string) {
    return new ApiError(message, 400);
  }

  static Unauthorized(message = "Unauthorized") {
    return new ApiError(message, 401);
  }

  static NotFound(message = "Not found") {
    return new ApiError(message, 404);
  }

  static Conflict(message = "Conflict") {
    return new ApiError(message, 409);
  }

  static Forbidden(message = "Forbidden") {
    return new ApiError(message, 403);
  }
}
