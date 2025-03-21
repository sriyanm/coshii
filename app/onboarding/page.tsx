"use client";

import Coshii from "@/app/components/icons/coshii.svg";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/app/components/ui/input-otp";
import { Label } from "@/app/components/ui/label";
import { UseMutationResult } from "@tanstack/react-query";
import { ConfirmationResult, UserCredential } from "firebase/auth";
import Link from "next/link";
import { Dispatch, SetStateAction, useState } from "react";
import PhoneInput, {
  isPossiblePhoneNumber,
} from "react-phone-number-input/input";
import {
  usePhoneNumberConfirmationResult,
  useSignInWithPhoneNumber,
} from "../hooks/firebase";
import { db, auth } from "@/app/lib/client/firebase";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";

enum Page {
  INTRO = 1,
  DETAILS,
  OTP,
  FINISH,
}

type ConfirmationResultMutationParams = {
  confirmationResult: ConfirmationResult;
  code: string;
};

export default function OnboardingPage() {
  const [page, setPage] = useState(Page.INTRO);
  const [shopName, setShopName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const signInMutation = useSignInWithPhoneNumber("recaptcha-element");
  const confirmationResultMutation = usePhoneNumberConfirmationResult();
  if (page == Page.INTRO) {
    return IntroPage(setPage);
  } else if (page == Page.DETAILS) {
    return OnboardingDetailsPage(
      setPage,
      shopName,
      setShopName,
      phoneNumber,
      setPhoneNumber,
      signInMutation,
    );
  } else if (page == Page.OTP) {
    return OnboardingPhoneOtpPage(
      setPage,
      otp,
      setOtp,
      signInMutation,
      confirmationResultMutation,
      shopName,
    );
  } else if (page == Page.FINISH) {
    return OnboardingFinishPage();
  } else {
    throw Error("unknown page");
  }
}

function IntroPage(setPage: Dispatch<SetStateAction<Page>>) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center bg-gradient-to-b from-red-500 to-red-200 p-8">
      <Coshii className="m-auto fill-white" width={220} height={220} />
      <Button
        className="px-8 py-6 text-lg"
        variant="onboarding"
        onClick={function () {
          setPage(Page.DETAILS);
        }}
      >
        Continue
      </Button>
    </div>
  );
}

function OnboardingDetailsPage(
  setPage: Dispatch<SetStateAction<Page>>,
  shopName: string,
  setShopName: Dispatch<SetStateAction<string>>,
  phoneNumber: string,
  setPhoneNumber: Dispatch<SetStateAction<string>>,
  signInMutation: UseMutationResult<ConfirmationResult, Error, string, void>,
) {
  const getButtonText = () => {
    if (signInMutation.isPending) {
      return "Sending SMS...";
    } else if (signInMutation.isError) {
      return "Error! Try again";
    } else {
      return "Continue";
    }
  };

  const handleContinue = async () => {
    try {
      // Update the phone number in users collection first
      if (auth.currentUser) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userDocRef, {
          phoneNumber: phoneNumber,
        });
      }
      // Development bypass for SMS verification
      console.log("SMS Handler Called with phone number:", phoneNumber);
      setPage(Page.OTP);

      // Comment out the actual SMS verification for now
      /*
      signInMutation.mutate(phoneNumber, {
        onSuccess: () => setPage(Page.OTP)
      });
      */
    } catch (error) {
      console.error("Error updating phone number:", error);
    }
  };

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
        <Input
          id="shop-name"
          placeholder="Hannah's Shop"
          onChange={function (e) {
            setShopName(e.currentTarget.value);
          }}
          value={shopName}
        />
      </div>
      <div className="mt-4 grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="phone-number" className="text-center text-lg">
          What is your phone number?
        </Label>
        <PhoneInput
          id="phone-number"
          country="US"
          international={false}
          placeholder="(656) 555-7536"
          className="w-full"
          onChange={function (phoneNumber) {
            setPhoneNumber(phoneNumber || "");
          }}
          value={phoneNumber}
          disabled={signInMutation.isPending}
        />
      </div>
      <Button
        id="recaptcha-element"
        className="mt-auto px-8 py-6 text-lg"
        variant="onboarding"
        onClick={handleContinue}
        disabled={
          signInMutation.isPending ||
          !shopName ||
          !phoneNumber ||
          !isPossiblePhoneNumber(phoneNumber)
        }
      >
        {getButtonText()}
      </Button>
    </div>
  );
}

function OnboardingPhoneOtpPage(
  setPage: Dispatch<SetStateAction<Page>>,
  otp: string,
  setOtp: Dispatch<SetStateAction<string>>,
  signInMutation: UseMutationResult<ConfirmationResult, Error, string, void>,
  confirmationResultMutation: UseMutationResult<
    UserCredential,
    Error,
    ConfirmationResultMutationParams,
    void
  >,
  shopName: string,
) {
  const getButtonText = () => {
    if (confirmationResultMutation.isPending) {
      return "Confirming code...";
    } else if (confirmationResultMutation.isError) {
      return "Error! Try again";
    }
    return "Continue";
  };

  const createShopAndContinue = async () => {
    try {
      if (auth.currentUser) {
        const shopRef = collection(db, "shops");
        await addDoc(shopRef, {
          creatorId: auth.currentUser.uid,
          shopName: shopName,
          createdAt: new Date(),
        });
        console.log("Shop created successfully");
      } else {
        console.error("No authenticated user found when creating shop");
      }
      setPage(Page.FINISH);
    } catch (error) {
      console.error("Error creating shop:", error);
      // Still continue to finish page even if shop creation fails
      setPage(Page.FINISH);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-between p-8">
      <div className="flex flex-col items-center justify-between">
        <h1 className="mt-4 text-center text-2xl text-black">
          We&#39;ve sent a text message to TODO
        </h1>
        <h2 className="mt-4 text-center text-gray-400">
          What is your verification code?
        </h2>
        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
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
        <Button
          className="px-8 py-6 text-lg"
          variant="onboarding"
          onClick={async function () {
            // Development bypass
            console.log("OTP Verification bypassed. Code entered:", otp);
            await createShopAndContinue();

            /* Production code - commented out for development
            if (!signInMutation.isSuccess) {
              throw Error("SMS sign-in code was not sent");
            }
            confirmationResultMutation.mutate(
              { confirmationResult: signInMutation.data, code: otp },
              {
                onSuccess: async () => {
                  await createShopAndContinue();
                }
              },
            );
            */
          }}
          disabled={
            otp.length != 6
            /* Production checks - commented out for development
            ||
            !signInMutation.isSuccess ||
            confirmationResultMutation.isPending
            */
          }
        >
          {getButtonText()}
        </Button>
        <Button
          className="px-8 py-6 text-lg"
          variant="onboardingSecondary"
          disabled={confirmationResultMutation.isPending}
          onClick={function () {
            setPage(Page.DETAILS);
          }}
        >
          Back
        </Button>
      </div>
    </div>
  );
}

function OnboardingFinishPage() {
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
