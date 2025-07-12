import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import { useAuth } from '@/contexts/auth-context';
import { useNotifications } from '@/contexts/notification-context';
import { toast } from 'sonner';

interface AnswerFormProps {
  questionId: string;
  onAnswerSubmitted: (content: string) => Promise<void>;
}

export function AnswerForm({ questionId, onAnswerSubmitted }: AnswerFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    
    try {
      await onAnswerSubmitted(content);
      setContent('');
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="border rounded-lg p-6 text-center">
        <p className="text-muted-foreground mb-4">You must be logged in to post an answer.</p>
        <Button asChild>
          <a href="/login">Login to Answer</a>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Your Answer</label>
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="Write your answer here..."
          className="mt-2"
        />
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={!content.trim() || isSubmitting}>
          {isSubmitting ? 'Posting...' : 'Post Answer'}
        </Button>
      </div>
    </form>
  );
}