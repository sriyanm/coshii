"use client";

import UserInfo from "@/app/components/user-info";
import { useFirebaseAuth } from "@/app/hooks/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SignoutButton } from "@/app/components/SignoutButton";

export default function Home() {
  const auth = useFirebaseAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoading && !auth.user) {
      router.push("/signin");
    }
    if (auth.user) {
      router.push("/store");
    }
  }, [auth, router]);

  if (auth.isLoading) {
    return <div>Loading auth state...</div>;
  }
  return auth.user ? (
    <div>
      <UserInfo user={auth.user} />
      <SignoutButton />
    </div>
  ) : (
    <p>Not signed in...</p>
  );
}
