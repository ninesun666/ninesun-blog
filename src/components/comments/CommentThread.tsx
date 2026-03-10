import React, { useState } from 'react';
import { ReplyForm } from './ReplyForm';
import type { Comment, Reply } from '../types/comment';

interface CommentThreadProps {
  comment: Comment;
  onReply: (commentId: string, content: string) => Promise<void>;
  maxDepth?: number;
  currentDepth?: number;
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  comment,
  onReply,
  maxDepth = 3,
  currentDepth = 0,
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replies, setReplies] = useState<Reply[]>(comment.replies || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReply = async (content: string) => {
    setIsSubmitting(true);
    try {
      await onReply(comment.id, content);
      // Add the new reply optimistically
      const newReply: Reply = {
        id: `reply-${Date.now()}`,
        content,
        author: 'You',
        createdAt: new Date().toISOString(),
      };
      setReplies([...replies, newReply]);
      setShowReplyForm(false);
    } catch (error) {
      console.error('Failed to post reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="comment-thread">
      <div className="comment-main">
        <div className="comment-header">
          <span className="comment-author">{comment.author}</span>
          <span className="comment-date">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="comment-content">{comment.content}</div>
        
        {currentDepth < maxDepth && (
          <button
            className="reply-button"
            onClick={() => setShowReplyForm(!showReplyForm)}
          >
            {showReplyForm ? 'Cancel' : 'Reply'}
          </button>
        )}
      </div>

      {showReplyForm && (
        <div className="reply-form-container">
          <ReplyForm
            onSubmit={handleReply}
            isSubmitting={isSubmitting}
            placeholder="Write a reply..."
          />
        </div>
      )}

      {replies.length > 0 && (
        <div className="replies-list">
          {replies.map((reply) => (
            <div key={reply.id} className="reply-item">
              <div className="reply-header">
                <span className="reply-author">{reply.author}</span>
                <span className="reply-date">
                  {new Date(reply.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="reply-content">{reply.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
