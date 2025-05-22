import { useState, useEffect, useRef } from "react";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  getDoc,
  increment,
} from "firebase/firestore";
import { db, auth } from "@/app/lib/client/firebase";

// Comment type definition
interface Comment {
  text: string;
  likes: number;
  owner: string;
  timestamp: string;
}

// Props definition
interface CommentsPopupProps {
  onPost: () => void;
  onClose: () => void;
  productId: string;
  buyerView: boolean;
}

// Fetching comments
const fetchComments = async (productId: string): Promise<Comment[]> => {
  try {
    const commentsRef = collection(db, "products", productId, "comments");
    const snapshot = await getDocs(commentsRef);

    if (snapshot.empty) {
      console.log("empty");
      return [];
    }

    const comments: Comment[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        text: data.text || "",
        likes: data.likes || 0,
        owner: data.owner || "Unknown",
        timestamp: data.timestamp || new Date().toISOString(), // fallback
      };
    });

    return comments;
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
};

//
const postComment = async (
  productId: string,
  commentText: string,
): Promise<Comment | null> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const comment: Comment = {
      text: commentText,
      likes: 0,
      owner: user.displayName || user.email || "Anonymous",
      timestamp: new Date().toISOString(),
    };

    console.log("Posting", commentText, productId);

    // Add comment
    const commentsRef = collection(db, "products", productId, "comments");
    await addDoc(commentsRef, comment);

    // Increment comments count
    const productRef = doc(db, "products", productId);
    try {
      await updateDoc(productRef, {
        commentsCount: increment(1),
      });
    } catch {
      // fallback if commentsCount doesn’t exist
      const snap = await getDoc(productRef);
      if (snap.exists()) {
        await updateDoc(productRef, {
          commentsCount: 1,
        });
      }
    }

    return comment;
  } catch (error) {
    console.error("Error posting comment:", error);
    return null;
  }
};

export function CommentsPopup({
  onPost,
  onClose,
  productId,
  buyerView,
}: CommentsPopupProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadComments = async () => {
      setLoading(true);
      try {
        const fetchedComments = await fetchComments(productId);
        setComments(fetchedComments);
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [productId]);

  const handleAddComment = async () => {
    if (newComment.trim()) {
      setLoading(true);
      try {
        const newComments = await postComment(productId, newComment);
        if (newComments) {
          setComments([...comments, newComments]);
        }
        setNewComment("");
      } catch (error) {
        console.error("Failed to post comment:", error);
      } finally {
        setLoading(false);
      }
      // send notification
      try {
        const notifsRef = collection(db, "notifications");
        await addDoc(notifsRef, {
          toUser: "X6WJJyhYLJcMppEPgnUALnLhy1i1",
          fromUser: auth.currentUser?.uid,
          type: "comment",
          content: newComment,
          target: productId, // The product ID or relevant identifier
          timestamp: new Date().toISOString(),
          thumbnail: "",
        });

        console.log("Notif sent successfully");
      } catch (error) {
        console.error("Failed to post comment:", error);
      }
    }
  };

  const modalRef = useRef<HTMLDivElement | null>(null);
  const touchStartY = useRef<number | null>(null);

  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    touchStartY.current = e.touches[0].clientY;
  }

  function handleTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    if (touchStartY.current === null) return;
    const touchCurrentY = e.touches[0].clientY;
    const diff = touchCurrentY - touchStartY.current;

    if (diff > 50) {
      onClose();
      touchStartY.current = null;
    }
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  }

  const [viewportHeight, setViewportHeight] = useState<number | undefined>(
    undefined,
  );

  useEffect(() => {
    function onResize() {
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height);
      } else {
        // fallback
        setViewportHeight(window.innerHeight);
      }
    }

    // Initial set
    onResize();

    window.visualViewport?.addEventListener("resize", onResize);
    return () => {
      window.visualViewport?.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={handleBackdropClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      <div
        ref={modalRef}
        style={{
          height: viewportHeight ? `${viewportHeight * 0.6}px` : "60vh",
        }}
        className="animate-slideUp flex h-[60vh] w-screen max-w-md flex-col overflow-hidden rounded-t-lg bg-white/60 p-4 shadow-xl backdrop-blur-lg"
      >
        {/* Dragging icon */}
        <div className="flex justify-center">
          <div className="mb-2 h-1.5 w-20 rounded-full bg-white/70"></div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-800">Comments</h2>
        </div>

        {/* Scrollable Comments*/}
        <div className="mt-4 flex-1 overflow-y-auto pr-1">
          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : (
            <ul className="space-y-4">
              {comments.map((comment, index) => (
                <li key={index} className="pb-2">
                  <p className="font-semibold text-gray-800">{comment.owner}</p>
                  <p className="text-sm text-gray-600">{comment.text}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!buyerView && (
          <div className="relative mt-4">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full rounded-full border border-gray-300 bg-white/80 px-4 py-2 pr-12 text-base backdrop-blur focus:outline-none"
              style={{ fontSize: "16px" }}
            />
            <button
              onClick={() => {
                handleAddComment();
                onPost();
              }}
              disabled={loading || newComment.trim() === ""}
              className={`absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full transition-colors ${newComment.trim() === "" ? "bg-gray-300 text-white" : "bg-blue-500 text-white hover:bg-blue-600"} `}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
