"use client";

import { auth, db } from "@/app/lib/client/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
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
        const userRef = doc(db, "users", authUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            email: authUser.email,
            plan: "free",
            createdAt: new Date(),
          });
        } else {
          await updateDoc(userRef, {
            updatedAt: new Date(),
          });
        }

        setState((prevState) => ({
          ...prevState,
          isLoading: false,
          user: authUser,
        }));
      } else {
        setState((prevState) => ({
          ...prevState,
          isLoading: false,
          user: null,
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <FirebaseAuthContext.Provider value={state}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};
