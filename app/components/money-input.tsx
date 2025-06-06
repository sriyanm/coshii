"use client";

import { cn } from "@/app/lib/utils";
import CurrencyInput, {
  CurrencyInputOnChangeValues,
} from "react-currency-input-field";

export type MoneyInputValues = CurrencyInputOnChangeValues;

interface MoneyInputProps {
  className?: string | undefined;
  values: MoneyInputValues | null;
  onValuesChange: (value: MoneyInputValues | null) => void;
}

export default function MoneyInput({
  className,
  values,
  onValuesChange,
}: MoneyInputProps) {
  const MAX_VALUE = 9999.99;
  const valueLength = values?.formatted.length || 0;

  // Calculate width in characters, then scale when it's too long
  const maxCharsBeforeShrink = 6;
  const scale =
    valueLength > maxCharsBeforeShrink
      ? Math.min(1, maxCharsBeforeShrink / valueLength)
      : 1;

  return (
    <div
      className={cn(
        "relative w-full max-w-[600px] mx-auto flex justify-start",
        className
      )}
    >
      <div className="relative left-1/2 -translate-x-1/2 flex items-baseline gap-2 overflow-hidden">
        <span className="text-inherit">$</span>
        <div
          className="origin-left"
          style={{
            transform: `scaleX(${scale})`,
            transition: "transform 0.1s ease-out",
          }}
        >
          <CurrencyInput
            placeholder="0.00"
            className="bg-black/0 text-black placeholder:text-black/25 focus:outline-none"
            value={values?.value}
            onValueChange={(value, name, _values) => {
              const numeric = parseFloat(value || "0");
              if (!isNaN(numeric) && numeric > MAX_VALUE) return;
              onValuesChange(_values || null);
            }}
            max={MAX_VALUE}
            style={{
              width: Math.max(valueLength, 4) + "ch",
            }}
          />
        </div>
      </div>
    </div>
  );
}
