// "use client";

// import { useState } from "react";
// // import EditShopModal from "../components/EditShopModal";
// import { Pencil } from "lucide-react";

// export default function EditShopPage() {
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   return (
//     <div className="mx-auto flex min-h-screen max-w-md flex-col bg-white">
//       {/* Floating Edit Button */}
//       <div className="fixed top-7 left-1/2 -translate-x-1/2">
//         <button onClick={() => setIsModalOpen(true)} className="p-3">
//           <Pencil className="size-6 text-gray" />
//         </button>
//       </div>

//       {/* Modal (Controlled Externally) */}
//       {/* <EditShopModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} /> */}
//     </div>
//   );
// }
