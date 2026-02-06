// src/main.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

// src/routes/auth.router.ts
import { Router } from "express";

// src/services/auth.service.ts
import bcrypt2 from "bcrypt";

// src/services/token.service.ts
import jwt from "jsonwebtoken";
var TokenService = class {
  ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
  REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
  constructor() {
    if (!this.ACCESS_SECRET) {
      throw new Error("JWT_ACCESS_SECRET is not defined");
    }
    if (!this.ACCESS_SECRET) {
      throw new Error("JWT_REFRESH_SECRET is not defined");
    }
  }
  signAccessToken(payload) {
    const token = jwt.sign(payload, this.ACCESS_SECRET, {
      expiresIn: "15m"
    });
    return token;
  }
  signRefreshToken(payload) {
    const token = jwt.sign(payload, this.REFRESH_SECRET, {
      expiresIn: "7d"
    });
    return token;
  }
  signVerificationToken(email) {
    const token = jwt.sign({ email }, this.ACCESS_SECRET, {
      expiresIn: "24h"
    });
    return token;
  }
  validateAccessToken(token) {
    try {
      const payload = jwt.verify(token, this.ACCESS_SECRET);
      return payload;
    } catch {
      return null;
    }
  }
  validateRefreshToken(token) {
    try {
      const payload = jwt.verify(token, this.REFRESH_SECRET);
      return payload;
    } catch {
      return null;
    }
  }
  decode(token) {
    try {
      const payload = jwt.decode(token);
      return payload;
    } catch {
      return null;
    }
  }
};
var tokenService = new TokenService();

// src/config/db.ts
import { Pool } from "pg";
var pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// src/errors/api.error.ts
var ApiError = class _ApiError extends Error {
  status;
  constructor(message = "Unexpected error", status = 500) {
    super(message);
    this.status = status;
  }
  static BadRequest(message) {
    return new _ApiError(message, 400);
  }
  static Unauthorized(message = "Unauthorized") {
    return new _ApiError(message, 401);
  }
  static NotFound(message = "Not found") {
    return new _ApiError(message, 404);
  }
  static Conflict(message = "Conflict") {
    return new _ApiError(message, 409);
  }
  static Forbidden(message = "Forbidden") {
    return new _ApiError(message, 403);
  }
};

// src/services/user.service.ts
import { DatabaseError } from "pg";
import bcrypt from "bcrypt";

// src/consts/db-error-codes.ts
var DB_ERROR_CODES = {
  UNIQUE_VIOLATION: "23505",
  CHECK_VIOLATION: "23514"
};

// src/services/mail.service.ts
import nodemailer from "nodemailer";
var MailService = class {
  GMAIL_USER = process.env.GMAIL_USER;
  GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
  mailTransporter;
  constructor() {
    if (!this.GMAIL_USER) {
      throw new Error("GMAIL_USER is not defined");
    }
    if (!this.GMAIL_APP_PASSWORD) {
      throw new Error("GMAIL_APP_PASSWORD is not defined");
    }
    this.mailTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: this.GMAIL_USER,
        pass: this.GMAIL_APP_PASSWORD
      }
    });
  }
  sendVerificationMail = async (email, url) => {
    try {
      await this.mailTransporter.sendMail({
        from: "The app",
        to: email,
        subject: "Email verification",
        html: `<p>To verify email click link: <a href="${url}">${url}</a></p>`
      });
    } catch (error) {
      throw new Error("Error sending email");
    }
  };
};
var mailService = new MailService();

// src/services/user.service.ts
var UserService = class {
  SALT = Number(process.env.SALT);
  CLIENT_URL = process.env.CLIENT_URL;
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
    password
  }) {
    try {
      const hashedPassword = await bcrypt.hash(password, Number(this.SALT));
      const result = await pool.query(
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
        [firstName, lastName, position, email.toLowerCase(), hashedPassword]
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
        [user.id, verificationToken]
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
  async getUser(userId) {
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
      [userId]
    );
    const user = result.rows[0];
    return user;
  }
  async getUsers() {
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
      `
    );
    return result.rows;
  }
  async blockUsersByIds(ids) {
    const result = await pool.query(
      `
      UPDATE users
      SET is_blocked = $1
      WHERE
       user_id = ANY($2)
       AND is_blocked = FALSE
      RETURNING user_id as "id"
      `,
      [true, ids]
    );
    return result.rows;
  }
  async unblockUsersByIds(ids) {
    const result = await pool.query(
      `
      UPDATE users
      SET is_blocked = $1
      WHERE 
        user_id = ANY($2)
        AND is_blocked = TRUE
      RETURNING user_id as "id"
      `,
      [false, ids]
    );
    return result.rows;
  }
  async deleteUsersByIds(ids) {
    const result = await pool.query(
      `
      DELETE FROM users
      WHERE user_id = ANY($1)
      RETURNING user_id as "id"
      `,
      [ids]
    );
    return result.rows;
  }
  async deleteUnverifiedUsers() {
    const result = await pool.query(
      `
      DELETE FROM users 
      WHERE is_verified = FALSE
      RETURNING
        user_id as "id"
      `
    );
    return result.rows;
  }
};
var userService = new UserService();

// src/services/auth.service.ts
var AuthService = class {
  async login({ email, password }) {
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
      [email]
    );
    const row = users.rows[0];
    if (!row) {
      throw ApiError.Unauthorized();
    }
    const { passwordHash, ...user } = row;
    const isPasswordValid = await bcrypt2.compare(password, passwordHash);
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
      [user.id]
    );
    return { user, refreshToken, accessToken };
  }
  async auth(refreshToken) {
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
      [user.id]
    );
    return { user, accessToken };
  }
  async refresh(refreshToken) {
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
  async verifyEmail(verificationToken) {
    if (!verificationToken) {
      throw ApiError.BadRequest("Verification token required");
    }
    const result = await pool.query(
      `
      SELECT user_id as id
      FROM email_verification_tokens
      WHERE token = $1
      `,
      [verificationToken]
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
      [user.id]
    );
    await pool.query(
      `
      DELETE FROM email_verification_tokens
      WHERE user_id = $1
      `,
      [user.id]
    );
    return user;
  }
};
var authService = new AuthService();

// src/controllers/auth.controller.ts
var AuthController = class {
  REFRESH_COOKIE_KEY = "refreshToken";
  REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1e3
  };
  signin = async (req, res, next) => {
    try {
      const data = req.body;
      const { user, accessToken, refreshToken } = await authService.login(data);
      res.cookie(
        this.REFRESH_COOKIE_KEY,
        refreshToken,
        this.REFRESH_COOKIE_OPTIONS
      );
      return res.status(200).json({ user, accessToken });
    } catch (error) {
      return next(error);
    }
  };
  signup = async (req, res, next) => {
    try {
      const data = req.body;
      const { user, accessToken, refreshToken } = await userService.register(data);
      res.cookie(
        this.REFRESH_COOKIE_KEY,
        refreshToken,
        this.REFRESH_COOKIE_OPTIONS
      );
      return res.status(201).json({ user, accessToken });
    } catch (error) {
      return next(error);
    }
  };
  logout = async (req, res, next) => {
    try {
      res.clearCookie(this.REFRESH_COOKIE_KEY);
      return res.sendStatus(204);
    } catch (error) {
      return next(error);
    }
  };
  auth = async (req, res, next) => {
    try {
      const refreshToken = req.cookies[this.REFRESH_COOKIE_KEY];
      const { user, accessToken } = await authService.auth(refreshToken);
      return res.status(200).json({ user, accessToken });
    } catch (error) {
      return next(error);
    }
  };
  refresh = async (req, res, next) => {
    try {
      const refreshToken = req.cookies[this.REFRESH_COOKIE_KEY];
      const { accessToken } = await authService.auth(refreshToken);
      return res.status(200).json({ accessToken });
    } catch (error) {
      return next(error);
    }
  };
  verifyEmail = async (req, res, next) => {
    try {
      const token = req.query.token;
      const user = await authService.verifyEmail(token);
      return res.status(200).json({ user });
    } catch (error) {
      return next(error);
    }
  };
};
var authController = new AuthController();

// src/middlewares/auth.middleware.ts
var authMiddleware = async (req, res, next) => {
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

// src/routes/auth.router.ts
var authRouter = Router();
authRouter.get("/", authController.auth);
authRouter.post("/signin", authController.signin);
authRouter.post("/signup", authController.signup);
authRouter.post("/logout", authMiddleware, authController.logout);
authRouter.get("/refresh", authController.refresh);
authRouter.patch("/verify-email", authController.verifyEmail);

// src/routes/user.router.ts
import { Router as Router2 } from "express";

// src/controllers/user.controller.ts
var UserController = class {
  getUsers = async (req, res, next) => {
    try {
      const users = await userService.getUsers();
      return res.status(200).json(users);
    } catch (error) {
      return next(error);
    }
  };
  blockUsersByIds = async (req, res, next) => {
    try {
      const { ids } = req.query;
      if (!ids || typeof ids !== "string") {
        throw ApiError.BadRequest("Missing ids");
      }
      const blockedUserIds = await userService.blockUsersByIds(
        ids.split(",").map((id) => Number(id))
      );
      return res.status(200).json(blockedUserIds);
    } catch (error) {
      return next(error);
    }
  };
  unblockUsersByIds = async (req, res, next) => {
    try {
      const { ids } = req.query;
      if (!ids || typeof ids !== "string") {
        throw ApiError.BadRequest("Missing ids");
      }
      const unblockedUserIds = await userService.unblockUsersByIds(
        ids.split(",").map((id) => Number(id))
      );
      return res.status(200).json(unblockedUserIds);
    } catch (error) {
      return next(error);
    }
  };
  deleteUsersByIds = async (req, res, next) => {
    try {
      const { ids } = req.query;
      if (!ids || typeof ids !== "string") {
        throw ApiError.BadRequest("Missing ids");
      }
      const deletedUserIds = await userService.deleteUsersByIds(
        ids.split(",").map((id) => Number(id))
      );
      return res.status(200).json(deletedUserIds);
    } catch (error) {
      return next(error);
    }
  };
  deleteUnverifiedUsers = async (req, res, next) => {
    try {
      const deletedUserIds = await userService.deleteUnverifiedUsers();
      return res.status(200).json(deletedUserIds);
    } catch (error) {
      return next(error);
    }
  };
};
var userController = new UserController();

// src/routes/user.router.ts
var userRouter = Router2();
userRouter.get("/", authMiddleware, userController.getUsers);
userRouter.post("/signup", authController.signup);
userRouter.patch("/block", authMiddleware, userController.blockUsersByIds);
userRouter.patch("/unblock", authMiddleware, userController.unblockUsersByIds);
userRouter.delete(
  "/unverified",
  authMiddleware,
  userController.deleteUnverifiedUsers
);
userRouter.delete("/", authMiddleware, userController.deleteUsersByIds);

// src/middlewares/error.middleware.ts
var errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    return res.status(error.status).json({
      message: error.message,
      status: error.status
    });
  }
  console.error(error);
  res.status(500).json({
    message: "Internal server error",
    status: 500
  });
};

// src/main.ts
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var publicPath = path.resolve(__dirname, "public");
var PORT = process.env.PORT || 3e3;
var app = express();
app.use(express.static(publicPath));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);
app.use(cookieParser());
app.use(express.json());
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use(errorMiddleware);
app.use((req, res) => {
  const filePath = path.join(publicPath, "index.html");
  res.sendFile(filePath);
});
app.listen(PORT, (err) => {
  if (err) {
    console.error("Failed to start server:", err);
  } else {
    console.log(`Server listening on port ${PORT}`);
  }
});
