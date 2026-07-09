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

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const profile = await userService.getMyProfile(userId as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User profile get successfully",
    data: profile,
  });
});
const getAllProfile = catchAsync(async (req: Request, res: Response) => {
  const profile = await userService.getAllProfile();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Users profile get successfully",
    data: profile,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const result = await userService.updateUserStatus(id as string, status);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: `User ${status === "SUSPENDED" ? "suspended" : "activated"} successfully`,
    data: result,
  });
});

export const userController = {
  registerUser,
  getMyProfile,
  getAllProfile,
  updateUserStatus,
};
