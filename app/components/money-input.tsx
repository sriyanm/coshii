"use client";

import { cn } from "@/app/lib/utils";
import CurrencyInput, {
  CurrencyInputOnChangeValues,
} from "react-currency-input-field";

export type MoneyInputValues = CurrencyInputOnChangeValues;

interface MoneyInputProps {
  className?: string;
  values: MoneyInputValues | null;
  onValuesChange: (value: MoneyInputValues | null) => void;
}

export default function MoneyInput({
  className,
  values,
  onValuesChange,
}: MoneyInputProps) {
  const MAX_VALUE = 9999.99;
  const formatted = values?.formatted || "";
  const length = formatted.length;

  // Use a max length before scaling starts
  const MAX_VISIBLE_CHARS = 5;
  const scale =
    length > MAX_VISIBLE_CHARS
      ? Math.max(0.85, MAX_VISIBLE_CHARS / length) // limit minimum scale
      : 1;

  return (
    <div className={cn("relative w-full flex justify-center overflow-hidden", className)}>
      <div className="relative flex items-baseline max-w-full">
        <div className="relative left-1/2 -translate-x-1/2 flex items-baseline gap-2 max-w-full">
          <span className="text-inherit">$</span>
          <div
            className="origin-left transition-transform duration-150"
            style={{ transform: `scaleX(${scale})` }}
          >
            <CurrencyInput
              placeholder="0.00"
              className="bg-transparent text-black placeholder:text-black/25 focus:outline-none"
              value={values?.value}
              onValueChange={(value, name, _values) => {
                const numeric = parseFloat(value || "0");
                if (!isNaN(numeric) && numeric > MAX_VALUE) return;
                onValuesChange(_values || null);
              }}
              max={MAX_VALUE}
              style={{
                width: `${Math.max(length, 4)}ch`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}