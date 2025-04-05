"use client";
import React, { useState, useEffect } from "react";
import { CartItem } from "../types/index";
import Image from "next/image";

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);

  // Explicitly define state type
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sellerId, setSellerId] = useState<string>("");

  useEffect(() => {
    // Retrieve cart data from sessionStorage
    const storedCart = sessionStorage.getItem("cart");
    console.log("hi cart");
    if (storedCart) {
      setCart(JSON.parse(storedCart));
      console.log(cart);
    }

    // Retrieve seller's stripe account id
    const storedId = sessionStorage.getItem("sellerId");
    console.log("hi id");
    if (storedId) {
      setSellerId(storedId);
      console.log(storedId);
    }
  }, []);

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const estimatedShipping = 5.99;
  const estimatedTaxes = subtotal * 0.1;
  const total = subtotal + estimatedShipping + estimatedTaxes;

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItems: cart, sellerId: sellerId }),
      });

      console.log("Done with checkout api request");
      if (!response.ok) throw new Error("Failed to create checkout session");

      const { url } = await response.json();
      window.location.href = url;

      // Fetch the send-email API after the product creation
      const emailResponse = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: "sriyan@umich.edu", // use the actual email of the user or admin
          subject: "Congrats! You got a sale on Coshii.",
          text: `Hi there},\n\nYou just sold an item on Coshii. Log into your Coshii account to see the details of your transaction. Make sure to get our items delivered to your buyer as soon as possible!\n\nThe Coshii Team`,
          html: `
            <p>Hi there},</p> 
            <p>You just sold an item on Coshii. Log into your Coshii account to see the details of your transaction. Make sure to get our items delivered to your buyer as soon as possible!</p>
            <p>The Coshii Team</p>
          `, // add name in replace of "there" in the "Hi there" line
        }),
      });

      if (emailResponse.ok) {
        console.log("Confirmation email sent");
      } else {
        console.error("Failed to send email");
      }
    } catch (error) {
      console.error("Error initiating checkout:", error);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-gray-100 p-4">
      <h1 className="mb-6 self-start text-2xl font-bold">Your Cart</h1>
      <div className="flex w-full flex-col items-center gap-4">
        {cart.map((item, index) => (
          <div
            key={index}
            className="flex w-full max-w-2xl items-center gap-4 rounded-lg bg-white p-4 shadow"
          >
            {/* Left Side: Image + Caption */}
            <div className="flex items-center gap-2">
              <Image
                width={100}
                height={100}
                src={item.image}
                alt={item.name}
                className="rounded size-16 object-cover"
              />
              <span className="italic text-gray-500">{item.description}</span>
            </div>

            {/* Right Side: Name + Price */}
            <div className="ml-4 flex grow flex-col items-start">
              <span className="whitespace-nowrap font-semibold">
                {item.name}
              </span>
              <span className="whitespace-nowrap text-gray-600">
                ${item.price.toFixed(2)} x {item.quantity}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-auto w-full max-w-2xl rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">Summary</h2>
        <div className="mb-2 flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="mb-2 flex justify-between text-gray-600">
          <span>Estimated Shipping</span>
          <span>${estimatedShipping.toFixed(2)}</span>
        </div>
        <div className="mb-4 flex justify-between text-gray-600">
          <span>Estimated Taxes</span>
          <span>${estimatedTaxes.toFixed(2)}</span>
        </div>
        <hr className="my-2" />
        <div className="mb-4 flex items-center justify-between text-lg font-bold text-gray-800">
          <span>Estimated Order Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <button
          onClick={handleCheckout}
          className="hover:bg-orange-600 w-full rounded-lg bg-orange py-3 font-semibold text-white shadow transition disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Processing..." : "Checkout with Stripe"}
        </button>
      </div>
    </div>
  );
}
