import { useSignOut } from "@/app/hooks/firebase";
import { Button } from "./ui/button";
import { useState } from "react";

type Props = {
  shopHandle: string;
};

export function SignoutButton({ shopHandle }: Props) {
  const signOut = useSignOut(shopHandle);
  const [isLoading, setIsLoading] = useState(false);
  return (
    <Button
      onClick={() => {
        signOut.mutate();
        setIsLoading(true);
      }}
    >
      {isLoading ? "Signing out..." : "Sign out"}
    </Button>
  );
}
