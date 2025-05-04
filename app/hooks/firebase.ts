"use client";

import { FirebaseAuthContext } from "@/app/components/providers/firebase-auth-provider";
import { auth } from "@/app/lib/client/firebase";
import { useMutation } from "@tanstack/react-query";
import {
  ConfirmationResult,
  getAdditionalUserInfo,
  isSignInWithEmailLink,
  RecaptchaVerifier,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPhoneNumber,
  signOut,
  User,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

export function useFirebaseAuth() {
  const context = useContext(FirebaseAuthContext);
  if (context === null) {
    throw new Error(
      "useFirebaseAuth must be used within a FirebaseAuthProvider",
    );
  }
  return context;
}

const pendingMagicLinkEmailKey = "pendingMagicLinkEmail";

async function sendMagicLinkToEmail(email: string) {
  await sendSignInLinkToEmail(auth, email, {
    url: window.location.origin + "/signin/callback",
    handleCodeInApp: true,
  });
  // Save the email locally, so you don't need to ask the user for it again if they open the link on the same device.
  window.localStorage.setItem(pendingMagicLinkEmailKey, email);
}

export function useSendMagicLinkToEmail() {
  return useMutation({
    mutationKey: ["sendMagicLinkToEmail"],
    mutationFn: (email: string) => sendMagicLinkToEmail(email),
    retry: false,
    onMutate: (email) => {
      console.log("sending magic link to ", email);
    },
    onSuccess: () => {
      console.log("sent magic link");
    },
    onError: (error) => {
      console.error("failed to send magic link: ", error.message);
    },
  });
}

export type SigninWithMagicLinkResult = {
  user: User;
  isNewUser: boolean;
};

export async function signInWithMagicLinkEmail(
  link: string,
): Promise<SigninWithMagicLinkResult> {
  if (!isSignInWithEmailLink(auth, link)) {
    throw new Error("Magic link is invalid: " + link);
  }
  const email = window.localStorage.getItem(pendingMagicLinkEmailKey);
  if (!email) {
    throw new Error("Attempted to sign-in on a different device");
  }
  try {
    const result = await signInWithEmailLink(auth, email, link);
    const userInfo = getAdditionalUserInfo(result);
    if (!userInfo) {
      throw new Error("Failed to get user info");
    }
    return {
      user: result.user,
      isNewUser: userInfo.isNewUser,
    };
  } finally {
    window.localStorage.removeItem(pendingMagicLinkEmailKey);
  }
}

export function useSignInWithMagicLinkEmail() {
  const router = useRouter();
  return useMutation({
    mutationKey: ["signInWithMagicLinkEmail"],
    mutationFn: (link: string) => signInWithMagicLinkEmail(link),
    retry: false,
    onMutate: (link) => {
      console.log("signing in with magic link ", link);
    },
    onSuccess: (data) => {
      console.log("signed in with magic link ", data);
      router.push("/");
    },
    onError: (error) => {
      console.error("failed to sign in with magic link: ", error.message);
    },
  });
}

export function useSignOut() {
  return useMutation({
    mutationKey: ["signOut"],
    mutationFn: () => signOut(auth),
    retry: false,
    onMutate: () => {
      console.log("signing out");
    },
    onSuccess: () => {
      console.log("signed out");
    },
    onError: (error) => {
      console.error("failed to sign out: ", error.message);
    },
  });
}

export function useSignInWithPhoneNumber(recaptchaContainerId: string) {
  return useMutation({
    mutationKey: ["signInWithPhoneNumber"],
    retry: false,
    mutationFn: (phoneNumber: string) => {
      return signInWithPhoneNumber(
        auth,
        phoneNumber,
        new RecaptchaVerifier(auth, recaptchaContainerId, {
          size: "invisible",
        }),
      );
    },
    onMutate: () => {
      console.log("sending SMS sign-in code");
    },
    onSuccess: () => {
      console.log("sent SMS sign-in code");
    },
    onError: (error) => {
      console.error("failed to send SMS sign-in code: ", error.message);
    },
  });
}

export function usePhoneNumberConfirmationResult() {
  return useMutation({
    mutationKey: ["phoneNumberConfirmationResult"],
    retry: false,
    mutationFn: (params: {
      confirmationResult: ConfirmationResult;
      code: string;
    }) => params.confirmationResult.confirm(params.code),
    onMutate: () => {
      console.log("confirming SMS sign-in code");
    },
    onSuccess: () => {
      console.log("confirmed SMS sign-in code");
    },
    onError: (error) => {
      console.error("failed to confirm SMS sign-in code: ", error.message);
    },
  });
}

export function useSignInWithGoogle({
  onSuccess,
}: {
  onSuccess?: (data: { user: User; isNewUser: boolean }) => void;
}) {
  return useMutation({
    mutationKey: ["signInWithGoogle"],
    mutationFn: async () => {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const userInfo = getAdditionalUserInfo(result);
      if (!userInfo) {
        throw new Error("Failed to get user info");
      }
      return {
        user: result.user,
        isNewUser: userInfo.isNewUser,
      };
    },
    retry: false,
    onMutate: () => {
      console.log("signing in with Google");
    },
    onSuccess: (data) => {
      console.log("signed in with Google", data);
      onSuccess?.(data);
    },
    onError: (error) => {
      console.error("failed to sign in with Google:", error.message);
    },
  });
}

// Initialize Firebase Storage
const storage = getStorage(auth.app);

// Function to upload a file to Firebase Storage
export async function uploadProductMedia(
  file: File,
  userId: string,
): Promise<string> {
  // Create a storage reference with user ID and unique timestamp
  const timestamp = Date.now();
  const fileExtension = file.name.split(".").pop();
  const storagePath = `products/${userId}/${timestamp}.${fileExtension}`;
  const storageRef = ref(storage, storagePath);

  // Add metadata configuration with content type
  const metadata = {
    contentType: file.type,
    customMetadata: {
      origin: window.location.origin,
    },
  };

  // Upload the file with metadata
  await uploadBytes(storageRef, file, metadata);

  // Get and return the download URL
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}

// Hook to use the upload function with React
export function useProductMediaUpload() {
  return useMutation({
    mutationKey: ["uploadProductMedia"],
    mutationFn: async ({ file, userId }: { file: File; userId: string }) => {
      return uploadProductMedia(file, userId);
    },
  });
}

export async function deleteProductMedia(
  storagePathOrUrl: string,
): Promise<void> {
  let path = storagePathOrUrl;

  // If a full URL is passed, convert to storage path
  if (storagePathOrUrl.startsWith("https://")) {
    const decodedUrl = decodeURIComponent(storagePathOrUrl);
    const pathMatch = decodedUrl.match(/\/o\/(.*?)\?/);
    if (!pathMatch || pathMatch.length < 2) {
      throw new Error("Invalid Firebase Storage URL");
    }
    path = pathMatch[1].replace(/\+/g, " ");
  }

  const fileRef = ref(storage, path);
  await deleteObject(fileRef);
}

export function useProductMediaDelete() {
  return useMutation({
    mutationKey: ["deleteProductMedia"],
    mutationFn: async (storagePathOrUrl: string) => {
      return deleteProductMedia(storagePathOrUrl);
    },
  });
}

// Function to upload a file to Firebase Storage
export async function uploadProfilePicture(
  file: File,
  userId: string,
): Promise<string> {
  // Create a storage reference with user ID and unique timestamp
  const timestamp = Date.now();
  const fileExtension = file.name.split(".").pop();
  const storagePath = `shops/${userId}/${timestamp}.${fileExtension}`;
  const storageRef = ref(storage, storagePath);

  // Add metadata configuration with content type
  const metadata = {
    contentType: file.type,
    customMetadata: {
      origin: window.location.origin,
    },
  };

  // Upload the file with metadata
  await uploadBytes(storageRef, file, metadata);

  // Get and return the download URL
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}

// Hook to use the upload function with React
export function useProfilePictureUpload() {
  return useMutation({
    mutationKey: ["uploadProfilePicture"],
    mutationFn: async ({ file, userId }: { file: File; userId: string }) => {
      return uploadProfilePicture(file, userId);
    },
  });
}

export async function deleteProfilePicture(
  storagePathOrUrl: string,
): Promise<void> {
  let path = storagePathOrUrl;

  // If a full URL is passed, convert to storage path
  if (storagePathOrUrl.startsWith("https://")) {
    const decodedUrl = decodeURIComponent(storagePathOrUrl);
    const pathMatch = decodedUrl.match(/\/o\/(.*?)\?/);
    if (!pathMatch || pathMatch.length < 2) {
      throw new Error("Invalid Firebase Storage URL");
    }
    path = pathMatch[1].replace(/\+/g, " ");
  }

  const fileRef = ref(storage, path);
  await deleteObject(fileRef);
}

export function useProfilePictureDelete() {
  return useMutation({
    mutationKey: ["deleteProfilePicture"],
    mutationFn: async (storagePathOrUrl: string) => {
      return deleteProfilePicture(storagePathOrUrl);
    },
  });
}
