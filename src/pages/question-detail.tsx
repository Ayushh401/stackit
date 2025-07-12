import { useParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Bookmark, Share2, Flag } from 'lucide-react';
import { AnswerCard } from '@/components/answers/answer-card';
import { AnswerForm } from '@/components/answers/answer-form';
import { useAuth } from '@/contexts/auth-context';
import { useQuestionDetail } from '@/hooks/use-question-detail';
import { Skeleton } from '@/components/ui/skeleton';


export function QuestionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const {
    question,
    answers,
    loading,
    error,
    refetch,
    createAnswer,
    acceptAnswer,
    voteOnAnswer,
    voteOnQuestion
  } = useQuestionDetail(id!);

  const isQuestionOwner = user?.id === question?.author_id;

  const handleQuestionVote = (direction: 'up' | 'down') => {
    voteOnQuestion(direction);
  };

  const handleAcceptAnswer = (answerId: string) => {
    acceptAnswer(answerId);
  };

  const handleAnswerVote = (answerId: string, direction: 'up' | 'down') => {
    voteOnAnswer(answerId, direction);
  };

  const handleAnswerSubmitted = async (content: string) => {
    await createAnswer(content);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-destructive mb-4">Failed to load question</p>
        <Button onClick={refetch}>Try Again</Button>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Question */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{question.title}</CardTitle>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>Asked {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}</span>
                <span>Viewed {question.views} times</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            {/* Voting */}
            <div className="flex flex-col items-center space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuestionVote('up')}
              >
                <ArrowUp className="h-6 w-6" />
              </Button>
              <span className="font-bold text-xl">{question.votes}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuestionVote('down')}
              >
                <ArrowDown className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="sm" title="Bookmark">
                <Bookmark className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="prose dark:prose-invert max-w-none mb-6">
                {question.description.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {question.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Flag className="h-4 w-4 mr-1" />
                    Flag
                  </Button>
                </div>

                <div className="text-sm">
                  <div className="text-muted-foreground">asked by</div>
                  <div className="font-medium">{question.author?.username}</div>
                  <div className="text-xs text-muted-foreground">
                    {question.author?.reputation} reputation
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Answers */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {answers.length} Answer{answers.length !== 1 ? 's' : ''}
          </h2>
        </div>

        {answers.map((answer) => (
          <AnswerCard
            key={answer.id}
            answer={{
              id: answer.id,
              content: answer.content,
              author: answer.author || { username: 'Unknown', reputation: 0 },
              createdAt: new Date(answer.created_at),
              votes: answer.votes,
              isAccepted: answer.is_accepted,
              comments: 0 // TODO: Implement comments
            }}
            isQuestionOwner={isQuestionOwner}
            onAccept={handleAcceptAnswer}
            onVote={handleAnswerVote}
          />
        ))}
      </div>

      {/* Answer Form */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your Answer</h3>
        <AnswerForm questionId={id!} onAnswerSubmitted={handleAnswerSubmitted} />
      </div>
    </div>
  );
}