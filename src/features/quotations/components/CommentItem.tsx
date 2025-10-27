import { useState } from 'react';
import type { Comment, Role } from '../../../types';
import { useAuthStore } from '../../../store/authStore';
import { usePermissions } from '../../../hooks/usePermissions';
import { Button } from '../../../components/ui/Button';
import { usePostReply } from '../hooks/usePostReply';

interface CommentItemProps {
  comment: Comment;
  quotationId: string;
}

export const CommentItem = ({ comment, quotationId }: CommentItemProps) => {
  const { user } = useAuthStore();
  const { canReply } = usePermissions();
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  
  const postReplyMutation = usePostReply();

  if (!user) return null;

  const visibleReplies =
    comment.replies?.filter((reply) => reply.role === user.role) || [];

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    
    postReplyMutation.mutate({
      quotationId,
      commentId: comment.id,
      text: replyText,
      author: user.name,
      role: user.role as Role,
    }, {
      onSuccess: () => setReplyText(''),
    });
  };

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold">{comment.author}</span>
        <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs">
          {comment.role}
        </span>
        <span className="text-gray-500">
          {new Date(comment.timestamp).toLocaleString()}
        </span>
      </div>
      <p className="mt-2 text-gray-800">{comment.text}</p>

      {/* Replies */}
      <div className="mt-2 pl-4">
        {visibleReplies.length > 0 && (
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            {showReplies ? 'Hide' : 'View'} replies ({visibleReplies.length})
          </button>
        )}
        
        {showReplies && (
          <div className="mt-2 space-y-3">
            {visibleReplies.map((reply) => (
              <div key={reply.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">{reply.author}</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                    {reply.role} (visible to you)
                  </span>
                </div>
                <p className="mt-1 text-gray-700">{reply.text}</p>
              </div>
            ))}
          </div>
        )}
        
        {/* Reply Form */}
        {canReply && (
          <form onSubmit={handleReplySubmit} className="mt-3">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Add a reply (visible to managers)..."
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={2}
            />
            <Button
              type="submit"
              variant="secondary"
              className="mt-2"
              isLoading={postReplyMutation.isPending}
            >
              Post Reply
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};