import type { Request, Response, NextFunction } from "express";

import { ApiError } from "../errors/api.error";
import { userService } from "../services/user.service";
import { tokenService } from "../services/token.service";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw ApiError.Unauthorized("Authorization header missing");
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw ApiError.Unauthorized("Invalid authorization format");
    }

    const payload = tokenService.validateAccessToken(token);

    if (!payload) {
      throw ApiError.Unauthorized("Invalid token");
    }

    const user = await userService.getUser(Number(payload.userId));

    if (!user) {
      throw ApiError.Unauthorized("User not found");
    }

    if (user.isBlocked) {
      throw ApiError.Unauthorized();
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
