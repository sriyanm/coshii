import { NextResponse } from "next/server";
import { getStripe } from "@/app/lib/server/stripe";

export async function POST(req: Request) {
  try {
    const stripe = getStripe();

    // Parse the request body
    const { email, userId }: { email: string; userId?: string } =
      await req.json();

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
      client_reference_id: userId,
      metadata: userId ? { userId: userId } : undefined,
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
