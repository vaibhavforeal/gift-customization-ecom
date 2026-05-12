// Express app factory. Kept separate from server.ts so it's easier to test.

import express from "express";
import cors from "cors";
import { env } from "./config/env";
import routes from "./routes";
import { errorHandler } from "./middleware/error";

export function createApp() {
  const app = express();

  // Support comma-separated origins so both localhost and deployed Vercel URL work.
  // e.g. FRONTEND_ORIGIN=http://localhost:5173,https://your-app.vercel.app
  const allowedOrigins = env.frontendOrigin
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, server-to-server)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: origin ${origin} not allowed`));
        }
      },
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
