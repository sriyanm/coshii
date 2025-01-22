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
  return (
    <span className={cn("overflow-hidden whitespace-nowrap", className)}>
      $
      <CurrencyInput
        placeholder="0.00"
        className="bg-black/0 text-black placeholder:text-black/25 focus:outline-none"
        value={values?.value}
        onValueChange={(value, name, _values) =>
          onValuesChange(_values || null)
        }
        style={{
          width: Math.max(values?.formatted.length || 0, 4) + "ch",
        }}
      />
    </span>
  );
}
