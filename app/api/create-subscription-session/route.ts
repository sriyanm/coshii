import { NextResponse } from "next/server";
import Stripe from "stripe";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const stripe = new Stripe(process.env.TEST_STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  try {
    // Parse the request body
    const { email } = await req.json();

    // Get previous page
    const referer =
      req.headers.get("referer") || process.env.NEXT_PUBLIC_BASE_URL;

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      // ui_mode: "embedded",
      payment_method_types: ["card"],
      line_items: [
        {
          // price: "price_1QwnGEE4sAURr3tnLFKauzDP", // Subscription price ID TODO: change
          price: "price_1R1YUqE4sAURr3tn7fFhEd2j",
          quantity: 1,
        },
      ],
      mode: "subscription",
      customer_email: email,
      automatic_tax: { enabled: false }, //TODO: change this to true (setup stripe tax)
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
      cancel_url: referer,
      // return_url: `${req.headers.get('origin')}/return?session_id={CHECKOUT_SESION_ID}`,
    });

    return NextResponse.json({
      id: session.id,
      client_secret: session.client_secret,
      url: session.url,
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
