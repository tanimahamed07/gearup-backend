import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { reviewService } from "./review.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user?.id;
  const payload = req.body;

  const result = await reviewService.createReview(
    customerId as string,
    payload,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Review created successfully",
    data: result,
  });
});

const getGearReviews = catchAsync(async (req: Request, res: Response) => {
  const { gearId } = req.params;

  const result = await reviewService.getGearReviews(gearId as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear reviews retrieved successfully",
    data: result,
  });
});

const getMyReviews = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user?.id;

  const result = await reviewService.getMyReviews(customerId as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "My reviews retrieved successfully",
    data: result,
  });
});

const updateReview = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user?.id;
  const { id } = req.params;
  const payload = req.body;

  const result = await reviewService.updateReview(
    id as string,
    customerId as string,
    payload,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Review updated successfully",
    data: result,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user?.id;
  const { id } = req.params;

  await reviewService.deleteReview(id as string, customerId as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Review deleted successfully",
    data: null,
  });
});

export const reviewController = {
  createReview,
  getGearReviews,
  getMyReviews,
  updateReview,
  deleteReview,
};
