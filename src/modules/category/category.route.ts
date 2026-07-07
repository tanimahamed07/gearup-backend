import { Router } from "express";
import { categoryController } from "./category.controller";

const router = Router();

router.get("/", categoryController.getCategory);
export const categoryRouts = router;
