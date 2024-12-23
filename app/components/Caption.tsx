import { useState } from "react";

export function Caption({ caption }: { caption: string }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Define a function to toggle the expanded state
  const toggleCaption = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="from-black to-transparent absolute bottom-0 left-0 z-10 bg-gradient-to-t p-5 text-white">
      <p
        className={`text-xl ${isExpanded ? "h-auto" : "line-clamp-1"} overflow-hidden`}
      >
        {caption}
      </p>

      {/* If the caption is not expanded, show the "view more" button */}
      {!isExpanded && caption.length > 100 && (
        <button onClick={toggleCaption} className="text-blue-500 mt-2 text-sm">
          View more
        </button>
      )}

      {/* If the caption is expanded, show the "view less" button */}
      {isExpanded && caption.length > 100 && (
        <button onClick={toggleCaption} className="text-blue-500 mt-2 text-sm">
          View less
        </button>
      )}
    </div>
  );
}
