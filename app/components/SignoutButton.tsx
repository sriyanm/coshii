import { useSignOut } from "@/app/hooks/firebase";
import { Button } from "./ui/button";

type Props = {
  shopHandle: string;
};

export function SignoutButton({ shopHandle }: Props) {
  const signOut = useSignOut(shopHandle);

  return (
    <Button
      onClick={() => {
        signOut.mutate();
      }}
    >
      Sign out
    </Button>
  );
}
