"use client";

import env from "@/app/lib/client/env";
import {
  getApps,
  initializeApp,
  FirebaseApp,
  FirebaseOptions,
} from "firebase/app";
import { connectAuthEmulator, getAuth as _getAuth, Auth } from "firebase/auth";
import {
  connectDataConnectEmulator,
  getDataConnect as _getDataConnect,
  DataConnect,
} from "firebase/data-connect";
import { connectorConfig } from "@firebasegen/dataconnect";

const firebaseConfig: FirebaseOptions = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

function getAuth(firebaseApp: FirebaseApp): Auth {
  const auth = _getAuth(firebaseApp);
  if (env.NODE_ENV !== "production") {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", {
      disableWarnings: true,
    });
  }
  return auth;
}

export const auth = getAuth(firebaseApp);

export function getDataConnect(): DataConnect {
  const dataConnect = _getDataConnect(connectorConfig);
  if (env.NODE_ENV !== "production") {
    connectDataConnectEmulator(dataConnect, "127.0.0.1", 9399);
  }
  return dataConnect;
}
