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
import {
  ConfirmationResult,
  UserCredential,
  updateProfile,
} from "firebase/auth";
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
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDocs,
} from "firebase/firestore";
// import { MagicLinkSigninForm } from "@/app/components/magic-link-signin-form";
import { GoogleSigninButton } from "@/app/components/GoogleSigninButton";
import { useRouter, useSearchParams } from "next/navigation";
import { useProfilePictureUpload } from "@/app/hooks/firebase";
import { X } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { query, where } from "firebase/firestore";

// import { set } from "zod";

enum Page {
  INTRO = 1,
  CREATOR_NAME,
  SHOP_NAME_AND_HANDLE,
  SHOP_BIO,
  SHOP_PFP,
  SOCIAL_MEDIA,
  SIGNIN,
  PHONE,
  OTP,
  FINISH,
  REROUTE,
}

type ConfirmationResultMutationParams = {
  confirmationResult: ConfirmationResult;
  code: string;
};

type SocialLink = {
  platform: string;
  url: string;
  username: string;
};

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-b-2 border-gray-900" />
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}

function OnboardingContent() {
  const [page, setPage] = useState(Page.INTRO);
  const [creatorName, setCreatorName] = useState("");
  const [shopName, setShopName] = useState("");
  const [shopHandle, setShopHandle] = useState("");
  const [handleExists, setHandleExists] = useState(false);
  const [shopDescription, setShopDescription] = useState("");
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const signInMutation = useSignInWithPhoneNumber("recaptcha-element");
  const confirmationResultMutation = usePhoneNumberConfirmationResult();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [profilePictureDownloadURL, setProfilePictureDownloadURL] = useState<
    string | null
  >(null);
  const profilePictureUpload = useProfilePictureUpload();

  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const q = query(collection(db, "shops"), where("creatorId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          // User has not completed onboarding, stay on onboarding
          // TODO: this is bad place to be. this means user exists (signed in) but has not completed onboarding, so did not verify otp to create shop
          console.log("Bad. User signed in but has not completed onboarding.");
          setLoading(false);
          setAuthChecked(true); // Auth check complete
        } else {
          // User has completed onboarding, redirect to their shop
          const shopDoc = querySnapshot.docs[0];
          const shopData = shopDoc.data();
          const shopHandle = shopData.username;
          router.replace(`/${shopHandle}`);
        }
      } else {
        // No user is authenticated, stay on onboarding
        setLoading(false);
        setAuthChecked(true); // Auth check complete
      }
    });

    return () => unsubscribe();
  }, [router]);

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

  // Handle browser back button, page reloads, and page leaves - mobile does not support this
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
  
    window.addEventListener("beforeunload", handleBeforeUnload);
  
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Prevent pull-to-refresh on mobile devices
  useEffect(() => {
    let maybePreventPullToRefresh = false;
    let lastTouchY = 0;
  
    const touchstartHandler = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      lastTouchY = e.touches[0].clientY;
      maybePreventPullToRefresh = window.pageYOffset === 0;
    };
  
    const touchmoveHandler = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      const touchYDelta = touchY - lastTouchY;
      lastTouchY = touchY;
  
      if (maybePreventPullToRefresh) {
        maybePreventPullToRefresh = false;
        if (touchYDelta > 0) e.preventDefault();
      }
    };
  
    document.addEventListener('touchstart', touchstartHandler, { passive: false });
    document.addEventListener('touchmove', touchmoveHandler, { passive: false });
  
    return () => {
      document.removeEventListener('touchstart', touchstartHandler);
      document.removeEventListener('touchmove', touchmoveHandler);
    };
  }, []);

  const handlePageChange = (nextPage: Page) => {
    const validPage = Object.values(Page).includes(nextPage);
    if (validPage) {
      router.push(`/onboarding?page=${nextPage}`);
    } else {
      router.replace("/onboarding");
    }
  };

  useEffect(() => {
    const checkHandle = async () => {
      if (!shopHandle) {
        setHandleExists(false);
        return;
      }

      const snapshot = await getDocs(collection(db, "shops"));
      const exists = snapshot.docs.some(
        (doc) =>
          doc.data().username?.toLowerCase() === shopHandle.toLowerCase(),
      );
      setHandleExists(exists);
    };

    checkHandle();
  }, [shopHandle]);

  if (loading || !authChecked) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <>
      {page === Page.INTRO && <IntroPage setPage={handlePageChange} />}
      {page === Page.CREATOR_NAME &&
        CreatorNamePage(handlePageChange, creatorName, setCreatorName)}
      {page === Page.SHOP_NAME_AND_HANDLE &&
        ShopNameAndHandlePage(
          handlePageChange,
          shopName,
          setShopName,
          shopHandle,
          setShopHandle,
          handleExists,
        )}
      {page === Page.SHOP_BIO &&
        ShopBioPage(handlePageChange, shopDescription, setShopDescription)}
      {page === Page.SHOP_PFP &&
        ShopPfpPage(
          handlePageChange,
          selectedFile,
          setSelectedFile,
          previewUrl,
          setPreviewUrl,
        )}
      {page === Page.SOCIAL_MEDIA &&
        SocialMediaPage(handlePageChange, socialLinks, setSocialLinks)}
      {page === Page.SIGNIN && SignInPage(handlePageChange, setShopHandle)}
      {page === Page.PHONE &&
        PhoneNumberPage(
          handlePageChange,
          signInMutation,
          phoneNumber,
          setPhoneNumber,
        )}
      {page === Page.OTP &&
        PhoneOtpPage(
          handlePageChange,
          otp,
          setOtp,
          signInMutation,
          confirmationResultMutation,
          shopName,
          phoneNumber,
          shopDescription,
          shopHandle,
          creatorName,
          socialLinks,
          selectedFile,
          setSelectedFile,
          previewUrl,
          setPreviewUrl,
          isUploading,
          setIsUploading,
          profilePictureDownloadURL,
          setProfilePictureDownloadURL,
          profilePictureUpload,
        )}
      {page === Page.FINISH && OnboardingFinishPage(shopHandle)}
      {page === Page.REROUTE && <ReroutePage shopHandle={shopHandle} />}
    </>
  );
}

function IntroPage({ setPage }: { setPage: (nextPage: Page) => void }) {
  const router = useRouter();
  return (
    <div className="fixed inset-0 mx-auto flex h-screen max-w-md flex-col items-center justify-between overflow-hidden bg-gradient-to-b from-[#FF5640] to-[#E6B4AD] p-8">
      <div className="mt-52 flex w-full min-w-72 max-w-sm flex-col items-center px-6 text-center">
        <h1 className="mb-2 text-xl font-bold text-white">Welcome to</h1>
        <div className="mb-4 text-8xl font-bold text-white">Coshii</div>
        <p className="text-xl font-medium text-white">
          Sell Online, Sell Together
        </p>
      </div>

      <div className="fixed bottom-0 w-full max-w-md px-10 py-4 text-center">
        <div className="flex justify-center">
          <Button
            className="w-full min-w-32 py-6 text-lg"
            variant="onboardingFirst"
            onClick={function () {
              setPage(Page.CREATOR_NAME);
            }}
          >
            Get Started
          </Button>
        </div>
        <div className="flex justify-center">
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
    </div>
  );
}

function CreatorNamePage(
  setPage: (nextPage: Page) => void,
  creatorName: string,
  setCreatorName: Dispatch<SetStateAction<string>>,
) {
  const getButtonText = () => {
    return "Continue";
  };

  const handleContinue = async () => {
    setPage(Page.SHOP_NAME_AND_HANDLE);
  };

  return (
    <div className="fixed inset-0 mx-auto flex min-h-screen max-w-md flex-col items-center p-8">
      <div>
        <h1 className="mb-6 mt-4 text-center text-xl font-bold text-black">
          Let&#39;s get some quick info!
        </h1>
      </div>
      <div className="mb-5 mt-4 grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="shop-name" className="text-md text-left">
          What is your name?
        </Label>
        <Input
          id="shop-name"
          placeholder=""
          onChange={function (e) {
            setCreatorName(e.currentTarget.value);
          }}
          value={creatorName}
          className="h-12 w-full p-4 text-xl"
        />
      </div>
      <div className="fixed bottom-0 mx-auto w-full max-w-md px-10 py-4">
        <div className="flex justify-center">
          <Button
            id="recaptcha-element"
            className="w-full min-w-24 py-6 text-lg"
            variant="onboarding"
            onClick={handleContinue}
            disabled={!creatorName}
          >
            {getButtonText()}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ShopNameAndHandlePage(
  setPage: (nextPage: Page) => void,
  shopName: string,
  setShopName: Dispatch<SetStateAction<string>>,
  shopHandle: string,
  setShopHandle: Dispatch<SetStateAction<string>>,
  handleExists: boolean,
) {
  const getButtonText = () => {
    return "Continue";
  };

  const handleContinue = async () => {
    setPage(Page.SHOP_BIO);
  };

  return (
    <div className="fixed inset-0 mx-auto flex min-h-screen max-w-md flex-col items-center p-8">
      <div>
        <h1 className="mb-6 mt-4 text-center text-xl font-bold text-black">
          Let&#39;s get some quick info!
        </h1>
      </div>
      {/* <div className="mt-4 rounded-full border border-gray-500 p-8">
        <Coshii className="fill-gray-500" width={175} height={175} />
      </div> */}
      <div className="mb-5 mt-4 grid w-full max-w-sm items-center justify-center gap-1.5">
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
          className="h-12 w-full p-4 text-xl"
        />
      </div>
      <div className="mt-4 grid w-full max-w-sm items-center justify-center gap-1.5">
        <Label htmlFor="shop-handle" className="text-md text-left">
          Coshii is social. Pick a handle for your shop. This is like a handle
          on social media that others sellers can use to find and follow you.
        </Label>
        <Input
          id="shop-name"
          placeholder="@Srikar"
          onChange={(e) => {
            setShopHandle(e.currentTarget.value.replace(/^@/, "")); // Remove leading @ if present
          }}
          value={`@${shopHandle}`}
          className="h-12 w-full p-4 text-xl"
        />
        {handleExists && (
          <p className="mt-2 text-sm text-red-500">
            Sorry, this handle is already taken! Please choose a different one.
          </p>
        )}
      </div>
      <div className="fixed bottom-0 mx-auto w-full max-w-md px-10 py-4 text-center">
        <div className="flex justify-center">
          <Button
            id="recaptcha-element"
            className="w-full min-w-24 py-6 text-lg"
            variant="onboarding"
            onClick={handleContinue}
            disabled={!shopName || !shopHandle || handleExists}
          >
            {getButtonText()}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ShopBioPage(
  setPage: (nextPage: Page) => void,
  shopDescription: string,
  setShopDescription: Dispatch<SetStateAction<string>>,
) {
  const getButtonText = () => {
    return "Continue";
  };

  const handleContinue = async () => {
    setPage(Page.SHOP_PFP);
  };

  return (
    <div className="fixed inset-0 mx-auto flex min-h-screen max-w-md flex-col items-center p-8">
      <div>
        <h1 className="mb-6 mt-4 text-center text-xl font-bold text-black">
          Let&#39;s get some quick info!
        </h1>
      </div>
      {/* <div className="mt-4 rounded-full border border-gray-500 p-8">
        <Coshii className="fill-gray-500" width={175} height={175} />
      </div> */}
      <div className="mb-5 mt-4 grid w-full max-w-sm items-center justify-center gap-1.5">
        <Label htmlFor="shop-bio" className="text-md mb-6 text-left">
          Write a short bio to describe what you sell, your vibe, or anything
          else you want to into your shop to people.
        </Label>
        <textarea
          id="bio"
          placeholder="Handmade ceramics from my studio in Los Angeles. DM me on Insta with any questions!"
          onChange={(e) => setShopDescription(e.currentTarget.value)}
          value={shopDescription}
          className="text-md h-48 w-full resize-none rounded-lg border p-4"
        />
      </div>
      <div className="fixed bottom-0 mx-auto w-full max-w-md px-10 py-4 text-center">
        <div className="flex justify-center">
          <Button
            id="recaptcha-element"
            className="w-full min-w-24 py-6 text-lg"
            variant="onboarding"
            onClick={handleContinue}
            disabled={!shopDescription}
          >
            {getButtonText()}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ShopPfpPage(
  setPage: (nextPage: Page) => void,
  selectedFile: File | null,
  setSelectedFile: Dispatch<SetStateAction<File | null>>,
  previewUrl: string | null,
  setPreviewUrl: Dispatch<SetStateAction<string | null>>,
) {
  const getButtonText = () => {
    return "Continue";
  };

  const handleContinue = async () => {
    setPage(Page.SOCIAL_MEDIA);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="fixed inset-0 mx-auto flex min-h-screen max-w-md flex-col items-center p-8">
      <h1 className="mb-6 mt-4 text-center text-xl font-bold text-black">
        Let&#39;s get some quick info!
      </h1>

      <div className="mb-5 mt-4 w-full max-w-sm text-center">
        <Label htmlFor="profile-pic" className="text-md mb-2 block text-left">
          Upload a profile picture for your shop. You can always change it
          later...
        </Label>

        <div className="relative flex justify-center">
          <label
            htmlFor="profile-pic"
            className="mt-10 flex size-40 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white text-gray-400 hover:bg-gray-200"
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Profile preview"
                className="size-full rounded-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <span className="translate-y-[-6%] text-center text-[8rem] leading-none">
                  +
                </span>
              </div>
            )}
          </label>

          {previewUrl && (
            <button
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl(null);
              }}
              className="absolute right-0 top-0 rounded-full bg-white p-1 shadow hover:bg-gray-100"
              type="button"
            >
              <X className="size-4 text-gray-600" />
            </button>
          )}
        </div>

        <input
          type="file"
          id="profile-pic"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="fixed bottom-0 mx-auto w-full max-w-md px-10 py-4 text-center">
        <div className="flex justify-center">
          <Button
            id="recaptcha-element"
            className="w-full min-w-24 py-6 text-lg"
            variant="onboarding"
            onClick={handleContinue}
            disabled={!selectedFile}
          >
            {getButtonText()}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SocialMediaPage(
  setPage: (nextPage: Page) => void,
  socialLinks: SocialLink[],
  setSocialLinks: Dispatch<SetStateAction<SocialLink[]>>,
) {
  const getButtonText = () => {
    return "Continue";
  };

  const handleContinue = async () => {
    setPage(Page.SIGNIN);
  };

  const updateSocialLink = (
    platform: string,
    url: string,
    username: string,
  ) => {
    setSocialLinks((prevLinks) => {
      const updated = [...prevLinks];
      const existingIndex = updated.findIndex(
        (link) => link.platform === platform,
      );

      const newLink = {
        platform,
        url,
        username,
      };

      if (existingIndex !== -1) {
        updated[existingIndex] = newLink;
      } else {
        updated.push(newLink);
      }

      return updated;
    });
  };

  return (
    <div className="fixed inset-0 mx-auto flex min-h-screen max-w-md flex-col items-center p-8">
      <div>
        <h1 className="mb-6 mt-4 text-center text-xl font-bold text-black">
          Let&#39;s get some quick info!
        </h1>
      </div>
      {/* <div className="mt-4 rounded-full border border-gray-500 p-8">
        <Coshii className="fill-gray-500" width={175} height={175} />
      </div> */}
      <div className="mb-5 mt-4 grid w-full max-w-sm items-center justify-center gap-1.5">
        <Label htmlFor="shop-social-media" className="text-md mb-6 text-left">
          Do you want to add any of your social handles to your profile? You can
          always add more later...
        </Label>

        {/* Facebook */}
        <Label
          htmlFor="shop-social-media-facebook"
          className="text-md text-left"
        >
          Facebook Username
        </Label>
        <Input
          id="facebook"
          placeholder=""
          onChange={(e) => {
            const username = e.currentTarget.value.replace(/^@/, "");
            updateSocialLink(
              "Facebook",
              `https://facebook.com/${username}`,
              username,
            );
          }}
          value={`@${
            socialLinks.find((l) => l.platform === "Facebook")?.username || ""
          }`}
          className="h-12 w-full p-4 text-xl"
        />

        {/* X */}
        <Label htmlFor="shop-social-media-x" className="text-md text-left">
          X Username
        </Label>
        <Input
          id="x"
          placeholder=""
          onChange={(e) => {
            const username = e.currentTarget.value.replace(/^@/, "");
            updateSocialLink("X", `https://x.com/${username}`, username);
          }}
          value={`@${
            socialLinks.find((l) => l.platform === "X")?.username || ""
          }`}
          className="h-12 w-full p-4 text-xl"
        />

        {/* Instagram */}
        <Label
          htmlFor="shop-social-media-instagram"
          className="text-md text-left"
        >
          Instagram Username
        </Label>
        <Input
          id="instagram"
          placeholder=""
          onChange={(e) => {
            const username = e.currentTarget.value.replace(/^@/, "");
            updateSocialLink(
              "Instagram",
              `https://instagram.com/${username}`,
              username,
            );
          }}
          value={`@${
            socialLinks.find((l) => l.platform === "Instagram")?.username || ""
          }`}
          className="h-12 w-full p-4 text-xl"
        />
      </div>
      <div className="fixed bottom-0 mx-auto w-full max-w-md px-10 py-4 text-center">
        <div className="flex justify-center">
          <Button
            id="recaptcha-element"
            className="w-full min-w-24 py-6 text-lg"
            variant="onboarding"
            onClick={handleContinue}
            disabled={false} // optional
          >
            {getButtonText()}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SignInPage(
  setPage: (nextPage: Page) => void,
  setShopHandle: Dispatch<SetStateAction<string>>,
) {
  const setCreatedShopHandle = async (userId: string) => {
    const shopsRef = collection(db, "shops");
    const querySnapshot = await getDocs(shopsRef);
    const shopDoc = querySnapshot.docs.find((doc) => {
      const data = doc.data();
      return data.creatorId === userId;
    });
    if (shopDoc) {
      setShopHandle(shopDoc.data().username);
    }
  };
  return (
    <>
      <div className="fixed inset-0 mx-auto flex min-h-screen max-w-md flex-col items-center p-8">
        <div>
          <h1 className="mb-6 mt-4 text-center text-xl font-bold text-black">
            Let&#39;s set up your account!
          </h1>
        </div>
        <div className="mt-12">
          <GoogleSigninButton
            allowNewUser={true}
            onSuccess={({ user, isNewUser }) => {
              if (isNewUser) {
                setPage(Page.PHONE);
              } else {
                const userId = user?.uid;
                if (userId) {
                  setCreatedShopHandle(userId);
                }
                setPage(Page.REROUTE);
              }
            }}
          />
        </div>
        {/* <MagicLinkSigninForm /> */}
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
      // console.log("SMS Handler Called with phone number:", phoneNumber);
      // Do NOT navigate before mutation. Navigate only on success.
      signInMutation.mutate(phoneNumber, {
        onSuccess: () => {
          console.log("SMS sent successfully, navigating to OTP page.");
          setPage(Page.OTP);
        },
        onError: (error) => {
          console.error("Failed to send SMS sign-in code:", error);
          // Optionally, provide user feedback here, e.g., via an alert or toast
        },
      });
    } catch (error) {
      // This catch block might not be necessary if errors are handled by mutation.onError
      console.error("Error in handleContinue (PhoneNumberPage):", error);
    }
  };
  return (
    <div className="fixed inset-0 mx-auto flex min-h-screen max-w-md flex-col items-center p-8">
      <div>
        <h1 className="mb-6 mt-4 text-center text-xl font-bold text-black">
          Let&#39;s set up your account!
        </h1>
      </div>
      {/* <div className="mt-4 rounded-full border border-gray-500 p-8">
        <Coshii className="fill-gray-500" width={175} height={175} />
      </div> */}
      <div className="mb-5 mt-4 grid w-full max-w-sm items-center justify-center gap-1.5">
        <Label htmlFor="shop-name" className="text-md text-left">
          To verify its you, what is your phone number?
        </Label>
        <PhoneInput
          id="phone-number"
          country="US"
          international={false}
          placeholder="(656) 555-7536"
          className="h-12 w-full p-4 text-xl"
          onChange={function (phoneNumber) {
            setPhoneNumber(phoneNumber || "");
          }}
          value={phoneNumber}
          disabled={signInMutation.isPending}
        />
      </div>
      <div className="fixed bottom-0 mx-auto w-full max-w-md px-10 py-4 text-center">
        <div className="flex justify-center">
          <Button
            id="recaptcha-element"
            className="w-full min-w-24 py-6 text-lg"
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
      </div>
    </div>
  );
}

function PhoneOtpPage(
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
  creatorName: string = "",
  socialLinks: SocialLink[] = [],
  selectedFile: File | null,
  setSelectedFile: Dispatch<SetStateAction<File | null>>,
  previewUrl: string | null,
  setPreviewUrl: Dispatch<SetStateAction<string | null>>,
  isUploading: boolean,
  setIsUploading: Dispatch<SetStateAction<boolean>>,
  profilePictureDownloadURL: string | null,
  setProfilePictureDownloadURL: Dispatch<SetStateAction<string | null>>,
  profilePictureUpload: ReturnType<typeof useProfilePictureUpload>,
) {
  const getButtonText = () => {
    if (confirmationResultMutation.isPending) {
      return "Confirming code...";
    } else if (confirmationResultMutation.isError) {
      return "Error! Try again";
    }
    return "Continue";
  };

  const handleFileUpload = async (file: File): Promise<string | null> => {
    if (!auth.currentUser) {
      console.error("No authenticated user found");
      return null;
    }
    setIsUploading(true);
    console.log("Uploading file:", file);
    try {
      const profilePictureDownloadURL = await profilePictureUpload.mutateAsync({
        file: file,
        userId: auth.currentUser.uid,
      });

      setProfilePictureDownloadURL(profilePictureDownloadURL);
      console.log("Uploaded to:", profilePictureDownloadURL);
      return profilePictureDownloadURL;
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const createShopAndContinue = async () => {
    try {
      if (auth.currentUser) {
        let profileURL = null;
        if (selectedFile) {
          profileURL = await handleFileUpload(selectedFile);
        }

        // Create shop document
        const shopRef = collection(db, "shops");
        await addDoc(shopRef, {
          categories: ["All"],
          createdAt: new Date(),
          creatorId: auth.currentUser.uid,
          description: shopDescription,
          email: auth.currentUser.email,
          isPremium: false,
          profilePic: profileURL,
          shopName: shopName,
          username: shopHandle,
          followers: {},
          following: {},
          socialLinks: socialLinks,
        });

        // Update user document with creator name, shop name, phone number
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        console.log(
          "Updating phone number (temporarily b/c otp does not work) in user document",
        );
        await updateDoc(userDocRef, {
          creatorName: creatorName,
          shopName: shopName,
          phoneNumber: phoneNumber,
        });

        // Update Firebase Auth profile with shop name and profile picture
        await updateProfile(auth.currentUser, {
          displayName: shopName,
          photoURL: profileURL ?? undefined,
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
    <div className="fixed inset-0 mx-auto flex min-h-screen max-w-md flex-col items-center justify-between p-8">
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
        <div className="fixed bottom-0 mx-auto w-full max-w-md py-4 text-center">
          <Button
            className="px-8 py-6 text-lg"
            variant="onboardingSecondary"
            disabled={confirmationResultMutation.isPending}
            onClick={function () {
              setPage(Page.PHONE);
            }}
          >
            Back
          </Button>
          <Button
            className="px-8 py-6 text-lg"
            variant="onboarding"
            onClick={async function () {
              // Development bypass
              // console.log("OTP Verification bypassed. Code entered:", otp);
              // await createShopAndContinue();

              // Production code - commented out for development
              if (!signInMutation.isSuccess) {
                throw Error("SMS sign-in code was not sent");
              }
              confirmationResultMutation.mutate(
                { confirmationResult: signInMutation.data, code: otp },
                {
                  onSuccess: async () => {
                    await createShopAndContinue();
                  },
                },
              );
            }}
            disabled={
              otp.length != 6
              // Production checks - commented out for development
            ||
            !signInMutation.isSuccess ||
            confirmationResultMutation.isPending
            
            }
          >
            {getButtonText()}
          </Button>
        </div>
      </div>
    </div>
  );
}

function OnboardingFinishPage(shopHandle: string) {
  return (
    <div className="fixed inset-0 mx-auto flex min-h-screen max-w-md flex-col items-center justify-between bg-gradient-to-b from-red-500 to-red-200 p-8">
      <div className="flex flex-col items-center justify-between">
        <h1 className="mt-8 text-left text-4xl text-white">
          Selling on Coshii is easy
        </h1>
        <h1 className="mt-8 text-left text-4xl text-white">
          Would you like to add a new item now?
        </h1>
      </div>
      <div className="flex flex-col items-center justify-between">
        <div className="fixed bottom-12 mx-auto w-full max-w-md py-4 text-center">
          <Button className="mb-1 px-8 py-6 text-lg" variant="onboardingThird">
            <Link href="/add-product">Add a piece</Link>
          </Button>
        </div>
        <div className="fixed bottom-0 mx-auto w-full max-w-md py-4 text-center">
          <Button className="px-8 py-6 text-lg" variant="onboardingSecondary">
            <Link href={`/${shopHandle}`}>Take me to my shop</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function ReroutePage({ shopHandle }: { shopHandle: string }) {
  const router = useRouter();
  return (
    <div className="fixed inset-0 mx-auto flex min-h-screen max-w-md flex-col items-center p-8">
      <div>
        <h1 className="mb-6 mt-4 text-start text-xl font-bold text-gray-600">
          You already have a shop, let&#39;s take you there now.
        </h1>
      </div>
      <div className="fixed bottom-0 mx-auto w-full max-w-md px-10 py-4">
        <div className="flex justify-center">
          <Button
            id="recaptcha-element"
            className="w-full min-w-24 py-6 text-lg"
            variant="onboarding"
            onClick={function () {
              router.push(`/${shopHandle}`);
            }}
          >
            {"Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
