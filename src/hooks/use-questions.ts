import { useState, useEffect } from 'react';
import { supabase, Question } from '@/lib/supabase';
import { toast } from 'sonner';

export function useQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          profiles:author_id (
            username,
            reputation,
            avatar_url
          ),
          question_tags (
            tag
          ),
          answers (
            id,
            is_accepted
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedQuestions = data?.map(question => ({
        ...question,
        tags: question.question_tags?.map(tag => tag.tag) || [],
        answerCount: question.answers?.length || 0,
        hasAcceptedAnswer: question.answers?.some(answer => answer.is_accepted) || false,
        author: question.profiles ? {
          username: question.profiles.username,
          reputation: question.profiles.reputation,
          avatar_url: question.profiles.avatar_url
        } : null
      })) || [];

      setQuestions(formattedQuestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch questions');
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const createQuestion = async (questionData: {
    title: string;
    description: string;
    tags: string[];
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Insert question
      const { data: question, error: questionError } = await supabase
        .from('questions')
        .insert({
          title: questionData.title,
          description: questionData.description,
          author_id: user.id
        })
        .select()
        .single();

      if (questionError) throw questionError;

      // Insert tags
      if (questionData.tags.length > 0) {
        const tagInserts = questionData.tags.map(tag => ({
          question_id: question.id,
          tag: tag.toLowerCase()
        }));

        const { error: tagsError } = await supabase
          .from('question_tags')
          .insert(tagInserts);

        if (tagsError) throw tagsError;
      }

      toast.success('Question posted successfully!');
      await fetchQuestions(); // Refresh the list
      return question;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create question';
      toast.error(message);
      throw err;
    }
  };

  const incrementViews = async (questionId: string) => {
    try {
      await supabase.rpc('increment_question_views', { question_id: questionId });
    } catch (err) {
      console.error('Failed to increment views:', err);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  return {
    questions,
    loading,
    error,
    refetch: fetchQuestions,
    createQuestion,
    incrementViews
  };
}