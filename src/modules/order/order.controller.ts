import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { orderService } from "./order.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const postOrder = catchAsync(async (req: Request, res: Response) => {
  const customerId = (req as any).user?.id || req.body.customerId;

  const orderData = {
    ...req.body,
    customerId,
  };

  const result = await orderService.postOrder(orderData);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Rental order placed successfully",
    data: result,
  });
});


const getMyRentals = catchAsync(async (req: Request, res: Response) => {
  const customerId = (req as any).user.id; 

  const result = await orderService.getMyRentals(customerId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Customer rental history retrieved successfully",
    data: result,
  });
});

export const orderController = {
  postOrder,
  getMyRentals
};