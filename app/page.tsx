"use client";

import { useFirebaseAuth } from "@/app/hooks/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/client/firebase";

export default function HomeRedirect() {
  const auth = useFirebaseAuth();
  const router = useRouter();

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      if (!auth.isLoading && !auth.user) {
        router.push("/onboarding");
        return;
      }

      if (auth.user) {
        const q = query(
          collection(db, "shops"),
          where("creatorId", "==", auth.user.uid),
        );

        try {
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const shopDoc = querySnapshot.docs[0].data();
            const shopHandle = shopDoc.username;
            router.push(`/${shopHandle}`);
          } else {
            router.push("/onboarding"); // fallback if no shop exists
          }
        } catch (err) {
          console.error("Error fetching shop info:", err);
        }
      }
    };

    checkUserAndRedirect();
  }, [auth, router]);

  // Loading animation
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="size-10 animate-spin rounded-full border-y-2 border-gray-900" />
    </div>
  );
}
