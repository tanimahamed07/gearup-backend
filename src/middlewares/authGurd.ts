import { NextFunction, Request, Response } from "express";
import { Role } from "../../generated/prisma/enums";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";
import config from "../config";
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma";

declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
        name: string;
        id: string;
        role: Role;
      };
    }
  }
}

export const auth = (...requiredRoles: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : req.headers.authorization;

    if (!token) {
      throw new Error("Your are not logged in please log in to access");
    }

    const verifiedToken = jwtUtils.verifiedToken(
      token,
      config.jwt_access_secret,
    );

    if (!verifiedToken.success) {
      throw new Error(verifiedToken.error);
    }

    const { email, name, id, role } = verifiedToken.data as JwtPayload;

    // const requiredRoles = ["ADMIN", 'USER', 'AUTHOR'];
    const requiredRoles = [Role.ADMIN, Role.CUSTOMER, Role.PROVIDER];

    if (requiredRoles.length && !requiredRoles.includes(role)) {
      throw new Error("Forbidden.you don't permission to access");
    }

    const user = await prisma.user.findUnique({
      where: {
        id,
        email,
        name,
        role,
      },
    });
    if (!user) {
      throw new Error("User not found. Please log in again");
    }

    if (user.status === "SUSPENDED") {
      throw new Error("Your account has been SUSPENDED");
    }

    req.user = {
      email,
      name,
      id,
      role,
    };
    next();
  });
};