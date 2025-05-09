"use client";

import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import type { Order } from "../types";
import { useRef, useState, useEffect } from "react";

interface OrderDetailsViewProps {
  order: Order;
  onBack: () => void;
}

function SlideToConfirm({ handleConfirm }: { handleConfirm: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const onStart = () => setIsDragging(true);

  const onEnd = () => {
    setIsDragging(false);
    const container = containerRef.current;
    if (!container) return;

    if (dragX > container.offsetWidth * 0.8) {
      setIsConfirmed(true);
      handleConfirm();
    } else {
      setDragX(0);
    }
  };

  const onMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || isConfirmed) return;

    const clientX = (e as TouchEvent).touches
      ? (e as TouchEvent).touches[0].clientX
      : (e as MouseEvent).clientX;

    const container = containerRef.current;
    const handle = handleRef.current;
    if (!container || !handle) return;

    const rect = container.getBoundingClientRect();
    const offset = Math.min(
      Math.max(0, clientX - rect.left - handle.offsetWidth / 2),
      rect.width - handle.offsetWidth
    );
    setDragX(offset);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", onMove);
      window.addEventListener("touchmove", onMove);
      window.addEventListener("mouseup", onEnd);
      window.addEventListener("touchend", onEnd);
    }
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchend", onEnd);
    };
  }, [isDragging, dragX]);

  return (
    <div className="absolute inset-x-0 bottom-16 mx-auto max-w-md p-4">
      <div ref={containerRef} className="relative h-16 w-full rounded-full bg-[#D9D9D9]/50">
        <div className="absolute inset-0 flex items-center justify-center text-sm text-black font-semibold pointer-events-none">
          {isConfirmed ? "Completed" : "Slide to complete"}
        </div>

        <div
          ref={handleRef}
          onMouseDown={onStart}
          onTouchStart={onStart}
          style={{ transform: `translateX(${dragX}px)` }}
          className="absolute top-1 left-1 size-14 rounded-full bg-[#FF7A00] transition-transform active:scale-105 touch-none"
        />
      </div>
    </div>
  );
}

export function OrderDetailsView({ order, onBack }: OrderDetailsViewProps) {
  const handleConfirm = () => {
    console.log("Order confirmed!");
    // TODO: backend call to confirm transaction
  };

  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col">
      <div className="flex items-center gap-4 border-b p-4">
        <button onClick={onBack}>
          <ChevronLeft className="size-6" />
        </button>
        <h1 className="text-xl font-bold">{order.customerName}</h1>
      </div>

      <div className="space-y-6 p-4 pb-32"> {/* add bottom padding so content doesn't hide behind slider */}
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
          <p className="text-sm text-muted-foreground">
            {order.address || "No address provided"}
          </p>
        </div>
      </div>

      <SlideToConfirm handleConfirm={handleConfirm} />
    </div>
  );
}
