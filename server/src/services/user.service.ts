import { DatabaseError } from "pg";
import bcrypt from "bcrypt";

import { tokenService } from "./token.service";
import { pool } from "../config/db";
import type { RegisterRequest } from "../types/register-request";
import { ApiError } from "../errors/api.error";
import { DB_ERROR_CODES } from "../consts/db-error-codes";
import type { User } from "../models/user";
import { mailService } from "./mail.service";

class UserService {
  private SALT: number = Number(process.env.SALT);
  private CLIENT_URL = process.env.CLIENT_URL;

  constructor() {
    if (!this.SALT) {
      throw new Error("SALT is not defined");
    }

    if (!this.CLIENT_URL) {
      throw new Error("CLIENT_URL is not defined");
    }
  }

  async register({
    firstName,
    lastName,
    position,
    email,
    password,
  }: RegisterRequest) {
    try {
      const hashedPassword = await bcrypt.hash(password, Number(this.SALT));

      const result = await pool.query<User>(
        `
        INSERT INTO users (first_name, last_name, position, email, password)
        VALUES ($1, $2, $3, LOWER($4), $5)
        RETURNING 
          user_id as "id", 
          first_name as "firstName", 
          last_name as "lastName", 
          position, 
          email, 
          last_seen_at as "lastSeenAt"
        `,
        [firstName, lastName, position, email.toLowerCase(), hashedPassword],
      );

      const user = result.rows[0];

      if (!user) {
        throw new Error("Error on registration");
      }

      const verificationToken = tokenService.signVerificationToken(email);
      await pool.query(
        `
        INSERT INTO email_verification_tokens (user_id, token)
        VALUES ($1, $2)
        `,
        [user.id, verificationToken],
      );

      const verificationUrl = `${this.CLIENT_URL}/verify-email?token=${verificationToken}`;
      await mailService.sendVerificationMail(user.email, verificationUrl);

      const accessToken = tokenService.signAccessToken({ userId: user.id });
      const refreshToken = tokenService.signRefreshToken({ userId: user.id });

      return { user, accessToken, refreshToken };
    } catch (error) {
      if (error instanceof DatabaseError) {
        if (error.code === DB_ERROR_CODES.UNIQUE_VIOLATION) {
          throw ApiError.Conflict("Email is already taken");
        }

        if (error.code === DB_ERROR_CODES.CHECK_VIOLATION) {
          throw ApiError.BadRequest("Invalid data");
        }
      }

      throw error;
    }
  }

  async getUser(userId: number): Promise<User> {
    const result = await pool.query(
      `
      SELECT 
        user_id as "id", 
        first_name as "firstName", 
        last_name as "lastName", 
        position, 
        email, 
        last_seen_at as "lastSeenAt",
        is_blocked as "isBlocked",
        is_verified as "isVerified"
      FROM users
      WHERE 
        user_id = $1
      `,
      [userId],
    );

    const user = result.rows[0];

    return user;
  }

  async getUsers(): Promise<User[]> {
    const result = await pool.query(
      `
      SELECT 
        user_id as "id", 
        first_name as "firstName", 
        last_name as "lastName", 
        position, 
        email, 
        last_seen_at as "lastSeenAt",
        is_blocked as "isBlocked",
        is_verified as "isVerified"
      FROM users;
      `,
    );

    return result.rows;
  }

  async blockUsersByIds(ids: number[]): Promise<number[]> {
    const result = await pool.query(
      `
      UPDATE users
      SET is_blocked = $1
      WHERE
       user_id = ANY($2)
       AND is_blocked = FALSE
      RETURNING user_id as "id"
      `,
      [true, ids],
    );

    return result.rows;
  }

  async unblockUsersByIds(ids: number[]) {
    const result = await pool.query(
      `
      UPDATE users
      SET is_blocked = $1
      WHERE 
        user_id = ANY($2)
        AND is_blocked = TRUE
      RETURNING user_id as "id"
      `,
      [false, ids],
    );

    return result.rows;
  }

  async deleteUsersByIds(ids: number[]) {
    const result = await pool.query(
      `
      DELETE FROM users
      WHERE user_id = ANY($1)
      RETURNING user_id as "id"
      `,
      [ids],
    );

    return result.rows;
  }

  async deleteUnverifiedUsers(): Promise<number[]> {
    const result = await pool.query(
      `
      DELETE FROM users 
      WHERE is_verified = FALSE
      RETURNING
        user_id as "id"
      `,
    );

    return result.rows;
  }
}

export const userService = new UserService();
