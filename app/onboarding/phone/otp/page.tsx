import { Button } from "@/app/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/app/components/ui/input-otp";
import Link from "next/link";

export default function OnboardingPhoneOtpPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-between p-8">
      <div className="flex flex-col items-center justify-between">
        <h1 className="mt-4 text-center text-2xl text-black">
          We&#39;ve sent a text message to TODO
        </h1>
        <h2 className="mt-4 text-center text-gray-400">
          What is your verification code?
        </h2>
        <InputOTP maxLength={6}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>
      <div className="flex flex-col items-center justify-between">
        <Button className="px-8 py-6 text-lg" variant="onboarding">
          <Link href="/onboarding/finish">Continue</Link>
        </Button>
        <Button className="px-8 py-6 text-lg" variant="onboardingSecondary">
          <Link href="/onboarding/phone">Back</Link>
        </Button>
      </div>
    </div>
  );
}
