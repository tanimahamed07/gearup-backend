import { prisma } from "../../lib/prisma";

export interface TRentalOrderPayload {
  customerId: string;
  startDate: string;
  endDate: string;
  items: IRentalItemInput[];
}
export interface IRentalItemInput {
  gearItemId: string;
  quantity: number;
}
const postOrder = async (payload: TRentalOrderPayload) => {
  const { customerId, startDate, endDate, items } = payload;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 3600 * 24),
  );

  if (totalDays <= 0) throw new Error("End date must be after start date.");

  return await prisma.$transaction(async (tx) => {
    let totalAmount = 0;

    const processedItems = [];

    for (const item of items) {
      const gear = await tx.gearItem.findUnique({
        where: { id: item.gearItemId },
      });
      if (!gear || gear.stock < item.quantity || !gear.isAvailable) {
        throw new Error(
          `Item ${item.gearItemId} is unavailable or out of stock.`,
        );
      }

      const subtotal = Number(gear.pricePerDay) * item.quantity * totalDays;
      totalAmount += subtotal;

      processedItems.push({
        gearItemId: item.gearItemId,
        quantity: item.quantity,
        pricePerDay: gear.pricePerDay,
        subtotal: subtotal,
      });

      await tx.gearItem.update({
        where: { id: item.gearItemId },
        data: {
          stock: gear.stock - item.quantity,
          isAvailable: gear.stock - item.quantity > 0,
        },
      });
    }

    const order = await tx.rentalOrder.create({
      data: {
        customerId,
        startDate: start,
        endDate: end,
        totalAmount,
        status: "PLACED",
        rentalOrderItems: {
          create: processedItems,
        },
        payment: {
          create: {
            transactionId: `pending_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            amount: totalAmount,
            method: "stripe",
            status: "PENDING",
            userId: customerId,
          },
        },
      },
      include: {
        rentalOrderItems: true,
        payment: true,
      },
    });

    return order;
  });
};

const getMyRentals = async (customerId: string) => {
  const rentals = await prisma.rentalOrder.findMany({
    where: {
      customerId: customerId,
    },
    include: {
      rentalOrderItems: {
        include: {
          gearItem: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return rentals;
};

const getRentalDetails = async (id: string) => {
  return await prisma.rentalOrder.findUniqueOrThrow({
    where: { id },
    include: {
      rentalOrderItems: {
        include: {
          gearItem: true,
        },
      },
    },
  });
};

const getProviderIncomingOrders = async (providerId: string) => {
  const incomingOrders = await prisma.rentalOrderItem.findMany({
    where: {
      gearItem: {
        providerId: providerId,
      },
      rentalOrder: {
        status: "PAID",
      },
    },
    include: {
      gearItem: true,
      rentalOrder: {
        include: {
          customer: true,
        },
      },
    },
  });

  return incomingOrders;
};

const updateOrderStatus = async (
  orderId: string,
  providerId: string,
  newStatus: string,
) => {
  // Check if this order contains provider's gear
  const order = await prisma.rentalOrder.findFirst({
    where: {
      id: orderId,
      rentalOrderItems: {
        some: {
          gearItem: {
            providerId: providerId,
          },
        },
      },
    },
    include: {
      rentalOrderItems: {
        include: {
          gearItem: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error(
      "Order not found or you don't have permission to update it",
    );
  }

  // Update order status
  const updatedOrder = await prisma.rentalOrder.update({
    where: { id: orderId },
    data: { status: newStatus as any },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      rentalOrderItems: {
        include: {
          gearItem: {
            include: {
              category: true,
            },
          },
        },
      },
      payment: true,
    },
  });

  return updatedOrder;
};

const getAllRentalsForAdmin = async () => {
  return await prisma.rentalOrder.findMany({
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      rentalOrderItems: {
        include: {
          gearItem: {
            include: {
              category: true,
              provider: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
      payment: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const orderService = {
  postOrder,
  getMyRentals,
  getRentalDetails,
  getProviderIncomingOrders,
  updateOrderStatus,
  getAllRentalsForAdmin,
};
