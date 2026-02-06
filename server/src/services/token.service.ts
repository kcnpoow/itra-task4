import jwt from "jsonwebtoken";
import type { TokenPayload } from "../types/token-payload";

class TokenService {
  private readonly ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
  private readonly REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

  constructor() {
    if (!this.ACCESS_SECRET) {
      throw new Error("JWT_ACCESS_SECRET is not defined");
    }

    if (!this.ACCESS_SECRET) {
      throw new Error("JWT_REFRESH_SECRET is not defined");
    }
  }

  signAccessToken(payload: TokenPayload): string {
    const token = jwt.sign(payload, this.ACCESS_SECRET, {
      expiresIn: "15m",
    });

    return token;
  }

  signRefreshToken(payload: TokenPayload): string {
    const token = jwt.sign(payload, this.REFRESH_SECRET, {
      expiresIn: "7d",
    });

    return token;
  }

  signVerificationToken(email: string): string {
    const token = jwt.sign({ email }, this.ACCESS_SECRET, {
      expiresIn: "24h",
    });

    return token;
  }

  validateAccessToken(token: string): TokenPayload | null {
    try {
      const payload = jwt.verify(token, this.ACCESS_SECRET) as TokenPayload;

      return payload;
    } catch {
      return null;
    }
  }

  validateRefreshToken(token: string): TokenPayload | null {
    try {
      const payload = jwt.verify(token, this.REFRESH_SECRET) as TokenPayload;

      return payload;
    } catch {
      return null;
    }
  }

  decode(token: string): TokenPayload | null {
    try {
      const payload = jwt.decode(token) as TokenPayload;

      return payload;
    } catch {
      return null;
    }
  }
}

export const tokenService = new TokenService();
