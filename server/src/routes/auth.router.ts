import { Router } from "express";

import { authController } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const authRouter = Router();

authRouter.get("/", authController.auth);
authRouter.post("/signin", authController.signin);
authRouter.post("/signup", authController.signup);
authRouter.post("/logout", authMiddleware, authController.logout);
authRouter.get("/refresh", authController.refresh);
authRouter.patch("/verify-email", authController.verifyEmail);

export { authRouter };
