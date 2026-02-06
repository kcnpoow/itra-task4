import type { CookieOptions, NextFunction, Request, Response } from "express";

import { type LoginRequest } from "../types/login-request";
import { type RegisterRequest } from "../types/register-request";

import { authService } from "../services/auth.service";
import { userService } from "../services/user.service";

class AuthController {
  private readonly REFRESH_COOKIE_KEY = "refreshToken";
  private readonly REFRESH_COOKIE_OPTIONS: CookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  signin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: LoginRequest = req.body;

      const { user, accessToken, refreshToken } = await authService.login(data);

      res.cookie(
        this.REFRESH_COOKIE_KEY,
        refreshToken,
        this.REFRESH_COOKIE_OPTIONS,
      );

      return res.status(200).json({ user, accessToken });
    } catch (error) {
      return next(error);
    }
  };

  signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: RegisterRequest = req.body;

      const { user, accessToken, refreshToken } =
        await userService.register(data);

      res.cookie(
        this.REFRESH_COOKIE_KEY,
        refreshToken,
        this.REFRESH_COOKIE_OPTIONS,
      );

      return res.status(201).json({ user, accessToken });
    } catch (error) {
      return next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.clearCookie(this.REFRESH_COOKIE_KEY);

      return res.sendStatus(204);
    } catch (error) {
      return next(error);
    }
  };

  auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies[this.REFRESH_COOKIE_KEY];

      const { user, accessToken } = await authService.auth(refreshToken);

      return res.status(200).json({ user, accessToken });
    } catch (error) {
      return next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies[this.REFRESH_COOKIE_KEY];

      const { accessToken } = await authService.auth(refreshToken);

      return res.status(200).json({ accessToken });
    } catch (error) {
      return next(error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.query.token as string;

      const user = await authService.verifyEmail(token);

      return res.status(200).json({ user });
    } catch (error) {
      return next(error);
    }
  };
}

export const authController = new AuthController();
