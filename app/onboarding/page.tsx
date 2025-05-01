"use client";

// import Coshii from "@/app/components/icons/coshii.svg";
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
import { Suspense, Dispatch, SetStateAction, useState, useEffect } from "react";
import PhoneInput, {
  isPossiblePhoneNumber,
} from "react-phone-number-input/input";
import {
  usePhoneNumberConfirmationResult,
  useSignInWithPhoneNumber,
} from "../hooks/firebase";
import { db, auth } from "@/app/lib/client/firebase";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { MagicLinkSigninForm } from "@/app/components/magic-link-signin-form";
import { GoogleSigninButton } from "@/app/components/GoogleSigninButton";
import { useRouter, useSearchParams } from "next/navigation";

// import { set } from "zod";

enum Page {
  INTRO = 1,
  DETAILS,
  MOREDETAILS,
  SIGNIN,
  PHONE,
  OTP,
  FINISH,
}

type ConfirmationResultMutationParams = {
  confirmationResult: ConfirmationResult;
  code: string;
};

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}

function OnboardingContent() {
  const [page, setPage] = useState(Page.INTRO);
  const [shopName, setShopName] = useState("");
  const [shopHandle, setShopHandle] = useState("");
  const [shopDescription, setShopDescription] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const signInMutation = useSignInWithPhoneNumber("recaptcha-element");
  const confirmationResultMutation = usePhoneNumberConfirmationResult();

  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");
  const router = useRouter();

  useEffect(() => {
    if (pageParam) {
      const pageEnum = parseInt(pageParam, 10);
      if (Object.values(Page).includes(pageEnum)) {
        setPage(pageEnum as Page); // Set the current page using the enum
      }
    } else {
      setPage(Page.INTRO);
    }
  }, [pageParam]);

  const handlePageChange = (nextPage: Page) => {
    const validPage = Object.values(Page).includes(nextPage);
    if (validPage) {
      router.push(`/onboarding?page=${nextPage}`);
    } else {
      router.replace("/onboarding");
    }
  };

  return (
    <>
      {page === Page.INTRO && IntroPage(handlePageChange)}
      {page === Page.DETAILS &&
        OnboardingDetailsPage(
          handlePageChange,
          shopName,
          setShopName,
          phoneNumber,
          setPhoneNumber,
          signInMutation,
          shopHandle,
          setShopHandle,
        )}
      {page === Page.MOREDETAILS &&
        OnboardingMoreDetailsPage(
          handlePageChange,
          signInMutation,
          shopDescription,
          setShopDescription,
        )}
      {page === Page.SIGNIN && SignInPage(handlePageChange)}
      {page === Page.PHONE &&
        PhoneNumberPage(
          handlePageChange,
          signInMutation,
          phoneNumber,
          setPhoneNumber,
        )}
      {page === Page.OTP &&
        OnboardingPhoneOtpPage(
          handlePageChange,
          otp,
          setOtp,
          signInMutation,
          confirmationResultMutation,
          shopName,
          phoneNumber,
          shopDescription,
          shopHandle,
        )}
      {page === Page.FINISH && OnboardingFinishPage(shopHandle)}
    </>
  );
}

function IntroPage(setPage: (nextPage: Page) => void) {
  const router = useRouter();
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center bg-gradient-to-b from-[#FF5640] to-[#E6B4AD] p-8">
      <div className="flex-1"></div>

      <div className="flex w-full max-w-sm flex-col items-center px-6 text-center">
        <h1 className="mb-2 text-xl font-bold text-white">Welcome to</h1>
        <div className="mb-4 text-8xl font-bold text-white">Coshii</div>
        <p className="text-xl font-medium text-white">
          Sell Online, Sell Together
        </p>
      </div>

      <div className="flex-1"></div>
      <div className="fixed bottom-0 mx-auto w-full max-w-md py-4 text-center">
        <Button
          className="px-28 py-6 text-lg"
          variant="onboardingFirst"
          onClick={function () {
            setPage(Page.DETAILS);
          }}
        >
          Get Started
        </Button>

        <p className="mt-4 text-sm text-white">
          Already have an account?{" "}
          <button
            onClick={() => router.push("/signin")}
            className="font-semibold underline underline-offset-2"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}

function OnboardingDetailsPage(
  setPage: (nextPage: Page) => void,
  shopName: string,
  setShopName: Dispatch<SetStateAction<string>>,
  phoneNumber: string,
  setPhoneNumber: Dispatch<SetStateAction<string>>,
  signInMutation: UseMutationResult<ConfirmationResult, Error, string, void>,
  shopHandle: string,
  setShopHandle: Dispatch<SetStateAction<string>>,
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
      // // Update the phone number in users collection first
      // if (auth.currentUser) {
      //   const userDocRef = doc(db, "users", auth.currentUser.uid);
      //   await updateDoc(userDocRef, {
      //     // TODO: update shop name and shop handle, check if handle exists
      //     shopName: shopName,
      //   });
      // }
      // Development bypass for SMS verification
      // console.log("SMS Handler Called with phone number:", phoneNumber);
      setPage(Page.MOREDETAILS);

      // Comment out the actual SMS verification for now
      /*
      signInMutation.mutate(phoneNumber, {
        onSuccess: () => setPage(Page.OTP)
      });
      */
    } catch (error) {
      console.error("Error updating user info:", error);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center p-8">
      <div>
        <h1 className="mb-6 mt-4 text-center text-xl font-bold text-black">
          Let&#39;s get some quick info!
        </h1>
      </div>
      {/* <div className="mt-4 rounded-full border border-gray-500 p-8">
        <Coshii className="fill-gray-500" width={175} height={175} />
      </div> */}
      <div className="mb-5 mt-4 grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="shop-name" className="text-md text-left">
          What will you call your shop? You can always change it later...
        </Label>
        <Input
          id="shop-name"
          placeholder="Srikar Studios"
          onChange={function (e) {
            setShopName(e.currentTarget.value);
          }}
          value={shopName}
          className="h-12 w-96 p-4 text-xl"
        />
      </div>
      <div className="mt-4 grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="shop-handle" className="text-md text-left">
          Coshii is social. Pick a handle for your shop. This is like a handle
          on social media that others sellers can use to find and follow you.
        </Label>
        {/* <PhoneInput
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
        /> */}
        <Input
          id="shop-name"
          placeholder="@Srikar"
          onChange={(e) => {
            setShopHandle(e.currentTarget.value.replace(/^@/, "")); // Remove leading @ if present
          }}
          value={`@${shopHandle}`}
          className="h-12 w-96 p-4 text-xl"
        />
      </div>
      <Button
        id="recaptcha-element"
        className="mt-auto px-36 py-6 text-lg"
        variant="onboarding"
        onClick={handleContinue}
        disabled={
          signInMutation.isPending || !shopName || !shopHandle
          // TODO: or if handle already exists
        }
      >
        {getButtonText()}
      </Button>
    </div>
  );
}

function OnboardingMoreDetailsPage(
  setPage: (nextPage: Page) => void,
  signInMutation: UseMutationResult<ConfirmationResult, Error, string, void>,
  shopDescription: string,
  setShopDescription: Dispatch<SetStateAction<string>>,
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
      // if (auth.currentUser) {
      //   const userDocRef = doc(db, "users", auth.currentUser.uid);
      //   await updateDoc(userDocRef, {
      //     // TODO: update shop bio
      //     phoneNumber: phoneNumber,
      //   });
      // }
      // Development bypass for SMS verification
      // console.log("SMS Handler Called with phone number:", phoneNumber);
      // window.location.href = "/signin";
      setPage(Page.SIGNIN);
      // Comment out the actual SMS verification for now
      /*
      signInMutation.mutate(phoneNumber, {
        onSuccess: () => setPage(Page.OTP)
      });
      */
    } catch (error) {
      console.error("Error updating user info:", error);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center p-8">
      <div>
        <h1 className="mb-6 mt-4 text-center text-xl font-bold text-black">
          Let&#39;s get some quick info!
        </h1>
      </div>
      {/* <div className="mt-4 rounded-full border border-gray-500 p-8">
        <Coshii className="fill-gray-500" width={175} height={175} />
      </div> */}
      <div className="mb-5 mt-4 grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="shop-bio" className="text-md mb-6 text-left">
          Write a short bio to describe what you sell, your vibe, or anything
          else you want to into your shop to people.
        </Label>
        <textarea
          id="bio"
          placeholder="Handmade ceramics from my studio in Los Angeles. DM me on Insta with any questions!"
          onChange={(e) => setShopDescription(e.currentTarget.value)}
          value={shopDescription}
          className="text-md h-48 w-96 resize-none rounded-lg border p-4"
        />
      </div>
      <Button
        id="recaptcha-element"
        className="mt-auto px-36 py-6 text-lg"
        variant="onboarding"
        onClick={handleContinue}
        disabled={signInMutation.isPending || !shopDescription}
      >
        {getButtonText()}
      </Button>
    </div>
  );
}

function SignInPage(setPage: (nextPage: Page) => void) {
  return (
    <>
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center p-8">
        <div>
          <h1 className="mb-6 mt-4 text-center text-xl font-bold text-black">
            Let&#39;s set up your account!
          </h1>
        </div>
        <GoogleSigninButton //TOOD: should check if already account associated with email
          onSuccess={() => {
            setPage(Page.PHONE);
          }}
        />
        <MagicLinkSigninForm />
      </div>
    </>
  );
}

function PhoneNumberPage(
  setPage: (nextPage: Page) => void,
  signInMutation: UseMutationResult<ConfirmationResult, Error, string, void>,
  phoneNumber: string,
  setPhoneNumber: Dispatch<SetStateAction<string>>,
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
      // if (auth.currentUser) {
      //   const userDocRef = doc(db, "users", auth.currentUser.uid);
      //   await updateDoc(userDocRef, {
      //     phoneNumber: phoneNumber,
      //   });
      // }
      // Development bypass for SMS verification
      // console.log("SMS Handler Called with phone number:", phoneNumber);
      setPage(Page.OTP);
      // Comment out the actual SMS verification for now
      /*
      signInMutation.mutate(phoneNumber, {
        onSuccess: () => setPage(Page.OTP)
      });
      */
    } catch (error) {
      console.error("Error:", error);
    }
  };
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center p-8">
      <div>
        <h1 className="mb-6 mt-4 text-center text-xl font-bold text-black">
          Let&#39;s set up your account!
        </h1>
      </div>
      {/* <div className="mt-4 rounded-full border border-gray-500 p-8">
        <Coshii className="fill-gray-500" width={175} height={175} />
      </div> */}
      <div className="mb-5 mt-4 grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="shop-name" className="text-md text-left">
          To verify its you, what is your phone number?
        </Label>
        <PhoneInput
          id="phone-number"
          country="US"
          international={false}
          placeholder="(656) 555-7536"
          className="h-12 w-96 p-4 text-xl"
          onChange={function (phoneNumber) {
            setPhoneNumber(phoneNumber || "");
          }}
          value={phoneNumber}
          disabled={signInMutation.isPending}
        />
      </div>
      <Button
        id="recaptcha-element"
        className="mt-auto px-36 py-6 text-lg"
        variant="onboarding"
        onClick={handleContinue}
        disabled={
          signInMutation.isPending ||
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
  setPage: (nextPage: Page) => void,
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
  phoneNumber: string,
  shopDescription: string,
  shopHandle: string,
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
        // Create shop document
        const shopRef = collection(db, "shops");
        await addDoc(shopRef, {
          categories: ["All"],
          createdAt: new Date(),
          creatorId: auth.currentUser.uid,
          description: shopDescription,
          email: auth.currentUser.email,
          isPremium: false,
          profilePic: "/tempImages/basketWeaver.jpg",
          shopName: shopName,
          username: shopHandle,
          followers: {},
          following: {},
        });

        // Update user document with shop name and phone number
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        console.log(
          "Updating phone number (temporarily b/c otp does not work) in user document",
        );
        await updateDoc(userDocRef, {
          shopName: shopName,
          phoneNumber: phoneNumber,
        });

        console.log("Shop created and user updated successfully");
        setPage(Page.FINISH);
      } else {
        console.error("No authenticated user found when creating shop");
        setPage(Page.FINISH);
      }
    } catch (error) {
      console.error("Error creating shop or updating user:", error);
      // Still continue to finish page even if shop creation fails
      setPage(Page.FINISH);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-between p-8">
      <div className="flex flex-col items-center justify-between">
        <h1 className="mt-4 text-center text-2xl text-black">
          We&#39;ve sent a text message to {phoneNumber}
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

function OnboardingFinishPage(shopHandle: string) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-between bg-gradient-to-b from-red-500 to-red-200 p-8">
      <div className="flex flex-col items-center justify-between">
        <h1 className="mt-8 text-left text-4xl text-white">
          Selling on Coshii is easy
        </h1>
        <h1 className="mt-8 text-left text-4xl text-white">
          Would you like to add a new item now?
        </h1>
      </div>
      <div className="flex flex-col items-center justify-between">
        <Button className="mb-1 px-8 py-6 text-lg" variant="onboardingThird">
          <Link href="/add-product">Add a piece</Link>
        </Button>
        <Button className="px-8 py-6 text-lg" variant="onboardingSecondary">
          <Link href={`/${shopHandle}`}>Take me to my shop</Link>
        </Button>
      </div>
    </div>
  );
}
