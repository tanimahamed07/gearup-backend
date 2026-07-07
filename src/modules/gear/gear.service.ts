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

export const gearService = {
  getAllGear,
  getGearById,
};
