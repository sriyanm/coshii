import { useState } from "react";
import { CommentsPopup } from "./Comments";
import { FaHeart, FaShareAlt, FaCommentDots } from "react-icons/fa";

interface SocialBarProps {
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
}

export function SocialBar({ onLike, onComment, onShare }: SocialBarProps) {
  const [showComments, setShowComments] = useState(false);

  const handleCommentClick = () => {
    setShowComments(true); // Show the comments popup
    onComment(); // Trigger the passed onComment handler
  };

  const handleClosePopup = () => {
    setShowComments(false); // Close the comments popup
  };

  const handleShareClick = () => {
    onShare(); // Trigger the passed onShare handler (for now, just log)
    console.log("Share button clicked"); // Placeholder for share functionality
  };

  return (
    <div className="flex flex-col space-y-4">
      {" "}
      {/* Changed to flex-col and added space-y-4 for vertical stacking */}
      {/* Share Button */}
      <button onClick={handleShareClick} className="text-white">
        <FaShareAlt className="mr-2 text-2xl" />
      </button>
      {/* Comment Button */}
      <button onClick={handleCommentClick} className="text-white">
        <FaCommentDots className="mr-2 text-2xl" />
      </button>
      {/* Like Button */}
      <button onClick={onLike} className="text-white">
        <FaHeart className="mr-2 text-2xl" />
      </button>
      {/* Conditional rendering for the popup */}
      {showComments && (
        <div className="popup-overlay">
          <CommentsPopup onClose={handleClosePopup} productId="123" />
        </div>
      )}
    </div>
  );
}
