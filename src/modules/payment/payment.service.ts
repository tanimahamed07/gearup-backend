import { Request, Response } from "express";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import Stripe from "stripe";
import { PaymentStatus, RentalOrderStatus } from "../../../generated/prisma/enums";

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

const handleWebhook = async (rawBody: Buffer, signature: string) => {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      config.stripe_webhook_secret as string,
    );
  } catch (err) {
    throw new Error("Webhook signature verification failed");
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const rentalOrderId = session.metadata?.rentalOrderId;
      const userId = session.metadata?.userId;

      if (!rentalOrderId) break;

      await prisma.$transaction(async (tx) => {
        const order = await tx.rentalOrder.findUnique({
          where: { id: rentalOrderId },
          include: { payment: true },
        });

        if (!order) return;


        if (order.payment?.status === PaymentStatus.COMPLETED) return;

        await tx.payment.upsert({
          where: { rentalOrderId },
          update: {
            status: PaymentStatus.COMPLETED,
            paidAt: new Date(),
            transactionId: session.id,
          },
          create: {
            rentalOrderId,
            transactionId: session.id,
            amount: order.totalAmount,
            method: "stripe",
            status: PaymentStatus.COMPLETED,
            paidAt: new Date(),
            userId: userId ?? order.customerId,
          },
        });

        await tx.rentalOrder.update({
          where: { id: rentalOrderId },
          data: { status: RentalOrderStatus.CONFIRMED },
        });
      });

      break;
    }

    case "checkout.session.expired":
    case "payment_intent.payment_failed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const rentalOrderId = session.metadata?.rentalOrderId;

      if (!rentalOrderId) break;

      await prisma.payment.upsert({
        where: { rentalOrderId },
        update: { status: PaymentStatus.FAILED },
        create: {
          rentalOrderId,
          transactionId: session.id,
          amount: 0,
          method: "stripe",
          status: PaymentStatus.FAILED,
        },
      });

      break;
    }

    default:
      break;
  }

  return { received: true };
};

export const paymentServices = {
  createCheckoutSession,
  handleWebhook,
};
