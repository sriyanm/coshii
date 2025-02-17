import { NextResponse } from "next/server";
import Stripe from "stripe";

// Define the type for the cart item
interface CartItem {
  name: string;
  price: number;
  quantity: number;
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  try {
    // Parse the request body
    const { cartItems }: { cartItems: CartItem[] } = await req.json();

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
      mode: "payment",
      automatic_tax: { enabled: true },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    // Type the error as an unknown type and cast it to an Error
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
