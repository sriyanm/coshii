import { NextResponse } from "next/server";
import { getStripe } from "@/app/lib/server/stripe";

export async function POST(request: Request) {
  try {
    const stripe = getStripe();
    const { subscriptionId } = await request.json();

    // Ensure the subscriptionId is valid
    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 },
      );
    }

    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    return NextResponse.json({
      success: true,
      subscription,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.log("Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.log("Unknown error:", error);
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
