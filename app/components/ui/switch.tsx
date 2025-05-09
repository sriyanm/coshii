"use client";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  onCheckedColor?: string;
}

export const Switch = ({
  checked,
  onCheckedChange,
  className,
  onCheckedColor,
}: SwitchProps) => {
  return (
    <div
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${checked ? (onCheckedColor ? onCheckedColor : "bg-orange") : "bg-gray-200"} ${className}`}
    >
      <div
        className={`pointer-events-none block size-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`}
      />
    </div>
  );
};
