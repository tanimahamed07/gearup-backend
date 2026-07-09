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

const getRentalDetails = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await orderService.getRentalDetails(id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Customer rental details retrieved successfully",
    data: result,
  });
});

const getProviderIncomingOrders = catchAsync(
  async (req: Request, res: Response) => {
    const providerId = req.user?.id;

    const result = await orderService.getProviderIncomingOrders(providerId as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Provider incoming orders retrieved successfully",
      data: result,
    });
  },
);

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const providerId = (req as any).user?.id;
  const { id } = req.params;
  const { status } = req.body;

  const result = await orderService.updateOrderStatus(id as string, providerId, status);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Order status updated successfully",
    data: result,
  });
});

export const orderController = {
  postOrder,
  getMyRentals,
  getRentalDetails,
  getProviderIncomingOrders,
  updateOrderStatus,
};
