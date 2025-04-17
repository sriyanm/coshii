"use client";

import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import type { Order } from "../types";

interface OrderDetailsViewProps {
  order: Order;
  onBack: () => void;
}

export function OrderDetailsView({ order, onBack }: OrderDetailsViewProps) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col">
      <div className="flex items-center gap-4 border-b p-4">
        <button onClick={onBack}>
          <ChevronLeft className="size-6" />
        </button>
        <h1 className="text-xl font-bold">{order.customerName}</h1>
      </div>

      <div className="space-y-6 p-4">
        <div className="space-y-4">
          {order.items.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 rounded-lg bg-[#D9D9D9]/50 p-4"
            >
              <Image
                src={item.product.images[0] || "/placeholder.svg"}
                alt={item.product.name}
                width={64}
                height={64}
                className="rounded-md object-cover"
              />
              <div>
                <h3 className="font-medium">{item.product.name}</h3>
                <p className="text-muted-foreground">
                  ${item.product.price.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">
                  x{item.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold">Address</h2>
          {/* <div className="rounded-lg border p-4"> */}
          <p className="text-sm text-muted-foreground">
            {order.address || "No address provided"}
          </p>
          {/* </div> */}
        </div>

        <div className="absolute inset-x-0 bottom-16 mx-auto max-w-md p-4">
          <div className="flex items-center justify-between rounded-lg bg-[#D9D9D9]/50 p-4">
            <div className="size-12 rounded-full bg-[#FF7A00]" />
            <div className="flex-1 px-4">
              <p className="text-center">Slide to complete</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
