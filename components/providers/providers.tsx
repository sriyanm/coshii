import { FirebaseAuthProvider } from "@/components/providers/firebase-auth-provider";
import { QueryClientProvider } from "@/components/providers/query-client-provider";
import { User } from "firebase/auth";
import { ReactNode } from "react";

export const Providers = ({
  initialUser,
  children,
}: {
  initialUser: User | null;
  children: ReactNode;
}) => {
  return (
    <QueryClientProvider>
      <FirebaseAuthProvider initialUser={initialUser}>
        {children}
      </FirebaseAuthProvider>
    </QueryClientProvider>
  );
};
