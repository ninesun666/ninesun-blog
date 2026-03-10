import React, { useState } from 'react';

interface ReplyFormProps {
  onSubmit: (content: string) => Promise<void>;
  isSubmitting?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

export const ReplyForm: React.FC<ReplyFormProps> = ({
  onSubmit,
  isSubmitting = false,
  placeholder = 'Write a reply...',
  autoFocus = false,
}) => {
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;
    
    await onSubmit(content.trim());
    setContent('');
  };

  return (
    <form className="reply-form" onSubmit={handleSubmit}>
      <textarea
        className="reply-textarea"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={isSubmitting}
        rows={3}
      />
      <div className="reply-form-actions">
        <button
          type="submit"
          className="reply-submit-btn"
          disabled={!content.trim() || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Reply'}
        </button>
      </div>
    </form>
  );
};
