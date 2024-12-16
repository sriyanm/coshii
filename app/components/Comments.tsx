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
}

// Mock API functions
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

export function CommentsPopup({ onClose, productId }: CommentsPopupProps) {
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
    <div className="comments-popup bg-white fixed inset-x-0 bottom-0 h-4/5 overflow-y-auto bg-opacity-100 p-4 shadow-lg backdrop-blur-md">
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
            <li key={index} className="border-gray-200 border-b pb-2">
              <p className="font-semibold">{comment.owner}</p>
              <p className="text-gray-600 text-sm">{comment.text}</p>
              <p className="text-gray-400 text-xs">
                {new Date(comment.timestamp).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex items-center">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment"
          className="border-gray-300 flex-1 rounded-lg border p-2"
        />
        <button
          onClick={handleAddComment}
          disabled={loading}
          className="bg-blue-500 text-white disabled:bg-gray-300 ml-2 rounded-lg px-4 py-2"
        >
          Post
        </button>
      </div>
    </div>
  );
}
