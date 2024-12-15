import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";

import Coshii from "@/app/components/icons/coshii.svg";
import Link from "next/link";

export default function OnboardingPhonePage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center p-8">
      <div>
        <h1 className="mt-4 text-center text-2xl text-black">
          Let&#39;s get some quick info!
        </h1>
        <h2 className="text-center text-gray-400">
          You can edit this later in settings
        </h2>
      </div>
      <div className="mt-4 rounded-full border border-gray-500 p-8">
        <Coshii className="fill-gray-500" width={175} height={175} />
      </div>
      <div className="mt-4 grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="shop-name" className="text-center text-lg">
          What will you call your shop?
        </Label>
        <Input id="shop-name" placeholder="Hannah's Shop" />
      </div>
      <div className="mt-4 grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="shop-name" className="text-center text-lg">
          What will you call your shop?
        </Label>
        <Input
          type="tel"
          id="phone-number"
          placeholder="(656) 555-7536"
          className="w-full"
        />
      </div>
      <Button className="mt-auto px-8 py-6 text-lg" variant="onboarding">
        <Link href="/onboarding/phone/otp">Continue</Link>
      </Button>
    </div>
  );
}
