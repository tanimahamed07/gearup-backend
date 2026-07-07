import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { gearService } from "./gear.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const getAllGear = catchAsync(async (req: Request, res: Response) => {
  const result = await gearService.getAllGear(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Get all gear retrieved successfully",
    data: result,
  });
});

const getGearById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const gear = await gearService.getGearById(id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear retrieved successfully",
    data: gear,
  });
});

export const gearController = {
  getAllGear,
  getGearById,
};
