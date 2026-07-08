import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { paymentServices } from "./payment.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createCheckoutSession = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { orderId } = req.body;

    const result = await paymentServices.createCheckoutSession(
      orderId,
      userId as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "cheackout successfully",
      data: result,
    });
  },
);

const handleWebhook = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;

  const result = await paymentServices.handleWebhook(req.body, signature);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Webhook triggered successfully",
    data: null,
  });
});

export const paymentController = {
  createCheckoutSession,
  handleWebhook,
};
