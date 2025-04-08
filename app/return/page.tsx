import Stripe from "stripe";

if (!process.env.TEST_STRIPE_SECRET_KEY) {
  throw new Error("TEST_STRIPE_SECRET_KEY is not defined");
}

const stripe = new Stripe(process.env.TEST_STRIPE_SECRET_KEY);

async function getSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return session;
}

export default async function CheckoutReturn({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const sessionId = params.session_id;

  if (!sessionId || typeof sessionId !== "string") {
    return <p>Invalid session ID</p>;
  }

  const session = await getSession(sessionId);

  console.log(session);

  if (session?.status === "open") {
    return <p>Payment did not work.</p>;
  }

  if (session?.status === "complete") {
    return (
      <h3>
        We appreciate your business! Your Stripe customer ID is:
        {session.customer as string}.
      </h3>
    );
  }

  return null;
}
