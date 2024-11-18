"use client";

import { auth } from "@/app/lib/client/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
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
    navigator.serviceWorker
      .register(new URL("../../service-worker.ts", import.meta.url))
      .then((registration) => console.log(registration));
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setState((prevState) => {
        return {
          ...prevState,
          isLoading: false,
          user: authUser,
        };
      });
    });
    return () => unsubscribe();
  }, []);

  return (
    <FirebaseAuthContext.Provider value={state}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};
