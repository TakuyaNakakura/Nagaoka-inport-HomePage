import { createApp } from "./app";
import { config } from "./config";

const app = createApp();

export default app;

if (!process.env.VERCEL && process.env.NODE_ENV !== "test") {
  app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on port ${config.port}`);
  });
}
