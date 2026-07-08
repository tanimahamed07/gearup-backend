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
  const { id } = req.params;
  const gear = await gearService.getGearById(id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear retrieved successfully",
    data: gear,
  });
});

const postGear = catchAsync(async (req: Request, res: Response) => {
  const providerId = req.user?.id;
  const payload = req.body;
  const result = await gearService.gearPost(providerId as string, payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Gear created successfully",
    data: result,
  });
});

const updateGear = catchAsync(async (req: Request, res: Response) => {
  const providerId = req.user?.id;
  const { id: gearId } = req.params;
  const payload = req.body;

  const result = await gearService.updateGear(
    gearId as string,
    providerId as string,
    payload,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear updated successfully",
    data: result,
  });
});

const deleteGear = catchAsync(async (req: Request, res: Response) => {
  const providerId = req.user?.id;
  const { id: gearId } = req.params;

  await gearService.deleteGear(gearId as string, providerId as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear deleted successfully",
    data: null,
  });
});



export const gearController = {
  getAllGear,
  getGearById,
  postGear,
  updateGear,
  deleteGear,
};
