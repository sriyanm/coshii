import { NextResponse } from "next/server";
import Stripe from "stripe";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const stripe = new Stripe(process.env.TEST_STRIPE_SECRET_KEY as string);

export async function POST() {
  try {
    console.log("start");

    // Get previous page
    // const referer = req.headers.get('referer') || process.env.NEXT_PUBLIC_BASE_URL;

    // Create a new Stripe account for the seller
    const account = await stripe.accounts.create({
      type: "standard",
    });

    console.log("making link: ", account);

    // Create an account link for the seller to onboard
    const accountLink = await stripe.accountLinks.create({
      account: account.id, // The Stripe account ID for the seller
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
      type: "account_onboarding", // Type of link to generate
    });

    // Return the URL to redirect the seller to Stripe onboarding
    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error("Error creating account link:", error);
    return NextResponse.json(
      { error: "Error creating account link" },
      { status: 500 },
    );
  }
}
