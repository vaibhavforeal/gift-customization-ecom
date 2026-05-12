// Express app factory. Kept separate from server.ts so it's easier to test.

import express from "express";
import cors from "cors";
import { env } from "./config/env";
import routes from "./routes";
import { errorHandler } from "./middleware/error";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.frontendOrigin,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));

  // All app routes under /api
  app.use("/api", routes);

  // 404 for unmatched routes
  app.use((req, res) => {
    res.status(404).json({ error: `Not found: ${req.method} ${req.path}` });
  });

  app.use(errorHandler);

  return app;
}
