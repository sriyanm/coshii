import "server-only";
import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string({
    description: "Firebase API Key",
  }),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string({
    description: "Firebase Auth Domain",
  }),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string({
    description: "Firebase Project ID",
  }),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string({
    description: "Firebase Storage Bucket",
  }),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string({
    description: "Firebase Messaging Sender ID",
  }),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string({
    description: "Firebase App ID",
  }),
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
