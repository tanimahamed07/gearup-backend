import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";

import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { userService } from "./user.service";

export const registerUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
//   console.log(payload)
  const user = await userService.registerUser(payload);
//   console.log("=======>", user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "user registered successfully",
    data: user,
  });
});

export const userController = {
  registerUser,
};
