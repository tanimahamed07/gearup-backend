import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";

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

export const paymentServices = {
  createCheckoutSession,
};
