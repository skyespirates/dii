import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number(),
  MODE: z.enum(["dev", "prod"]),
  DATABASE_URL: z.string().min(1),
  GITHUB_ID: z.string().min(1),
  GITHUB_SECRET: z.string().min(1),
  GOOGLE_ID: z.string().min(1),
  GOOGLE_SECRET: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRED_IN: z.string().min(1),
});

export const env = envSchema.parse(process.env);
