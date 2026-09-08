import { NextResponse } from "next/server";
import { getStripe } from "@/app/lib/server/stripe";
import { CartItem } from "../../types/index";

export async function POST(req: Request) {
  try {
    const stripe = getStripe();

    // Parse the request body
    const {
      cartItems,
      sellerId,
      buyerId,
    }: { cartItems: CartItem[]; sellerId: string; buyerId?: string } =
      await req.json();

    // Get previous page
    const referer =
      req.headers.get("referer") || process.env.NEXT_PUBLIC_BASE_URL;

    // Convert cart items to Stripe line items
    const lineItems = cartItems.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.name || "Unnamed Product" },
        unit_amount: Math.round(item.price * 100), // Convert price to cents
      },
      quantity: item.quantity,
    }));

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create(
      {
        payment_method_types: ["card"],
        line_items: lineItems,
        payment_intent_data: {
          application_fee_amount: 0, // or your fee logic
          // If using Connect direct charges, you might set transfer_data here,
          // but using stripeAccount in the second options arg is typical for destination charges.
        },
        mode: "payment",
        shipping_address_collection: {
          allowed_countries: ["US", "CA"],
        },
        client_reference_id: buyerId, // Pass your internal buyerId here
        metadata: buyerId
          ? { userId: buyerId, sellerId: sellerId }
          : { sellerId: sellerId }, // Include buyerId and sellerId in metadata
        automatic_tax: { enabled: false },
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
        cancel_url: referer || `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
      },
      {
        stripeAccount: sellerId,
      },
    );

    return NextResponse.json({ url: session.url });
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
