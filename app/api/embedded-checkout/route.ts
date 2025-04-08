import { NextResponse } from "next/server";
import Stripe from "stripe";

if (!process.env.TEST_STRIPE_SECRET_KEY) {
  throw new Error("TEST_STRIPE_SECRET_KEY is not defined");
}

const stripe = new Stripe(process.env.TEST_STRIPE_SECRET_KEY);
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(request: Request) {
  try {
    const { priceId, quantity } = await request.json();

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: quantity,
        },
      ],
      mode: "subscription",
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/return?session_id={CHECKOUT_SESSION_ID}`,
    });

    return NextResponse.json({
      id: session.id,
      client_secret: session.client_secret,
    });
  } catch (error) {
    // Type the error as an unknown type and cast it to an Error
    if (error instanceof Error) {
      console.log("Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.log("Unknown error:");
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
