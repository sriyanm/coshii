import { NextResponse } from "next/server";
import Stripe from "stripe";

// Define the type for the cart item
type Cart = {
  images: string[];
  caption: string;
  shopName: string;
  name: string;
  price: number;
  quantity: number;
  sellerId: string;
};

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const stripe = new Stripe(process.env.TEST_STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  try {
    // Parse the request body
    const { cartItems, sellerId }: { cartItems: Cart[]; sellerId: string } =
      await req.json();

    // Get previous page
    const referer =
      req.headers.get("referer") || process.env.NEXT_PUBLIC_BASE_URL;

    // Convert cart items to Stripe line items
    const lineItems = cartItems.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100), // Convert price to cents
      },
      quantity: item.quantity,
    }));

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      payment_intent_data: {
        application_fee_amount: 0,
        transfer_data: {
          destination: sellerId,
        },
      },
      mode: "payment",
      automatic_tax: { enabled: false }, //TODO: change this to true (setup stripe tax)
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
      cancel_url: referer,
    });

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
