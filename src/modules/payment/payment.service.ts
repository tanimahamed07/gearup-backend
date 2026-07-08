import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import Stripe from "stripe";
import {
  PaymentStatus,
  RentalOrderStatus,
} from "../../../generated/prisma/enums";

const createCheckoutSession = async (rentalOrderId: string, userId: string) => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    const order = await tx.rentalOrder.findUnique({
      where: { id: rentalOrderId },
      include: {
        rentalOrderItems: { include: { gearItem: true } },
        customer: true,
      },
    });

    if (!order) {
      throw new Error("Rental Order does'nt exist!");
    }

    const lineItems = order.rentalOrderItems.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.gearItem?.name || "Rental Item",
        },
        unit_amount: Math.round(Number(item.pricePerDay) * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: `${config.app_url}/payment/success=true`,
      cancel_url: `${config.app_url}/payment/success=false`,
      customer_email: order.customer?.email,
      client_reference_id: rentalOrderId,
      metadata: {
        userId: userId,
        rentalOrderId: rentalOrderId,
      },
    });

    return { paymentUrl: session.url };
  });

  return transactionResult;
};

const handleWebhook = async (rawBody: Buffer | string, signature: string) => {
  let event: Stripe.Event;

  try {
    const buffer = typeof rawBody === "string" ? Buffer.from(rawBody) : rawBody;

    event = stripe.webhooks.constructEvent(
      buffer,
      signature,
      config.stripe_webhook_secret as string,
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }

  console.log(`Received webhook event: ${event.type}`);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const rentalOrderId = session.metadata?.rentalOrderId;
      const userId = session.metadata?.userId;

      console.log(`Processing successful payment for order: ${rentalOrderId}`);

      if (!rentalOrderId) {
        console.warn("No rentalOrderId in webhook metadata");
        break;
      }

      await prisma.$transaction(async (tx) => {
        const order = await tx.rentalOrder.findUnique({
          where: { id: rentalOrderId },
          include: { payment: true },
        });

        if (!order) {
          console.error(`Order not found: ${rentalOrderId}`);
          return;
        }

        if (order.payment?.status === PaymentStatus.COMPLETED) {
          console.log(`Payment already completed for order: ${rentalOrderId}`);
          return;
        }

        await tx.payment.update({
          where: { rentalOrderId },
          data: {
            status: PaymentStatus.COMPLETED,
            paidAt: new Date(),
            transactionId: (session.payment_intent as string) || session.id,
          },
        });

        await tx.rentalOrder.update({
          where: { id: rentalOrderId },
          data: { status: RentalOrderStatus.CONFIRMED },
        });

        console.log(
          `Payment completed successfully for order: ${rentalOrderId}`,
        );
      });

      break;
    }

    case "checkout.session.expired":
    case "payment_intent.payment_failed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const rentalOrderId = session.metadata?.rentalOrderId;

      console.log(
        `Processing failed/expired payment for order: ${rentalOrderId}`,
      );

      if (!rentalOrderId) break;

      await prisma.payment.update({
        where: { rentalOrderId },
        data: { status: PaymentStatus.FAILED },
      });

      console.log(`Payment marked as failed for order: ${rentalOrderId}`);

      break;
    }

    default:
      console.log(`Unhandled webhook event type: ${event.type}`);
      break;
  }

  return { received: true };
};

const getPaymentHistory = async (id: string) => {
  return await prisma.payment.findMany({
    where: { userId: id },
  });
};

const getPaymentDetails = async (id: string) => {
  return await prisma.payment.findUniqueOrThrow({
    where: { id },
    include: {
      user: true,
      order: true,
    },
  });
};

export const paymentServices = {
  createCheckoutSession,
  handleWebhook,
  getPaymentHistory,
  getPaymentDetails,
};
