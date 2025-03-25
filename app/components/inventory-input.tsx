"use client";

import { Minus, Plus, Archive } from "lucide-react";

interface InventoryInputProps {
  prefix?: string;
  suffix?: string;
  min?: number;
  inventory: number;
  onInventoryChange: (value: number) => void;
}

export default function InventoryInput({
  inventory,
  prefix = "",
  suffix = "",
  min = 1,
  onInventoryChange,
}: InventoryInputProps) {
  const decrement = () => onInventoryChange(Math.max(min, inventory - 1));
  const increment = () => onInventoryChange(inventory + 1);

  return (
    <div className="flex h-10 w-auto items-center justify-between rounded-full bg-black/80 px-4 text-white">
      <button
        onClick={decrement}
        className="flex size-8 items-center justify-center text-white"
      >
        {inventory === min ? (
          <Archive className="size-6" />
        ) : (
          <Minus className="size-6" />
        )}
      </button>
      <span className="text-sm font-semibold text-white">
        {prefix}
        {inventory}
        {suffix}
      </span>
      <button
        onClick={increment}
        className="flex size-8 items-center justify-center text-white"
      >
        <Plus className="size-6" />
      </button>
    </div>
  );
}
