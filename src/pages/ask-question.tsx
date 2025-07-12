import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useQuestions } from '@/hooks/use-questions';

export function AskQuestion() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { createQuestion } = useQuestions();
  const navigate = useNavigate();

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(currentTag);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || tags.length === 0) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createQuestion({
        title: title.trim(),
        description: description.trim(),
        tags
      });
      navigate('/');
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Login Required</h2>
            <p className="text-muted-foreground mb-6">You must be logged in to ask a question.</p>
            <Button asChild>
              <a href="/login">Login to Continue</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Ask a Question</CardTitle>
          <p className="text-muted-foreground">
            Get help from the community by asking a clear, detailed question.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., How to implement authentication in React?"
                className="text-lg"
              />
              <p className="text-sm text-muted-foreground">
                Be specific and imagine you're asking a question to another person
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description *</Label>
              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder="Provide a detailed description of your problem..."
              />
              <p className="text-sm text-muted-foreground">
                Include what you've tried and what exactly you need help with
              </p>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags * (up to 5)</Label>
              <div className="space-y-2">
                <Input
                  id="tags"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Add tags... (press Enter or comma to add)"
                  disabled={tags.length >= 5}
                />
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-sm">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Add up to 5 tags to help others find and answer your question
              </p>
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!title.trim() || !description.trim() || tags.length === 0 || isSubmitting}
              >
                {isSubmitting ? 'Posting...' : 'Post Question'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}