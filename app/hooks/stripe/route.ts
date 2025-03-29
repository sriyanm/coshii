import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";

//NOTE: in test mode run this for the webhook: stripe listen --forward-to localhost:3000/hooks/stripe

const stripe = new Stripe(process.env.TEST_STRIPE_SECRET_KEY as string);
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  // TODO Connect to backend
  console.log("Connecting to the backend...");

  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Stripe signature missing" },
      { status: 400 },
    );
  }
  if (!webhookSecret) {
    throw new Error(
      "STRIPE_WEBHOOK_SECRET is not defined in environment variables",
    );
  }

  // let data;
  // let eventType;
  let event;

  // verify Stripe event is legit
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Webhook signature verification failed. ${error.message}`);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.log("Unknown error:", error);
    return NextResponse.json({ error: "Unknown error" }, { status: 400 });
  }

  const data = event.data;
  const eventType = event.type;

  try {
    switch (eventType) {
      case "checkout.session.completed": {
        const session = data.object as Stripe.Checkout.Session; // This contains session data
        console.log("Session Completed:", session);

        // Retrieve session details from Stripe (including line items)
        const sessionDetails = await stripe.checkout.sessions.retrieve(
          session.id,
          {
            expand: ["line_items"],
          },
        );

        console.log("Session Details:", sessionDetails);

        // Extract transaction details like price_id, seller_id, and buyer_id
        const priceId = sessionDetails.line_items?.data[0]?.price?.id; // Assuming price_id is inside the price object

        if (priceId === "price_1R1YUqE4sAURr3tn7fFhEd2j") {
          //TODO: update isPremium to true in backend, also store sessionDetails.subscription as subscriptionId
          console.log("Seller has bought premium - Subscription update");
        } else {
          //TODO: store transaction details in backend (note we probably want customer/seller info, all line items, shipping address)
          console.log("Buyer bought a sellers item");
        }

        break;
      }

      case "customer.subscription.deleted": {
        //TODO: update isPremium to false, clear subscriptionId and sellerId
        console.log("DELETE", data.object);

        break;
      }

      case "account.application.authorized": {
        //TODO: update sellerID
        console.log("seller has onboarded");
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(
        "stripe error: " + error.message + " | EVENT TYPE: " + eventType,
      );
    }
    console.log("Unknown stripe error:", error);
  }

  return NextResponse.json({});
}
