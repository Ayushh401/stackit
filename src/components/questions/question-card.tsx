import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ArrowUp, ArrowDown, MessageSquare, Check } from 'lucide-react';

export interface Question {
  id: string;
  title: string;
  description: string;
  tags: string[];
  author: {
    username: string;
    reputation: number;
  };
  createdAt: Date;
  votes: number;
  answers: number;
  hasAcceptedAnswer: boolean;
  views: number;
}

interface QuestionCardProps {
  question: Question;
}

export function QuestionCard({ question }: QuestionCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Stats */}
          <div className="flex flex-col items-center space-y-2 text-sm text-muted-foreground min-w-[60px]">
            <div className="flex items-center space-x-1">
              <ArrowUp className="h-4 w-4" />
              <span>{question.votes}</span>
            </div>
            <div className={`flex items-center space-x-1 ${question.hasAcceptedAnswer ? 'text-green-600' : ''}`}>
              {question.hasAcceptedAnswer && <Check className="h-4 w-4" />}
              <span>{question.answers}</span>
            </div>
            <div className="text-xs">{question.views} views</div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <Link
              to={`/question/${question.id}`}
              className="text-lg font-semibold text-primary hover:underline"
            >
              {question.title}
            </Link>
            <p className="text-muted-foreground mt-2 line-clamp-2">
              {question.description.replace(/[#*`]/g, '').substring(0, 150)}...
            </p>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-3">
              {question.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-6 py-3 bg-muted/30 border-t">
        <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <span>asked by</span>
            <span className="font-medium text-foreground">{question.author.username}</span>
            <span className="text-xs">({question.author.reputation} rep)</span>
          </div>
          <span>{formatDistanceToNow(question.createdAt, { addSuffix: true })}</span>
        </div>
      </CardFooter>
    </Card>
  );
}