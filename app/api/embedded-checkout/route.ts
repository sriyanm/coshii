import { NextResponse } from "next/server";
import { getStripe } from "@/app/lib/server/stripe";

export async function POST(request: Request) {
  try {
    const stripe = getStripe();
    const {
      priceId,
      quantity,
      userId,
    }: { priceId: string; quantity: number; userId?: string } =
      await request.json();

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
      client_reference_id: userId,
      metadata: userId ? { userId: userId } : undefined,
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
