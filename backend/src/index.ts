import app from "./app";
import { config } from "./config";

export default app;

if (!process.env.VERCEL && process.env.NODE_ENV !== "test") {
  app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on port ${config.port}`);
  });
}
