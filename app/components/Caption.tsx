import { useState } from "react";

export function Caption({ caption }: { caption: string }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Toggle the expanded state
  const toggleCaption = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="w-full">
      <p
        className={`text-xs ${isExpanded ? "h-auto" : "line-clamp-1"} overflow-hidden`}
      >
        {caption}
      </p>
      {caption.length > 100 && (
        <button onClick={toggleCaption} className="text-blue-500 text-xs">
          {isExpanded ? "View less" : "View more"}
        </button>
      )}
    </div>
  );
}
