import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Check, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export interface Answer {
  id: string;
  content: string;
  author: {
    username: string;
    reputation: number;
  };
  createdAt: Date;
  votes: number;
  isAccepted: boolean;
  comments: number;
}

interface AnswerCardProps {
  answer: Answer;
  isQuestionOwner: boolean;
  onAccept: (answerId: string) => void;
  onVote: (answerId: string, direction: 'up' | 'down') => void;
}

export function AnswerCard({ answer, isQuestionOwner, onAccept, onVote }: AnswerCardProps) {
  const { isAuthenticated } = useAuth();
  const [hasVoted, setHasVoted] = useState<'up' | 'down' | null>(null);

  const handleVote = (direction: 'up' | 'down') => {
    if (!isAuthenticated) return;
    
    if (hasVoted === direction) {
      setHasVoted(null);
    } else {
      setHasVoted(direction);
      onVote(answer.id, direction);
    }
  };

  return (
    <Card className={`${answer.isAccepted ? 'border-green-200 bg-green-50/50 dark:bg-green-950/20' : ''}`}>
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Voting */}
          <div className="flex flex-col items-center space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote('up')}
              disabled={!isAuthenticated}
              className={hasVoted === 'up' ? 'text-orange-500' : ''}
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
            <span className="font-semibold text-lg">{answer.votes}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote('down')}
              disabled={!isAuthenticated}
              className={hasVoted === 'down' ? 'text-orange-500' : ''}
            >
              <ArrowDown className="h-5 w-5" />
            </Button>
            
            {isQuestionOwner && !answer.isAccepted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAccept(answer.id)}
                className="text-green-600 hover:text-green-700"
                title="Accept this answer"
              >
                <Check className="h-5 w-5" />
              </Button>
            )}
            
            {answer.isAccepted && (
              <div className="text-green-600" title="Accepted answer">
                <Check className="h-5 w-5 fill-current" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="prose dark:prose-invert max-w-none">
              {answer.content.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-6 py-3 bg-muted/30 border-t">
        <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <MessageSquare className="h-4 w-4 mr-1" />
              {answer.comments} comments
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <span>answered by</span>
            <span className="font-medium text-foreground">{answer.author.username}</span>
            <span className="text-xs">({answer.author.reputation} rep)</span>
            <span>{formatDistanceToNow(answer.createdAt, { addSuffix: true })}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}