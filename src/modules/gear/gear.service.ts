import { GearItem } from "../../../generated/prisma/browser";
import { prisma } from "../../lib/prisma";

const getAllGear = async (query: Record<string, any>) => {
  const { searchTerm, category, brand, minPrice, maxPrice, availability } =
    query;

  const whereConditions: any = {};

  if (searchTerm) {
    whereConditions.OR = [
      {
        name: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      {
        brand: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
    ];
  }

  if (category) {
    whereConditions.category = {
      name: {
        contains: category,
        mode: "insensitive",
      },
    };
  }

  if (brand) {
    whereConditions.brand = {
      contains: brand,
      mode: "insensitive",
    };
  }

  if (minPrice || maxPrice) {
    whereConditions.pricePerDay = {};
    if (minPrice) {
      whereConditions.pricePerDay.gte = Number(minPrice);
    }
    if (maxPrice) {
      whereConditions.pricePerDay.lte = Number(maxPrice);
    }
  }

  if (availability !== undefined) {
    whereConditions.isAvailable = availability === "true";
  }

  const gears = await prisma.gearItem.findMany({
    where: whereConditions,
    include: {
      category: true,
    },
  });

  return gears;
};

const getGearById = async (id: string) => {
  return await prisma.gearItem.findFirstOrThrow({
    where: {
      id,
    },
    include: {
      category: true,
    },
  });
};

const gearPost = async (
  providerId: string,
  payload: Pick<
    GearItem,
    | "name"
    | "brand"
    | "pricePerDay"
    | "description"
    | "stock"
    | "isAvailable"
    | "categoryId"
  >,
) => {
  return await prisma.gearItem.create({
    data: {
      ...payload,
      providerId,
    },
  });
};

const updateGear = async (
  gearId: string,
  providerId: string,
  payload: Partial<
    Pick<
      GearItem,
      | "name"
      | "brand"
      | "pricePerDay"
      | "description"
      | "stock"
      | "isAvailable"
      | "categoryId"
    >
  >,
) => {
  const gear = await prisma.gearItem.findFirst({
    where: {
      id: gearId,
      providerId,
    },
  });

  if (!gear) {
    throw new Error("Gear not found or you don't have permission to update it");
  }

  return await prisma.gearItem.update({
    where: { id: gearId },
    data: payload,
    include: {
      category: true,
    },
  });
};
const deleteGear = async (gearId: string, providerId: string) => {
  const gear = await prisma.gearItem.findFirst({
    where: {
      id: gearId,
      providerId,
    },
  });

  if (!gear) {
    throw new Error("Gear not found or you don't have permission to delete it");
  }

  return await prisma.gearItem.delete({
    where: { id: gearId },
  });
};

export const gearService = {
  getAllGear,
  getGearById,
  gearPost,
  updateGear,
  deleteGear,
};

const getMyGears = async (providerId: string) => {
  return await prisma.gearItem.findMany({
    where: {
      providerId,
    },
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
