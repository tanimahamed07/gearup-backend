import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";

import { sendResponse } from "../../utils/sendResponse";
import { categoryService } from "./category.service";

const getCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await categoryService.getCategory()
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Categories retrieved successfully",
    data: result
  })
  
});

export const categoryController = {
  getCategory,
};
