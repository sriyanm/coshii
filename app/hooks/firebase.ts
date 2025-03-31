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

export function useSignInWithGoogle() {
  const router = useRouter();
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
      router.push("/");
    },
    onError: (error) => {
      console.error("failed to sign in with Google:", error.message);
    },
  });
}
