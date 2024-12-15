import { Button } from "@/app/components/ui/button";
import Link from "next/link";

export default function OnboardingFinishPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-between bg-gradient-to-b from-red-500 to-red-200 p-8">
      <div className="flex flex-col items-center justify-between">
        <h1 className="mt-8 text-center text-4xl text-white">
          Coshii makes it easy to sell your homemade pieces.
        </h1>
        <h1 className="mt-8 text-center text-4xl text-white">
          Would you like to add one now?
        </h1>
      </div>
      <div className="flex flex-col items-center justify-between">
        <Button className="mb-1 px-8 py-6 text-lg" variant="onboarding">
          <Link href="/add-product">Add a piece</Link>
        </Button>
        <Button className="px-8 py-6 text-lg" variant="onboardingSecondary">
          <Link href="/profile">Not now</Link>
        </Button>
      </div>
    </div>
  );
}
