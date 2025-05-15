import { useState, useEffect } from "react";
import { CommentsPopup } from "./Comments";
import { FaHeart, FaRegHeart } from "react-icons/fa"; // Import like icons
import { MdIosShare, MdOutlineModeComment } from "react-icons/md"; // Import share and comment icons
import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db, auth } from "@/app/lib/client/firebase";

interface SocialBarProps {
  onLike: () => void; // Callback for when the Like button is clicked
  onComment: () => void; // Callback for when the Comment button is clicked
  onShare: () => void; // Callback for when the Share button is clicked
  buyerView: boolean;
  likesCountInit: number;
  commentsCountInit: number;
  productId: string;
}

export function SocialBar({
  onLike,
  onComment,
  onShare,
  buyerView,
  likesCountInit,
  commentsCountInit,
  productId,
}: SocialBarProps) {
  const [liked, setLiked] = useState(false); // State to track like status
  const [likesCount, setLikesCount] = useState(likesCountInit); // Track number of likes
  const [likeToggled, setLikeToggled] = useState(false); // To decouple likes and updating backend
  const [showComments, setShowComments] = useState(false); // State to toggle comment popup
  const [commentsCount, setCommentsCount] = useState(commentsCountInit);
  const [hasFetchedLike, setHasFetchedLike] = useState(false); // guard

  // Check if user has already liked a product (when loaded)
  useEffect(() => {
    const fetchLikeStatus = async () => {
      const user = auth.currentUser;
      if (!user || !productId) return;

      const likeRef = doc(db, "products", productId, "likes", user.uid);
      const likeSnap = await getDoc(likeRef);

      if (likeSnap.exists()) {
        setLiked(true);
      } else {
        setLiked(false);
      }

      setHasFetchedLike(true);
    };

    fetchLikeStatus();
  }, [productId]);

  // Updating likes in backend
  useEffect(() => {
    if (!hasFetchedLike || !likeToggled) return;

    const user = auth.currentUser;
    if (!user || !productId) return;

    const productRef = doc(db, "products", productId);
    const likeRef = doc(db, "products", productId, "likes", user.uid);

    const handleLike = async () => {
      try {
        if (liked) {
          // Add user like to likes subcollection
          await setDoc(likeRef, {
            timestamp: new Date().toISOString(),
          });

          // Increment likesCount (or set to 1 if missing)
          try {
            await updateDoc(productRef, {
              likesCount: increment(1),
            });
          } catch {
            // fallback if likesCount doesn’t exist
            const snap = await getDoc(productRef);
            if (snap.exists()) {
              await updateDoc(productRef, {
                likesCount: 1,
              });
            }
          }
        } else {
          // Remove like
          await deleteDoc(likeRef);

          // Decrement likesCount
          await updateDoc(productRef, {
            likesCount: increment(-1),
          });
        }
      } catch (error) {
        console.error("Error toggling like:", error);
      }
    };

    handleLike();
  }, [liked, productId, hasFetchedLike, likeToggled]);

  // Handle Like button click
  const handleLikeClick = () => {
    if (!liked) {
      setLikesCount(likesCount + 1);
    } else {
      setLikesCount(likesCount - 1);
    }

    setLiked((prevLiked) => !prevLiked); // Toggle like state
    setLikeToggled(true);
    onLike(); // Trigger the passed onLike handler
  };

  // Handle when post comment
  const handleCommentPost = () => {
    // Increment comment count
    setCommentsCount(commentsCount + 1);
    onComment(); // Trigger the passed onComment handler
  };

  // Handle Comment button click
  const handleCommentClick = () => {
    setShowComments(true); // Show the comments popup
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
    <div className="flex flex-col items-center space-y-2">
      {/* Share Button */}
      <button
        onClick={handleShareClick}
        className="flex flex-col items-center text-white drop-shadow"
        title="Share"
      >
        <MdIosShare className="text-3xl drop-shadow-[0_5px_5px_rgba(0,0,0,0.2)]" />
        <span className="h-3" />{" "}
        {/* Placeholder to align spacing with counts */}
      </button>

      {/* Comment Button */}
      <button
        onClick={handleCommentClick}
        className="relative flex flex-col items-center text-white drop-shadow"
        title="Comment"
      >
        <MdOutlineModeComment className="text-3xl drop-shadow-[0_5px_5px_rgba(0,0,0,0.2)]" />
        <span className="-mt-0.5 text-xs text-white">{commentsCount}</span>
      </button>

      {/* Like Button */}
      <button
        className="relative flex flex-col items-center text-white drop-shadow"
        onClick={handleLikeClick}
        disabled={buyerView}
        title={liked ? "Unlike" : "Like"}
        aria-label={liked ? "Unlike" : "Like"}
      >
        {liked ? (
          <FaHeart className="size-7 drop-shadow-[0_5px_5px_rgba(0,0,0,0.2)]" />
        ) : (
          <FaRegHeart className="size-7 drop-shadow-[0_5px_5px_rgba(0,0,0,0.2)]" />
        )}
        <span className="mt-px text-xs text-white">{likesCount}</span>
      </button>

      {/* Conditional rendering for the popup */}
      {showComments && (
        <div className="popup-overlay fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
          <div className="comments-popup size-4/5 overflow-y-auto bg-white p-4 shadow-lg backdrop-blur-md">
            <CommentsPopup
              onPost={handleCommentPost}
              onClose={handleClosePopup}
              productId={productId}
              buyerView={buyerView}
            />
          </div>
        </div>
      )}
    </div>
  );
}
