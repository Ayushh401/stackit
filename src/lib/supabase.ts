import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Profile {
  id: string;
  username: string;
  reputation: number;
  role: 'guest' | 'user' | 'admin';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  author_id: string;
  votes: number;
  views: number;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  question_tags?: QuestionTag[];
  answers?: Answer[];
}

export interface QuestionTag {
  id: string;
  question_id: string;
  tag: string;
  created_at: string;
}

export interface Answer {
  id: string;
  question_id: string;
  content: string;
  author_id: string;
  votes: number;
  is_accepted: boolean;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface Vote {
  id: string;
  user_id: string;
  target_id: string;
  target_type: 'question' | 'answer';
  vote_type: 'up' | 'down';
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'answer' | 'comment' | 'mention' | 'system';
  title: string;
  message: string;
  read: boolean;
  question_id?: string;
  created_at: string;
}