import { Router } from "express";
import { orderController } from "./order.controller";
import { auth } from "../../middlewares/authGurd";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/", auth(Role.CUSTOMER), orderController.postOrder);
router.get("/", auth(Role.CUSTOMER), orderController.getMyRentals);
router.get("/:id", auth(Role.CUSTOMER), orderController.getRentalDetails);

export const orderRoutes = router;
