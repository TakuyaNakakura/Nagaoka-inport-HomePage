import { ZodError } from "zod";
import type { Request, Response } from "express";

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const asyncHandler =
  (handler: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: (error?: unknown) => void) => {
    handler(req, res).catch(next);
  };

export const parsePagination = (query: Request["query"]) => {
  const page = Math.max(1, Number(query.page ?? 1) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(query.pageSize ?? 10) || 10));

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize
  };
};

export const sendZodError = (error: ZodError) => {
  const messages = error.issues.map((issue) => issue.message).join(", ");
  return new HttpError(400, messages);
};

export const notFound = (message = "Resource not found") => {
  throw new HttpError(404, message);
};

export const unauthorized = (message = "Unauthorized"): never => {
  throw new HttpError(401, message);
};

export const forbidden = (message = "Forbidden"): never => {
  throw new HttpError(403, message);
};

export const badRequest = (message: string): never => {
  throw new HttpError(400, message);
};

export const invariant = <T>(value: T | null | undefined, message: string): T => {
  if (value == null) {
    throw new HttpError(404, message);
  }

  return value;
};
