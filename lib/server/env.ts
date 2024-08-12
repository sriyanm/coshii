import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .union([
      z.literal("production"),
      z.literal("development"),
      z.literal("test"),
    ])
    .default("development"),
  POSTGRES_DB: z
    .string({
      description: "Postgres DB name",
    })
    .min(1),
  POSTGRES_HOST: z
    .string({
      description: "Postgres DB host",
    })
    .min(1),
  POSTGRES_PASSWORD: z
    .string({
      description: "Postgres DB password",
    })
    .min(1),
  POSTGRES_PORT: z.coerce.number({
    description: "Postgres DB port",
  }),
  POSTGRES_USER: z
    .string({
      description: "Postgres DB user",
    })
    .min(1),
});

const ENV = envSchema.parse(process.env);

export default ENV;
