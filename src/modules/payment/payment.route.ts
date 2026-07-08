import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/authGurd";
import { paymentController } from "./payment.controller";

const router = Router();

router.post(
  "/create",
  auth(Role.CUSTOMER),
  paymentController.createCheckoutSession,
);

router.get("/", auth(Role.CUSTOMER), paymentController.getPaymentHistory);
router.get("/:id", auth(Role.CUSTOMER), paymentController.getPaymentDetails);

export const paymentRouts = router;
