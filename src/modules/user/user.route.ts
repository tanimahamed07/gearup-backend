import { Router } from "express";
import { userController } from "./user.controller";
import { auth } from "../../middlewares/authGurd";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/register", userController.registerUser);
router.get(
  "/me",
  auth(Role.ADMIN, Role.CUSTOMER, Role.PROVIDER),
  userController.getMyProfile,
);

export const userRouts = router;
