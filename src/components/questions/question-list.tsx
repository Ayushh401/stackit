import { useState, useEffect } from 'react';
import { QuestionCard } from './question-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuestions } from '@/hooks/use-questions';
import { Skeleton } from '@/components/ui/skeleton';


const popularTags = ['react', 'javascript', 'nodejs', 'css', 'html', 'python', 'typescript', 'vue'];

export function QuestionList() {
  const { questions, loading, error, refetch } = useQuestions();
  const [filter, setFilter] = useState<'newest' | 'votes' | 'active'>('newest');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    refetch();
  }, [filter]);
  const filteredQuestions = questions
    .filter(q => !selectedTag || q.tags?.includes(selectedTag))
    .sort((a, b) => {
      switch (filter) {
        case 'votes':
          return b.votes - a.votes;
        case 'active':
          return (b.answerCount || 0) - (a.answerCount || 0);
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Skeleton className="h-8 w-32" />
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">Failed to load questions: {error}</p>
        <Button onClick={refetch}>Try Again</Button>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-2xl font-bold">Questions</h2>
          <Badge variant="secondary">{filteredQuestions.length}</Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={filter === 'newest' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('newest')}
          >
            Newest
          </Button>
          <Button
            variant={filter === 'votes' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('votes')}
          >
            Votes
          </Button>
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('active')}
          >
            Active
          </Button>
        </div>
      </div>

      {/* Popular Tags */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Popular Tags</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedTag === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTag(null)}
          >
            All
          </Button>
          {popularTags.map((tag) => (
            <Button
              key={tag}
              variant={selectedTag === tag ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {filteredQuestions.map((question) => (
          <QuestionCard 
            key={question.id} 
            question={{
              id: question.id,
              title: question.title,
              description: question.description,
              tags: question.tags || [],
              author: question.author || { username: 'Unknown', reputation: 0 },
              createdAt: new Date(question.created_at),
              votes: question.votes,
              answers: question.answerCount || 0,
              hasAcceptedAnswer: question.hasAcceptedAnswer || false,
              views: question.views
            }} 
          />
        ))}
      </div>

      {filteredQuestions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No questions found with the current filters.</p>
        </div>
      )}
    </div>
  );
}