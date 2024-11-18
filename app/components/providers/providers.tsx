import { FirebaseAuthProvider } from "@/app/components/providers/firebase-auth-provider";
import { QueryClientProvider } from "@/app/components/providers/query-client-provider";
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
