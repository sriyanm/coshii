"use client";

import UserInfo from "@/app/components/user-info";
import { useFirebaseAuth } from "@/app/hooks/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SignoutButton } from "@/app/components/SignoutButton";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/client/firebase";

export default function Home() {
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
            console.warn("No shop found for this user.");
          }
        } catch (err) {
          console.error("Error fetching shop info:", err);
        }
      }
    };

    checkUserAndRedirect();
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
