import { useState, useEffect } from "react";

// Comment type definition
interface Comment {
  text: string;
  likes: number;
  owner: string;
  timestamp: string;
}

// Props definition
interface CommentsPopupProps {
  onClose: () => void;
  productId: string;
  buyerView: boolean;
}

// Mock API functions <-- TODO: fetch from backend (note product id is passed from socialbar.tsx)
const fetchComments = async (productId: string): Promise<Comment[]> => {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve([
        {
          text: "Great product!" + productId,
          likes: 5,
          owner: "Alice",
          timestamp: "2024-12-15T10:00:00Z",
        },
        {
          text: "Really loved it!",
          likes: 3,
          owner: "Bob",
          timestamp: "2024-12-14T15:30:00Z",
        },
      ]);
    }, 1000),
  );
};

//TODO: add to backend
const postComment = async (
  productId: string,
  commentText: string,
): Promise<Comment[]> => {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve([
        {
          text: "Great product!",
          likes: 5,
          owner: "Alice",
          timestamp: "2024-12-15T10:00:00Z",
        },
        {
          text: "Really loved it!",
          likes: 3,
          owner: "Bob",
          timestamp: "2024-12-14T15:30:00Z",
        },
        {
          text: commentText,
          likes: 0,
          owner: "You",
          timestamp: new Date().toISOString(),
        },
      ]);
    }, 500),
  );
};

export function CommentsPopup({
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
        const updatedComments = await postComment(productId, newComment);
        setComments(updatedComments);
        setNewComment("");
      } catch (error) {
        console.error("Failed to post comment:", error);
      } finally {
        setLoading(false);
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
            onClick={handleAddComment}
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
