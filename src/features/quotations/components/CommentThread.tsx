import { useState } from 'react';
import type { Quotation, Role } from '../../../types';
import { useAuthStore } from '../../../store/authStore';
import { usePermissions } from '../../../hooks/usePermissions';
import { Button } from '../../../components/ui/Button';
import { CommentItem } from './CommentItem';
import { usePostComment } from '../hooks/usePostComment';

interface CommentThreadProps {
  quotation: Quotation;
}

export const CommentThread = ({ quotation }: CommentThreadProps) => {
  const { user } = useAuthStore();
  const { canComment } = usePermissions();
  const [commentText, setCommentText] = useState('');

  const postCommentMutation = usePostComment();

  if (!user) return null;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    postCommentMutation.mutate({
      quotationId: quotation.id,
      text: commentText,
      author: user.name,
      role: user.role as Role,
    }, {
      onSuccess: () => setCommentText(''),
    });
  };

  return (
    <div className="bg-white shadow rounded-lg mt-6">
      <h3 className="text-lg font-semibold p-4 border-b border-gray-200">
        Activity & Comments
      </h3>
      <div className="divide-y divide-gray-200">
        {quotation.comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} quotationId={quotation.id} />
        ))}
      </div>
      
      {quotation.comments.length === 0 && (
        <p className="p-4 text-gray-500">No comments yet.</p>
      )}

      {canComment && (
        <form onSubmit={handleCommentSubmit} className="p-4 border-t border-gray-200">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment (visible to all)..."
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={3}
          />
          <Button
            type="submit"
            className="mt-2"
            isLoading={postCommentMutation.isPending}
          >
            Post Comment
          </Button>
        </form>
      )}
    </div>
  );
};