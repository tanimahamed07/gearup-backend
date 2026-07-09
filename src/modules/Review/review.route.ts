import { Router } from "express";
import { reviewController } from "./review.controller";
import { auth } from "../../middlewares/authGurd";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

// Public route - Get reviews for a gear item
router.get("/gear/:gearId", reviewController.getGearReviews);

// Customer routes - Authentication required
router.post("/", auth(Role.CUSTOMER), reviewController.createReview);
router.get("/my", auth(Role.CUSTOMER), reviewController.getMyReviews);
router.put("/:id", auth(Role.CUSTOMER), reviewController.updateReview);
router.delete("/:id", auth(Role.CUSTOMER), reviewController.deleteReview);

export const reviewRoutes = router;
