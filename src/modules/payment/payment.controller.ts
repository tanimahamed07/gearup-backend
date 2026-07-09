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

  if (!signature) {
    console.error("No Stripe signature found in headers");
    return res.status(400).json({ error: "No signature provided" });
  }

  try {
    await paymentServices.handleWebhook(rawBody, signature);

    // Stripe expects plain 200 response
    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error("Webhook handler error:", error.message);
    return res.status(400).json({ error: error.message });
  }
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
