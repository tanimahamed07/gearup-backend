import { Response } from "express";
import httpStatus from "http-status";

type TMeta = {
  page: number;
  limit: number;
  total: number;
}

type TResponseData<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: TMeta
}

export const sendResponse = <T>(res: Response, data: TResponseData<T>) => {
  res.status(data.statusCode).json({
    success: data.success || true,
    statusCode : data.statusCode,
    message: data.message,
    data: data.data,
    meta: data.meta
  })

}


