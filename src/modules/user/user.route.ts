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

// Admin routes
router.get("/admin/users", auth(Role.ADMIN), userController.getAllProfile);
router.patch(
  "/admin/users/:id",
  auth(Role.ADMIN),
  userController.updateUserStatus,
);

export const userRouts = router;
