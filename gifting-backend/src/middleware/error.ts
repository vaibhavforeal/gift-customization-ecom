// Catch-all error handler. Express invokes this when a route throws
// or calls next(err). Keeps responses consistent and hides stack traces in prod.

import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  // Zod validation failures
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation failed",
      details: err.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
    return;
  }

  // Plain Error objects
  if (err instanceof Error) {
    console.error("[error]", err.message, err.stack);
    res.status(500).json({ error: err.message || "Internal server error" });
    return;
  }

  console.error("[error] unknown", err);
  res.status(500).json({ error: "Internal server error" });
}
