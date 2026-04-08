import dotenv from "dotenv";

dotenv.config();

const required = (value: string | undefined, key: string) => {
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
};

const parseSeedMode = (value: string | undefined) => {
  if (!value) {
    return "bootstrap" as const;
  }

  if (value === "bootstrap" || value === "demo") {
    return value;
  }

  throw new Error(`Invalid SEED_MODE: ${value}`);
};

export const config = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: required(process.env.DATABASE_URL, "DATABASE_URL"),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:3000",
  sessionSecret: required(process.env.SESSION_SECRET, "SESSION_SECRET"),
  isProduction: process.env.NODE_ENV === "production",
  seedMode: parseSeedMode(process.env.SEED_MODE),
  initialAdmin: {
    loginId: process.env.ADMIN_LOGIN_ID ?? "admin",
    email: process.env.ADMIN_EMAIL ?? "admin@example.com",
    userName: process.env.ADMIN_NAME ?? "Portal Admin",
    password: process.env.ADMIN_PASSWORD ?? "change-me-now"
  }
};
