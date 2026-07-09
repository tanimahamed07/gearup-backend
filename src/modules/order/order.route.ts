import { Router } from "express";
import { orderController } from "./order.controller";
import { auth } from "../../middlewares/authGurd";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

// Customer routes
router.post("/", auth(Role.CUSTOMER), orderController.postOrder);
router.get("/", auth(Role.CUSTOMER), orderController.getMyRentals);
router.get("/:id", auth(Role.CUSTOMER), orderController.getRentalDetails);

// Provider routes
router.get(
  "/provider/incoming",
  auth(Role.PROVIDER),
  orderController.getProviderIncomingOrders,
);
router.patch(
  "/provider/:id",
  auth(Role.PROVIDER),
  orderController.updateOrderStatus,
);

// Admin routes
router.get(
  "/admin/all",
  auth(Role.ADMIN),
  orderController.getAllRentalsForAdmin,
);

export const orderRoutes = router;
