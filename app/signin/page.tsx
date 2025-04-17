"use client";

import { MagicLinkSigninForm } from "@/app/components/magic-link-signin-form";
import { GoogleSigninButton } from "@/app/components/GoogleSigninButton";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFirebaseAuth } from "@/app/hooks/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/client/firebase";

export default function SignInPage() {
  const { user, isLoading } = useFirebaseAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const fetchShopAndRedirect = async () => {
      if (!user || redirecting) return;

      const q = query(
        collection(db, "shops"),
        where("creatorId", "==", user.uid),
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const shopDoc = querySnapshot.docs[0].data();
        const shopHandle = shopDoc.username;
        setRedirecting(true);
        router.push(`/${shopHandle}`);
      } else {
        console.warn("No shop found for this user.");
      }
    };

    fetchShopAndRedirect();
  }, [user, router, redirecting]);

  if (isLoading || redirecting) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-5">
      <GoogleSigninButton />
      <MagicLinkSigninForm />
    </div>
  );
}
