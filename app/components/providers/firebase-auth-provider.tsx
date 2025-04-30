"use client";

import { auth, db } from "@/app/lib/client/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { createContext, ReactNode, useEffect, useState } from "react";

type FirebaseAuthState = {
  user: User | null;
  isLoading: boolean;
};

export const FirebaseAuthContext = createContext<FirebaseAuthState | null>(
  null,
);

export const FirebaseAuthProvider = ({
  initialUser,
  children,
}: {
  initialUser: User | null;
  children: ReactNode;
}) => {
  initialUser = initialUser || auth.currentUser;
  const [state, setState] = useState<FirebaseAuthState>({
    user: initialUser,
    isLoading: initialUser === null,
  });

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register(new URL("../../service-worker.ts", import.meta.url))
        .then((registration) => console.log("SW registered:", registration))
        .catch((err) => console.error("SW registration failed:", err));
    } else {
      console.log("Service worker not supported in this environment.");
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        // Update user document in Firestore
        console.log("User is signed in or refresh:", authUser);
        await setDoc(
          doc(db, "users", authUser.uid),
          {
            phoneNumber: authUser.phoneNumber,
            email: authUser.email,
            updatedAt: new Date(),
            plan: "free",
            followers: [],
            following: [],
          },
          { merge: true },
        );
      }
      setState((prevState) => ({
        ...prevState,
        isLoading: false,
        user: authUser,
      }));
    });
    return () => unsubscribe();
  }, []);

  return (
    <FirebaseAuthContext.Provider value={state}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};
