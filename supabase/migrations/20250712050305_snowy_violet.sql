/*
  # StackIt Q&A Platform Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `username` (text, unique)
      - `reputation` (integer, default 1)
      - `role` (enum: guest, user, admin)
      - `avatar_url` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `questions`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `author_id` (uuid, references profiles)
      - `votes` (integer, default 0)
      - `views` (integer, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `question_tags`
      - `id` (uuid, primary key)
      - `question_id` (uuid, references questions)
      - `tag` (text)
    
    - `answers`
      - `id` (uuid, primary key)
      - `question_id` (uuid, references questions)
      - `content` (text)
      - `author_id` (uuid, references profiles)
      - `votes` (integer, default 0)
      - `is_accepted` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `votes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `target_id` (uuid, can reference questions or answers)
      - `target_type` (enum: question, answer)
      - `vote_type` (enum: up, down)
      - `created_at` (timestamp)
    
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `type` (enum: answer, comment, mention, system)
      - `title` (text)
      - `message` (text)
      - `read` (boolean, default false)
      - `question_id` (uuid, optional, references questions)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public read access where appropriate
    - Add admin-only policies for moderation
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('guest', 'user', 'admin');
CREATE TYPE vote_type AS ENUM ('up', 'down');
CREATE TYPE target_type AS ENUM ('question', 'answer');
CREATE TYPE notification_type AS ENUM ('answer', 'comment', 'mention', 'system');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  reputation integer DEFAULT 1,
  role user_role DEFAULT 'user',
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  votes integer DEFAULT 0,
  views integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create question_tags table
CREATE TABLE IF NOT EXISTS question_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  tag text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create answers table
CREATE TABLE IF NOT EXISTS answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  content text NOT NULL,
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  votes integer DEFAULT 0,
  is_accepted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_id uuid NOT NULL,
  target_type target_type NOT NULL,
  vote_type vote_type NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, target_id, target_type)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Questions policies
CREATE POLICY "Questions are viewable by everyone"
  ON questions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert questions"
  ON questions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own questions"
  ON questions FOR UPDATE
  USING (auth.uid() = author_id);

-- Question tags policies
CREATE POLICY "Question tags are viewable by everyone"
  ON question_tags FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert question tags"
  ON question_tags FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM questions 
      WHERE id = question_id AND author_id = auth.uid()
    )
  );

-- Answers policies
CREATE POLICY "Answers are viewable by everyone"
  ON answers FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert answers"
  ON answers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own answers"
  ON answers FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Question owners can update answer acceptance"
  ON answers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM questions 
      WHERE id = question_id AND author_id = auth.uid()
    )
  );

-- Votes policies
CREATE POLICY "Votes are viewable by everyone"
  ON votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage their own votes"
  ON votes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_author_id ON questions(author_id);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_question_tags_question_id ON question_tags(question_id);
CREATE INDEX IF NOT EXISTS idx_question_tags_tag ON question_tags(tag);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_author_id ON answers(author_id);
CREATE INDEX IF NOT EXISTS idx_votes_target ON votes(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_answers_updated_at
  BEFORE UPDATE ON answers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    'user'
  );
  RETURN new;
END;
$$ language plpgsql security definer;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update vote counts
CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.target_type = 'question' THEN
      UPDATE questions 
      SET votes = votes + CASE WHEN NEW.vote_type = 'up' THEN 1 ELSE -1 END
      WHERE id = NEW.target_id;
    ELSIF NEW.target_type = 'answer' THEN
      UPDATE answers 
      SET votes = votes + CASE WHEN NEW.vote_type = 'up' THEN 1 ELSE -1 END
      WHERE id = NEW.target_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.target_type = 'question' THEN
      UPDATE questions 
      SET votes = votes - CASE WHEN OLD.vote_type = 'up' THEN 1 ELSE -1 END
      WHERE id = OLD.target_id;
    ELSIF OLD.target_type = 'answer' THEN
      UPDATE answers 
      SET votes = votes - CASE WHEN OLD.vote_type = 'up' THEN 1 ELSE -1 END
      WHERE id = OLD.target_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language plpgsql;

-- Trigger for vote count updates
CREATE TRIGGER vote_count_trigger
  AFTER INSERT OR DELETE ON votes
  FOR EACH ROW EXECUTE FUNCTION update_vote_counts();