import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z
    .string({
      description: "Firebase API Key",
    })
    .min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z
    .string({
      description: "Firebase Auth Domain",
    })
    .min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z
    .string({
      description: "Firebase Project ID",
    })
    .min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z
    .string({
      description: "Firebase Storage Bucket",
    })
    .min(1),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z
    .string({
      description: "Firebase Messaging Sender ID",
    })
    .min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID: z
    .string({
      description: "Firebase App ID",
    })
    .min(1),
});

const ENV = envSchema.parse(process.env);

export default ENV;
