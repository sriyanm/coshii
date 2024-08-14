"use client";

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .union([
      z.literal("production"),
      z.literal("development"),
      z.literal("test"),
    ])
    .default("development"),
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
});

// process.env does not exist on the client side so we need to repeat each key for replacement at build time
// https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables#bundling-environment-variables-for-the-browser
const ENV = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

export default ENV;
