"use client";

// import { MagicLinkSigninForm } from "@/app/components/magic-link-signin-form";
import { GoogleSigninButton } from "@/app/components/GoogleSigninButton";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFirebaseAuth } from "@/app/hooks/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/client/firebase";
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/app/components/ui/button";

export default function SignInPage() {
  const { user, isLoading } = useFirebaseAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    <div className="flex h-screen flex-col items-center justify-center gap-5 px-4">
      {!errorMessage && (
        <GoogleSigninButton 
          allowNewUser={false}
          onError={(error) => {
            console.log("Google sign-in error:", error);
            if (error instanceof Error && error.message === "New users are not allowed") {
              setErrorMessage("It seems like this is your first time here. Please set up your shop.");
              // router.push("/onboarding");
            }
            else if (error instanceof Error) {
              setErrorMessage("Failed to sign in with Google. Please try again.");
            }
          }}
        />
      )}
      {errorMessage && !errorMessage.endsWith("Please set up your shop.") && (
        <Alert
          variant={
            "destructive"
          }
        >
          <AlertCircle className="size-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}
      {errorMessage && errorMessage.endsWith("Please set up your shop.") && (
        <div className="fixed inset-0 mx-auto flex min-h-screen max-w-md flex-col items-center p-8">
          <div>
            <h1 className="mb-6 mt-4 text-start text-xl font-bold text-gray-600">
            You don&apos;t have a shop yet, let&apos;s get you set up now.
            </h1>
          </div>
          <div className="fixed bottom-0 mx-auto w-full max-w-md px-10 py-4">
            <div className="flex justify-center">
              <Button
                id="recaptcha-element"
                className="w-full min-w-24 py-6 text-lg"
                variant="onboarding"
                onClick={function () {
                  router.push("/onboarding");
                }}
              >
                {"Continue"}
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* <MagicLinkSigninForm /> */}
    </div>
  );
}
