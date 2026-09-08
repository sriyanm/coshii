import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripe) {
    if (!process.env.TEST_STRIPE_SECRET_KEY) {
      throw new Error("TEST_STRIPE_SECRET_KEY is not defined");
    }
    stripe = new Stripe(process.env.TEST_STRIPE_SECRET_KEY);
  }
  return stripe;
}
