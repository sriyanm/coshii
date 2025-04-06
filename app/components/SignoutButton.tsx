import { useSignOut } from "@/app/hooks/firebase";
import { Button } from "./ui/button";

export function SignoutButton() {
  const signOut = useSignOut();

  return <Button onClick={() => signOut.mutate()}>Sign out</Button>;
}
