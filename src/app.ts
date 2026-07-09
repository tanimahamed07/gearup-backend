import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import config from "./config";
import { notFound } from "./middlewares/notFound";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import cookieParser from "cookie-parser";
import { userRouts } from "./modules/user/user.route";
import { authRouts } from "./modules/auth/auth.route";
import { gearRoutes } from "./modules/gear/gear.route";
import { categoryRouts } from "./modules/category/category.route";
import { orderRoutes } from "./modules/order/order.route";
import { paymentRouts } from "./modules/payment/payment.route";
import { paymentController } from "./modules/payment/payment.controller";
import { reviewRoutes } from "./modules/Review/review.route";


const app: Application = express();
app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

app.post(
  "/api/payments/confirm",
  express.raw({ type: "application/json" }),
  paymentController.handleWebhook,
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.get("/", async (req: Request, res: Response) => {
  res.send("hello, World!");
});

app.use("/api/auth/", userRouts);
app.use("/api/auth/", authRouts);
app.use("/api/gear/", gearRoutes);
app.use("/api/category/", categoryRouts);
app.use("/api/rentals", orderRoutes);
app.use("/api/payments", paymentRouts);
app.use("/api/reviews", reviewRoutes);

app.use(notFound);

app.use(globalErrorHandler);
export default app;
