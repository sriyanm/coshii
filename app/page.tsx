"use client";

import UserInfo from "@/components/user-info";
import { useFirebaseAuth } from "@/hooks/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const auth = useFirebaseAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoading && !auth.user) {
      router.push("/signin");
    }
  }, [auth, router]);

  if (auth.isLoading) {
    return <div>Loading auth state...</div>;
  }
  return auth.user ? <UserInfo user={auth.user} /> : <p>Not signed in...</p>;
}
