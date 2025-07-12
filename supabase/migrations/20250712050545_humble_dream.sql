/*
  # Add function to increment question views

  1. Functions
    - `increment_question_views` - Safely increment view count for a question
*/

CREATE OR REPLACE FUNCTION increment_question_views(question_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE questions 
  SET views = views + 1 
  WHERE id = question_id;
END;
$$ LANGUAGE plpgsql;