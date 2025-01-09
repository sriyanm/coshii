interface ToggleProps {
  options: string[];
  selectedOption: string;
  onOptionSelect: (option: string) => void;
  font?: string;
  underline?: boolean;
}

export function Toggle({
  options,
  selectedOption,
  onOptionSelect,
  font = "SF Pro",
  underline = false,
}: ToggleProps) {
  return (
    <div
      className="flex justify-start gap-4 overflow-x-auto"
      style={{
        fontFamily: font,
        whiteSpace: "nowrap", // Prevent line breaks for horizontal scroll
        scrollBehavior: "smooth", // Smooth scrolling
        justifyContent: options.length <= 3 ? "center" : "flex-start", // Center if there are few options
      }}
    >
      {options.map((option) => (
        <button
          key={option}
          className={`rounded-md px-5 transition-colors duration-200 ease-in-out ${
            selectedOption === option
              ? `bg-gray-200 font-bold text-black ${underline ? "underline" : ""}`
              : "text-gray-500 bg-gray-100"
          }`}
          onClick={() => onOptionSelect(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
