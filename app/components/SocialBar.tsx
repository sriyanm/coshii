import { useState } from "react";
import { CommentsPopup } from "./Comments";
import { FaHeart, FaRegHeart } from "react-icons/fa"; // Import like icons
import { MdIosShare, MdOutlineModeComment } from "react-icons/md"; // Import share and comment icons

interface SocialBarProps {
  onLike: () => void; // Callback for when the Like button is clicked
  onComment: () => void; // Callback for when the Comment button is clicked
  onShare: () => void; // Callback for when the Share button is clicked
  buyerView: boolean;
}

export function SocialBar({
  onLike,
  onComment,
  onShare,
  buyerView,
}: SocialBarProps) {
  const [liked, setLiked] = useState(false); // State to track like status
  const [showComments, setShowComments] = useState(false); // State to toggle comment popup

  // Handle Like button click
  const handleLikeClick = () => {
    setLiked((prevLiked) => !prevLiked); // Toggle like state
    onLike(); // Trigger the passed onLike handler
  };

  // Handle Comment button click
  const handleCommentClick = () => {
    setShowComments(true); // Show the comments popup
    onComment(); // Trigger the passed onComment handler
  };

  // Handle closing the Comments popup
  const handleClosePopup = () => {
    setShowComments(false); // Close the comments popup
  };

  // Handle Share button click
  const handleShareClick = () => {
    onShare(); // Trigger the passed onShare handler
    console.log("Share button clicked"); // Placeholder for share functionality
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Share Button */}
      <button onClick={handleShareClick} className="text-white" title="Share">
        <MdIosShare className="mr-2 text-2xl" />
      </button>

      {/* Comment Button */}
      <button
        onClick={handleCommentClick}
        className="text-white"
        title="Comment"
      >
        <MdOutlineModeComment className="mr-2 text-2xl" />
      </button>

      {/* Like Button */}
      <button
        className="text-white"
        onClick={handleLikeClick}
        disabled={buyerView}
        title={liked ? "Unlike" : "Like"}
        aria-label={liked ? "Unlike" : "Like"}
      >
        {liked ? (
          <FaHeart className="size-6" />
        ) : (
          <FaRegHeart className="size-6" />
        )}
      </button>

      {/* Conditional rendering for the popup */}
      {showComments && (
        <div className="popup-overlay fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
          <div className="comments-popup size-4/5 overflow-y-auto bg-white p-4 shadow-lg backdrop-blur-md">
            <CommentsPopup
              onClose={handleClosePopup}
              productId="123"
              buyerView={buyerView}
            />
          </div>
        </div>
      )}
    </div>
  );
}
