import { Router } from "express";
import { gearController } from "./gear.controller";
import { auth } from "../../middlewares/authGurd";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

// Public routes
router.get("/", gearController.getAllGear);
router.get("/:id", gearController.getGearById);

// Provider routes
router.post("/", auth(Role.PROVIDER), gearController.postGear);
router.put("/:id", auth(Role.PROVIDER), gearController.updateGear);
router.delete("/:id", auth(Role.PROVIDER), gearController.deleteGear);

export const gearRoutes = router;
