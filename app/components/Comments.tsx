import { useState, useEffect } from "react";
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

  return (
    <div className="comments-popup fixed inset-x-0 bottom-0 h-4/5 overflow-y-auto bg-white bg-opacity-100 p-4 shadow-lg backdrop-blur-md">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Comments</h2>
        <button onClick={onClose} className="text-gray-500">
          Close
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {comments.map((comment, index) => (
            <li key={index} className="border-b border-gray-200 pb-2">
              <p className="font-semibold">{comment.owner}</p>
              <p className="text-sm text-gray-600">{comment.text}</p>
              <p className="text-xs text-gray-400">
                {new Date(comment.timestamp).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}

      {!buyerView && (
        <div className="mt-4 flex items-center">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment"
            className="flex-1 rounded-lg border border-gray-300 p-2"
          />
          <button
            onClick={() => {
              handleAddComment();
              onPost();
            }}
            disabled={loading}
            className="ml-2 rounded-lg bg-blue-500 px-4 py-2 text-white disabled:bg-gray-300"
          >
            Post
          </button>
        </div>
      )}
    </div>
  );
}
