import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
// Ensure 'db' here is an instance of the Firebase Admin SDK's Firestore for server-side operations.
// If it's the client-side SDK, webhook updates to Firestore will fail due to permission issues.
// You may need a separate Firebase Admin initialization (e.g., in 'lib/firebase/admin.ts') for backend use.
import { db } from "@/app/lib/client/firebase";
import {
  doc,
  updateDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";

//NOTE: in test mode run this for the webhook: stripe listen --forward-to localhost:3000/hooks/stripe

const stripe = new Stripe(process.env.TEST_STRIPE_SECRET_KEY as string);
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const PREMIUM_PLAN_PRICE_ID =
  process.env.STRIPE_PREMIUM_PRICE_ID || "price_1R1YUqE4sAURr3tn7fFhEd2j"; // Ensure this is in your .env

export async function POST(req: Request) {
  // TODO Connect to backend - This will now connect to Firestore
  console.log("Connecting to the backend (Firestore)...");

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

        // Retrieve session details from Stripe (including line items, customer, and payment_intent for sellerId)
        const sessionDetails = await stripe.checkout.sessions.retrieve(
          session.id,
          {
            expand: ["line_items", "customer", "payment_intent"],
          },
        );

        console.log("Session Details:", sessionDetails);

        let userId =
          session.client_reference_id || session.metadata?.userId || null;
        const customerEmail =
          (sessionDetails.customer as Stripe.Customer)?.email ||
          session.customer_email;

        // If userId is null and we have an email, try to find the user by email
        if (!userId && customerEmail) {
          console.log(
            `User ID not in session, attempting lookup by email: ${customerEmail}`,
          );
          try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", customerEmail));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              userId = querySnapshot.docs[0].id;
              console.log(`User found by email: ${userId}`);
            } else {
              console.warn(`User not found with email: ${customerEmail}.`);
            }
          } catch (e) {
            console.error("Error looking up user by email:", e);
          }
        }

        if (!userId) {
          console.error(
            "Critical: User ID could not be determined for session:",
            session.id,
          );
          // Depending on your business logic, you might want to stop processing here
          // or record the transaction without a userId if that's acceptable.
        }

        const isPremiumSubscription = sessionDetails.line_items?.data.some(
          (item) => item.price?.id === PREMIUM_PLAN_PRICE_ID,
        );

        if (isPremiumSubscription) {
          console.log(
            "Premium subscription checkout completed for session:",
            session.id,
          );
          if (userId) {
            const userDocRef = doc(db, "users", userId);
            try {
              await updateDoc(userDocRef, {
                plan: "paid",
                subscriptionId: sessionDetails.subscription, // Save Stripe subscription ID
                stripeCustomerId: session.customer, // Save Stripe customer ID
                subscriptionStatus: "active", // or whatever status Stripe provides
                planUpdatedAt: Timestamp.now(), // Firestore Timestamp
              });
              console.log(`User ${userId} updated to paid plan.`);
            } catch (error) {
              console.error(
                `Error updating user ${userId} to paid plan:`,
                error,
              );
            }
          } else {
            console.error(
              "Cannot update user to premium: UserId not found or determined for session:",
              session.id,
            );
          }
        } else {
          // This is a regular product purchase
          console.log(
            "Product purchase checkout completed for session:",
            session.id,
          );
          let sellerId: string | null = null;

          if (
            sessionDetails.payment_intent &&
            typeof sessionDetails.payment_intent === "object"
          ) {
            // If payment_intent was expanded (which it should be)
            sellerId =
              ((sessionDetails.payment_intent as Stripe.PaymentIntent)
                .transfer_data?.destination as string) ||
              ((sessionDetails.payment_intent as Stripe.PaymentIntent)
                .on_behalf_of as string) ||
              null;
          } else if (typeof sessionDetails.payment_intent === "string") {
            // Fallback: if only PI ID is here, retrieve it (though expand should prevent this)
            try {
              const paymentIntent = await stripe.paymentIntents.retrieve(
                sessionDetails.payment_intent,
              );
              sellerId =
                (paymentIntent.transfer_data?.destination as string) ||
                (paymentIntent.on_behalf_of as string) ||
                null;
            } catch (piError) {
              console.error(
                "Error retrieving payment intent for sellerId:",
                piError,
              );
            }
          }

          if (!sellerId) {
            console.error(
              "Seller ID (Stripe Connect Account ID) not found for purchase in session:",
              session.id,
            );
            // Handle error: transaction cannot be properly attributed to a seller
            // You might still record the transaction but flag it.
          }

          const transactionData = {
            buyerId: userId, // Can be null if not found
            customerEmail: customerEmail || null,
            sellerId: sellerId, // Stripe Connect Account ID
            items: sessionDetails.line_items?.data.map((item) => ({
              priceId: item.price?.id,
              productId: item.price?.product as string,
              name: item.description,
              quantity: item.quantity,
              amount_total: item.amount_total, // Price in cents
              currency: item.currency,
            })),
            amount_total: sessionDetails.amount_total, // Total in cents
            currency: sessionDetails.currency,
            payment_status: sessionDetails.payment_status,
            shipping_details: sessionDetails.shipping_details
              ? {
                  name: sessionDetails.shipping_details.name,
                  address: {
                    line1: sessionDetails.shipping_details.address?.line1,
                    line2: sessionDetails.shipping_details.address?.line2,
                    city: sessionDetails.shipping_details.address?.city,
                    state: sessionDetails.shipping_details.address?.state,
                    postal_code:
                      sessionDetails.shipping_details.address?.postal_code,
                    country: sessionDetails.shipping_details.address?.country,
                  },
                }
              : null,
            stripeSessionId: session.id,
            stripeCustomerId: (session.customer as string) || null,
            stripePaymentIntentId:
              typeof sessionDetails.payment_intent === "string"
                ? sessionDetails.payment_intent
                : (sessionDetails.payment_intent as Stripe.PaymentIntent)?.id,
            createdAt: Timestamp.now(), // Firestore Timestamp
          };

          try {
            const docRef = await addDoc(
              collection(db, "transactions"),
              transactionData,
            );
            console.log(
              "Transaction stored with ID:",
              docRef.id,
              "for session:",
              session.id,
            );
          } catch (error) {
            console.error(
              "Error storing transaction for session:",
              session.id,
              error,
            );
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = data.object as Stripe.Subscription;
        console.log("Subscription Deleted event:", subscription);

        // Find user by subscriptionId (that Stripe provides) and update their plan
        // Note: 'subscription.id' is the Stripe Subscription ID
        const usersRef = collection(db, "users");
        // We stored sessionDetails.subscription as subscriptionId for the user
        const q = query(
          usersRef,
          where("subscriptionId", "==", subscription.id),
        );

        try {
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const userDocSnapshot = querySnapshot.docs[0];
            await updateDoc(userDocSnapshot.ref, {
              plan: "free",
              // subscriptionId: null, // Keep it for history or clear it based on your needs
              subscriptionStatus: "canceled", // or 'ended'
              planUpdatedAt: Timestamp.now(),
            });
            console.log(
              `User ${userDocSnapshot.id} plan downgraded to free due to subscription ${subscription.id} deletion.`,
            );
          } else {
            console.warn(
              `No user found with subscriptionId: ${subscription.id} to downgrade.`,
            );
            // This could happen if the subscription was created outside your current user flow
            // or if there was an issue saving it initially.
          }
        } catch (error) {
          console.error(
            "Error handling subscription deletion for subscriptionId:",
            subscription.id,
            error,
          );
        }
        break;
      }

      case "account.application.authorized": {
        //TODO: update sellerID if you store a local flag for onboarding completion.
        // The Stripe Account ID is data.object.id
        // const accountId = (data.object as Stripe.Account).id;
        console.log(
          "Seller has onboarded (account.application.authorized):",
          data.object,
        );
        // Example: you might want to set a flag on the user's shop or user profile.
        // const shopId = (data.object as Stripe.Account).metadata?.shopId; // If you pass shopId in account metadata
        // if(shopId) { /* update shop status */ }
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
