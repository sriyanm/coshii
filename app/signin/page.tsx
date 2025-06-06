import { Suspense } from "react";
import SignInContent from "./signin-content";

export default function SignInPageWrapper() {
  return (
    <Suspense fallback={      
      <div className="flex h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-b-2 border-gray-900" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}