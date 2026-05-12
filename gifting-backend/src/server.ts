// Server entry point. Loads env first so we crash early on missing config.

import { env } from "./config/env";
import { createApp } from "./app";

const app = createApp();

app.listen(env.port, "0.0.0.0", () => {
  console.log(`[server] listening on http://0.0.0.0:${env.port}`);
  console.log(`[server] env: ${env.nodeEnv}`);
  console.log(`[server] frontend origin (CORS): ${env.frontendOrigin}`);
});
