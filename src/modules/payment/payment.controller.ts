import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { paymentServices } from "./payment.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createCheckoutSession = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { orderId } = req.body;

    const result = await paymentServices.createCheckoutSession(
      orderId,
      userId as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Checkout session created successfully",
      data: result,
    });
  },
);

const handleWebhook = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;
  const rawBody = req.body;

  await paymentServices.handleWebhook(rawBody, signature);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Webhook triggered successfully",
    data: null,
  });
});

const getPaymentHistory = catchAsync(async (req: Request, res: Response) => {
  const id = req.user?.id;
  const result = await paymentServices.getPaymentHistory(id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment history retrieved successfully",
    data: result,
  });
});

const getPaymentDetails = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await paymentServices.getPaymentDetails(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment details retrieved successfully",
    data: result,
  });
});

export const paymentController = {
  createCheckoutSession,
  handleWebhook,
  getPaymentHistory,
  getPaymentDetails,
};
