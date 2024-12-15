import { Button } from "@/app/components/ui/button";
import Coshii from "@/app/components/icons/coshii.svg";
import Link from "next/link";

export default function OnboardingPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center bg-gradient-to-b from-red-500 to-red-200 p-8">
      <Coshii className="m-auto fill-white" width={220} height={220} />
      <Button className="px-8 py-6 text-lg" variant="onboarding">
        <Link href="/onboarding/phone">Continue</Link>
      </Button>
    </div>
  );
}
