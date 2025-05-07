"use client";
import React, { useState } from "react";
// import { loadStripe } from '@stripe/stripe-js';
// import EmbeddedCheckoutButton from "../components/EmbeddedCheckoutButton";
import { auth } from "@/app/lib/client/firebase";

//TODO: switch from test back to actual stripe mode
//    change promise keys in all api files
//    also change price id in subscription session
//TODO: fix merge things
//    make cancel url for subscription the settings page

// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);
// const stripePromise = loadStripe(process.env.TEST_STRIPE_PUBLIC_KEY as string);

const SellerOnboardingButton = () => {
  const handleOnboarding = async () => {
    try {
      const response = await fetch("/api/create-account-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to create onboarding link");

      const { url } = await response.json();

      window.location.href = url;
    } catch (error) {
      console.error("Error during seller onboarding:", error);
    }
  };

  return (
    <button
      onClick={handleOnboarding}
      className="rounded bg-blue-500 px-4 py-2 text-white"
    >
      Onboard as a Seller
    </button>
  );
};

const CoshiiPremiumButton = () => {
  const [loading, setLoading] = useState(false);
  // Example: Get user from Firebase Auth context or state management
  // const { currentUser } = useAuth(); // Replace with your actual auth hook/logic
  const currentUser = auth.currentUser; // Assuming auth is available in this scope from Firebase

  const handleCheckout = async () => {
    setLoading(true);

    if (!currentUser || !currentUser.email) {
      console.error(
        "User not signed in or email not available for subscription.",
      );
      alert("Please sign in to subscribe.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/create-subscription-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUser.email, // User's email
          userId: currentUser.uid, // User's Firebase UID
        }),
      });

      if (!response.ok) throw new Error("Failed to create checkout session");

      const { url } = await response.json();

      // Redirect the user to Stripe's checkout page
      window.location.href = url;
    } catch (error) {
      console.error("Error initiating checkout:", error);
      setLoading(false);
    }
  };

  return (
    <button onClick={handleCheckout} disabled={loading}>
      {loading ? "Processing..." : "Subscribe to Premium"}
    </button>
  );
};

const CheckoutPage = () => {
  return (
    <div>
      <h1>Premium Subscription</h1>
      <div className="mt-8">
        <CoshiiPremiumButton />
      </div>

      {/* <div className="mt-8">
        <EmbeddedCheckoutButton />
      </div> */}

      <div className="mt-8">
        <SellerOnboardingButton />
      </div>
    </div>
  );
};

export default CheckoutPage;
