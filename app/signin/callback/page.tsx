"use client";

import { useSignInWithMagicLinkEmail } from "@/app/hooks/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function CallbackPage() {
  const router = useRouter();
  const mutation = useSignInWithMagicLinkEmail();
  const hasRanRef = useRef(false);

  useEffect(() => {
    if (hasRanRef.current) return;
    const url = window?.location?.href;
    if (url) {
      mutation.mutate(url);
      hasRanRef.current = true;
    } else {
      console.error("Missing url");
    }
  }, [mutation, router]);

  if (mutation.isPending) {
    return <div>Completing signin...</div>;
  }
  if (mutation.isError) {
    return <div>Error completing signin...</div>;
  }
  if (mutation.isSuccess) {
    return <div>Completed signin</div>;
  }
  return null;
}
