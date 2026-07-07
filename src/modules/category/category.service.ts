import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

const getCategory = async () => {
  const category = await prisma.category.findMany();
  return category;
};

export const categoryService = {
  getCategory,
};
