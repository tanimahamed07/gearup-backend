import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import config from "./config";
import { notFound } from "./middlewares/notFound";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import cookieParser from "cookie-parser";
import { userRouts } from "./modules/user/user.route";
import { authRouts } from "./modules/auth/auth.route";

const app: Application = express();
app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.get("/", async (req: Request, res: Response) => {
  res.send("hello, World!");
});

app.use("/api/auth/", userRouts);
app.use("/api/auth/", authRouts);

app.use(notFound);

app.use(globalErrorHandler);
export default app;
