interface ToggleProps {
  options: string[];
  selectedOption: string;
  onOptionSelect: (option: string) => void;
  underline?: boolean;
  borderBox?: boolean; // New prop for border box
  selectedColor?: string; // New prop for selected color
}

export function Toggle({
  options,
  selectedOption,
  onOptionSelect,
  underline = false,
  borderBox = false,
  selectedColor = "black", // Default selected color
}: ToggleProps) {
  return (
    <div
      className={`flex justify-start gap-4 overflow-x-auto`} // Apply border if borderBox is true
      style={{
        whiteSpace: "nowrap", // Prevent line breaks for horizontal scroll
        scrollBehavior: "smooth", // Smooth scrolling
        justifyContent: options?.length <= 3 ? "center" : "flex-start", // Center if there are few options
      }}
    >
      {options?.map((option) => (
        <button
          key={option}
          className={`rounded-[6px] px-5 transition-colors duration-200 ease-in-out ${borderBox ? "border" : ""} ${
            selectedOption === option
              ? `text-sm font-bold${selectedColor} ${underline ? "underline" : ""}` // Apply selectedColor
              : "text-sm text-gray-500"
          }`}
          style={{
            borderColor:
              borderBox && selectedOption === option
                ? selectedColor
                : undefined,
          }}
          onClick={() => onOptionSelect(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
