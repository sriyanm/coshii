"use client";

import { Minus, Plus, Archive } from "lucide-react";

interface InventoryInputProps {
  inventory: number;
  onInventoryChange: (value: number) => void;
}

export default function InventoryInput({
  inventory,
  onInventoryChange,
}: InventoryInputProps) {
  const decrement = () => onInventoryChange(Math.max(1, inventory - 1));
  const increment = () => onInventoryChange(inventory + 1);

  return (
    <div className="flex h-10 w-36 items-center justify-between rounded-full bg-black/80 px-4 text-white">
      <button
        onClick={decrement}
        className="flex size-8 items-center justify-center text-white"
      >
        {inventory === 1 ? (
          <Archive className="size-6" />
        ) : (
          <Minus className="size-6" />
        )}
      </button>
      <span className="text-2xl font-semibold text-white">{inventory}</span>
      <button
        onClick={increment}
        className="flex size-8 items-center justify-center text-white"
      >
        <Plus className="size-6" />
      </button>
    </div>
  );
}
