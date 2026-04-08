import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { config } from "./config";
import { attachAuth } from "./auth/middleware";
import { authRouter } from "./routes/auth";
import { contentRouter } from "./routes/content";
import { adminRouter } from "./routes/admin";
import { HttpError } from "./lib/http";

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: config.frontendOrigin,
      credentials: true
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(attachAuth);

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/auth", authRouter);
  app.use(contentRouter);
  app.use("/admin", adminRouter);

  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (error instanceof HttpError) {
      return res.status(error.status).json({ message: error.message });
    }

    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(500).json({ message: "Unexpected error" });
  });

  return app;
};

const app = createApp();

export default app;
