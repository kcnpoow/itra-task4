import { Router } from "express";

import { authController } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { userController } from "../controllers/user.controller";

const userRouter = Router();

userRouter.get("/", authMiddleware, userController.getUsers);
userRouter.post("/signup", authController.signup);
userRouter.patch("/block", authMiddleware, userController.blockUsersByIds);
userRouter.patch("/unblock", authMiddleware, userController.unblockUsersByIds);
userRouter.delete(
  "/unverified",
  authMiddleware,
  userController.deleteUnverifiedUsers,
);
userRouter.delete("/", authMiddleware, userController.deleteUsersByIds);

export { userRouter };
