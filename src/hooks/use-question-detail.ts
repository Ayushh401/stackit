import { useState, useEffect } from 'react';
import { supabase, Question, Answer } from '@/lib/supabase';
import { toast } from 'sonner';

export function useQuestionDetail(questionId: string) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestionDetail = async () => {
    try {
      setLoading(true);
      
      // Fetch question with author details and tags
      const { data: questionData, error: questionError } = await supabase
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
          )
        `)
        .eq('id', questionId)
        .single();

      if (questionError) throw questionError;

      // Fetch answers with author details
      const { data: answersData, error: answersError } = await supabase
        .from('answers')
        .select(`
          *,
          profiles:author_id (
            username,
            reputation,
            avatar_url
          )
        `)
        .eq('question_id', questionId)
        .order('is_accepted', { ascending: false })
        .order('votes', { ascending: false })
        .order('created_at', { ascending: true });

      if (answersError) throw answersError;

      // Format question data
      const formattedQuestion = {
        ...questionData,
        tags: questionData.question_tags?.map(tag => tag.tag) || [],
        author: questionData.profiles ? {
          username: questionData.profiles.username,
          reputation: questionData.profiles.reputation,
          avatar_url: questionData.profiles.avatar_url
        } : null
      };

      // Format answers data
      const formattedAnswers = answersData?.map(answer => ({
        ...answer,
        author: answer.profiles ? {
          username: answer.profiles.username,
          reputation: answer.profiles.reputation,
          avatar_url: answer.profiles.avatar_url
        } : null
      })) || [];

      setQuestion(formattedQuestion);
      setAnswers(formattedAnswers);

      // Increment view count
      await supabase.rpc('increment_question_views', { question_id: questionId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch question');
      toast.error('Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const createAnswer = async (content: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: answer, error } = await supabase
        .from('answers')
        .insert({
          question_id: questionId,
          content,
          author_id: user.id
        })
        .select(`
          *,
          profiles:author_id (
            username,
            reputation,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      const formattedAnswer = {
        ...answer,
        author: answer.profiles ? {
          username: answer.profiles.username,
          reputation: answer.profiles.reputation,
          avatar_url: answer.profiles.avatar_url
        } : null
      };

      setAnswers(prev => [...prev, formattedAnswer]);
      toast.success('Answer posted successfully!');

      // Create notification for question author
      if (question && question.author_id !== user.id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: question.author_id,
            type: 'answer',
            title: 'New Answer',
            message: `${answer.profiles?.username} answered your question`,
            question_id: questionId
          });
      }

      return answer;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to post answer';
      toast.error(message);
      throw err;
    }
  };

  const acceptAnswer = async (answerId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First, unaccept all other answers for this question
      await supabase
        .from('answers')
        .update({ is_accepted: false })
        .eq('question_id', questionId);

      // Then accept the selected answer
      const { error } = await supabase
        .from('answers')
        .update({ is_accepted: true })
        .eq('id', answerId);

      if (error) throw error;

      // Update local state
      setAnswers(prev => prev.map(answer => ({
        ...answer,
        is_accepted: answer.id === answerId
      })));

      toast.success('Answer accepted!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to accept answer';
      toast.error(message);
    }
  };

  const voteOnAnswer = async (answerId: string, voteType: 'up' | 'down') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('votes')
        .select('*')
        .eq('user_id', user.id)
        .eq('target_id', answerId)
        .eq('target_type', 'answer')
        .single();

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote if same type
          await supabase
            .from('votes')
            .delete()
            .eq('id', existingVote.id);
        } else {
          // Update vote type
          await supabase
            .from('votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id);
        }
      } else {
        // Create new vote
        await supabase
          .from('votes')
          .insert({
            user_id: user.id,
            target_id: answerId,
            target_type: 'answer',
            vote_type: voteType
          });
      }

      // Refresh answers to get updated vote counts
      await fetchQuestionDetail();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to vote';
      toast.error(message);
    }
  };

  const voteOnQuestion = async (voteType: 'up' | 'down') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('votes')
        .select('*')
        .eq('user_id', user.id)
        .eq('target_id', questionId)
        .eq('target_type', 'question')
        .single();

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote if same type
          await supabase
            .from('votes')
            .delete()
            .eq('id', existingVote.id);
        } else {
          // Update vote type
          await supabase
            .from('votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id);
        }
      } else {
        // Create new vote
        await supabase
          .from('votes')
          .insert({
            user_id: user.id,
            target_id: questionId,
            target_type: 'question',
            vote_type: voteType
          });
      }

      // Refresh question to get updated vote count
      await fetchQuestionDetail();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to vote';
      toast.error(message);
    }
  };

  useEffect(() => {
    if (questionId) {
      fetchQuestionDetail();
    }
  }, [questionId]);

  return {
    question,
    answers,
    loading,
    error,
    refetch: fetchQuestionDetail,
    createAnswer,
    acceptAnswer,
    voteOnAnswer,
    voteOnQuestion
  };
}