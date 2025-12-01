import { Request, Response, NextFunction } from "express";

interface ApiError extends Error {
  code?: string;
  statusCode?: number;
  errors?: any[];
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const code = err.code || "INTERNAL_SERVER_ERROR";

  console.error(`[${new Date().toISOString()}] ${code} - ${message}`, err);

  res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    ...(err.errors && { errors: err.errors }),
  });
};

export class ApiException extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_SERVER_ERROR",
    public errors: any[] = []
  ) {
    super(message);
    this.name = "ApiException";
  }
}

// ✅ Authentication Middleware
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Authorization token required",
      code: "UNAUTHORIZED",
    });
    return;
  }

  next();
};

// ✅ Standardized Response Wrapper
export const sendResponse = (
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data?: any,
  pagination?: any
) => {
  const response: any = {
    success,
    message,
  };

  if (data) response.data = data;
  if (pagination) response.pagination = pagination;

  res.status(statusCode).json(response);
};
