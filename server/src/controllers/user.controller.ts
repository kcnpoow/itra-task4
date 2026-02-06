import type { NextFunction, Request, Response } from "express";

import { userService } from "../services/user.service";
import { ApiError } from "../errors/api.error";

class UserController {
  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await userService.getUsers();

      return res.status(200).json(users);
    } catch (error) {
      return next(error);
    }
  };

  blockUsersByIds = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ids } = req.query;

      if (!ids || typeof ids !== "string") {
        throw ApiError.BadRequest("Missing ids");
      }

      const blockedUserIds = await userService.blockUsersByIds(
        ids.split(",").map((id) => Number(id)),
      );

      return res.status(200).json(blockedUserIds);
    } catch (error) {
      return next(error);
    }
  };

  unblockUsersByIds = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { ids } = req.query;

      if (!ids || typeof ids !== "string") {
        throw ApiError.BadRequest("Missing ids");
      }

      const unblockedUserIds = await userService.unblockUsersByIds(
        ids.split(",").map((id) => Number(id)),
      );

      return res.status(200).json(unblockedUserIds);
    } catch (error) {
      return next(error);
    }
  };

  deleteUsersByIds = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { ids } = req.query;

      if (!ids || typeof ids !== "string") {
        throw ApiError.BadRequest("Missing ids");
      }

      const deletedUserIds = await userService.deleteUsersByIds(
        ids.split(",").map((id) => Number(id)),
      );

      return res.status(200).json(deletedUserIds);
    } catch (error) {
      return next(error);
    }
  };

  deleteUnverifiedUsers = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const deletedUserIds = await userService.deleteUnverifiedUsers();

      return res.status(200).json(deletedUserIds);
    } catch (error) {
      return next(error);
    }
  };
}

export const userController = new UserController();
