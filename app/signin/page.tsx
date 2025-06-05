import { Suspense } from "react";
import SignInContent from "./signin-content";

export default function SignInPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}