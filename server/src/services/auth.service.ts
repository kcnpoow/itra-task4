import bcrypt from "bcrypt";

import { tokenService } from "./token.service";
import { pool } from "../config/db";
import type { LoginRequest } from "../types/login-request";
import { ApiError } from "../errors/api.error";
import type { User } from "../models/user";
import { userService } from "./user.service";

class AuthService {
  async login({ email, password }: LoginRequest) {
    const users = await pool.query(
      `
      SELECT 
        user_id as "id", 
        first_name as "firstName", 
        last_name as "lastName", 
        position, 
        email, 
        last_seen_at as "lastSeenAt", 
        password as "passwordHash",
        is_blocked as "isBlocked",
        is_verified as "isVerified"
      FROM users 
      WHERE email = LOWER($1)
      `,
      [email],
    );

    const row = users.rows[0];

    if (!row) {
      throw ApiError.Unauthorized();
    }

    const { passwordHash, ...user } = row as User & {
      passwordHash: string;
    };

    const isPasswordValid = await bcrypt.compare(password, passwordHash);
    if (!isPasswordValid) {
      throw ApiError.Unauthorized();
    }

    if (user.isBlocked) {
      throw ApiError.Forbidden();
    }

    const accessToken = tokenService.signAccessToken({ userId: user.id });
    const refreshToken = tokenService.signRefreshToken({ userId: user.id });

    await pool.query(
      `
      UPDATE users 
      SET last_seen_at = NOW() 
      WHERE user_id = $1
      `,
      [user.id],
    );

    return { user, refreshToken, accessToken };
  }

  async auth(refreshToken: string) {
    if (!refreshToken) {
      throw ApiError.Unauthorized("Refresh token required");
    }

    const payload = tokenService.validateRefreshToken(refreshToken);

    if (!payload) {
      throw ApiError.Unauthorized("Invalid refresh token");
    }

    const user = await userService.getUser(payload.userId);

    if (!user) {
      throw ApiError.Unauthorized("User not found");
    }

    if (user.isBlocked) {
      throw ApiError.Forbidden("User is blocked");
    }

    const accessToken = tokenService.signAccessToken({ userId: user.id });

    await pool.query(
      `
      UPDATE users 
      SET last_seen_at = NOW() 
      WHERE user_id = $1
      `,
      [user.id],
    );

    return { user, accessToken };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw ApiError.Unauthorized("Refresh token required");
    }

    const payload = tokenService.validateRefreshToken(refreshToken);

    if (!payload) {
      throw ApiError.Unauthorized("Invalid refresh token");
    }

    const user = await userService.getUser(payload.userId);

    if (!user) {
      throw ApiError.Unauthorized("User not found");
    }

    if (user.isBlocked) {
      throw ApiError.Forbidden("User is blocked");
    }

    const accessToken = tokenService.signAccessToken({ userId: user.id });

    return { user, accessToken };
  }

  async verifyEmail(verificationToken: string): Promise<User> {
    if (!verificationToken) {
      throw ApiError.BadRequest("Verification token required");
    }

    const result = await pool.query(
      `
      SELECT user_id as id
      FROM email_verification_tokens
      WHERE token = $1
      `,
      [verificationToken],
    );

    const user = result.rows[0];

    if (!user) {
      throw ApiError.BadRequest("Invalid verification token");
    }

    await pool.query(
      `
      UPDATE users
      SET is_verified = TRUE
      WHERE user_id = $1
      `,
      [user.id],
    );

    await pool.query(
      `
      DELETE FROM email_verification_tokens
      WHERE user_id = $1
      `,
      [user.id],
    );

    return user;
  }
}

export const authService = new AuthService();
