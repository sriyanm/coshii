"use client";

import { MagicLinkSigninForm } from "@/app/components/magic-link-signin-form";
import { GoogleSigninButton } from "@/app/components/GoogleSigninButton";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFirebaseAuth } from "@/app/hooks/firebase";
export default function SignInPage() {
  const { user, isLoading } = useFirebaseAuth();

  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/yourstore");
    }
  }, [user, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-5">
      <GoogleSigninButton />
      <MagicLinkSigninForm />
    </div>
  );
}
