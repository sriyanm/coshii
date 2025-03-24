// // app/components/EmbeddedCheckoutButton.tsx
// "use client";
// import { loadStripe } from "@stripe/stripe-js";
// import {
//   EmbeddedCheckoutProvider,
//   EmbeddedCheckout,
// } from "@stripe/react-stripe-js";
// import { useCallback, useRef, useState } from "react";

// const stripePromise = loadStripe(
//   process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string,
// );
// // const stripePromise = loadStripe(process.env.TEST_STRIPE_PUBLIC_KEY as string);

// export default function EmbeddedCheckoutButton() {
//   const [showCheckout, setShowCheckout] = useState(false);
//   const modalRef = useRef<HTMLDialogElement>(null);

//   const fetchClientSecret = useCallback(() => {
//     // Create a Checkout Session
//     return fetch("/api/embedded-checkout", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         priceId: "price_1QwnGEE4sAURr3tnLFKauzDP",
//         quantity: 1,
//       }),
//     })
//       .then((res) => res.json())
//       .then((data) => data.client_secret);
//   }, []);

//   const options = { fetchClientSecret };

//   const handleCheckoutClick = () => {
//     fetchClientSecret();
//     setShowCheckout(true);
//     modalRef.current?.showModal();
//   };

//   const handleCloseModal = () => {
//     setShowCheckout(false);
//     modalRef.current?.close();
//   };

//   return (
//     <div id="checkout" className="my-4">
//       <button className="btn" onClick={handleCheckoutClick}>
//         Open Modal with Embedded Checkout
//       </button>
//       <dialog
//         ref={modalRef}
//         className="modal size-full max-h-[80vh] max-w-[80vw] rounded-lg"
//       >
//         <div className="modal-box size-full max-h-[80vh] max-w-[80vw] rounded-lg p-6">
//           <h3 className="text-lg font-bold">Embedded Checkout</h3>
//           <div className="py-4">
//             {showCheckout && (
//               <EmbeddedCheckoutProvider
//                 stripe={stripePromise}
//                 options={options}
//               >
//                 <EmbeddedCheckout />
//               </EmbeddedCheckoutProvider>
//             )}
//           </div>
//           <div className="modal-action">
//             <form method="dialog">
//               <button className="btn" onClick={handleCloseModal}>
//                 Close
//               </button>
//             </form>
//           </div>
//         </div>
//       </dialog>
//     </div>
//   );
// }
