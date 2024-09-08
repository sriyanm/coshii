/// <reference lib="WebWorker" />
export type {};
declare let self: ServiceWorkerGlobalScope;

import { auth } from "@/lib/client/firebase";
import { Auth, getIdToken } from "firebase/auth";

self.addEventListener("install", async (event) => {
  console.log("Service worker installed");
});

self.addEventListener("activate", async (event) => {
  console.log("Service worker activated");
});

self.addEventListener("fetch", async (event) => {
  console.log("Service worker fetch");
  const { origin } = new URL(event.request.url);
  if (origin !== self.location.origin) return;
  event.respondWith(fetchWithFirebaseHeaders(event.request));
});

async function fetchWithFirebaseHeaders(request: Request): Promise<Response> {
  const headers = new Headers(request.headers);
  const authIdToken = await getAuthIdToken(auth);
  if (authIdToken) headers.append("Authorization", `Bearer ${authIdToken}`);
  const newRequest = new Request(request, { headers });
  return await fetch(newRequest);
}

async function getAuthIdToken(auth: Auth): Promise<string | null> {
  await auth.authStateReady();
  if (!auth.currentUser) return null;
  return await getIdToken(auth.currentUser);
}
