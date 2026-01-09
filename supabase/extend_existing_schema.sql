-- ============================================================================
-- VALSENT EXAM SYSTEM - MIGRATION TO EXTEND EXISTING SCHEMA
-- This extends your current mocks/attempts tables to support save/resume
-- ============================================================================

-- ============================================================================
-- 1. EXTEND MOCKS TABLE
-- Add missing columns for full exam functionality
-- ============================================================================

DO $$ 
BEGIN
  -- Add total_questions column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'mocks' 
      AND column_name = 'total_questions'
  ) THEN
    ALTER TABLE public.mocks ADD COLUMN total_questions integer DEFAULT 0 NOT NULL;
  END IF;

  -- Add difficulty column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'mocks' 
      AND column_name = 'difficulty'
  ) THEN
    ALTER TABLE public.mocks ADD COLUMN difficulty text DEFAULT 'medium' 
      CHECK (difficulty IN ('easy', 'medium', 'hard'));
  END IF;

  -- Add is_trial flag
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'mocks' 
      AND column_name = 'is_trial'
  ) THEN
    ALTER TABLE public.mocks ADD COLUMN is_trial boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- ============================================================================
-- 2. EXTEND ATTEMPTS TABLE
-- Add save/resume/pause functionality
-- ============================================================================

DO $$ 
BEGIN
  -- Add status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'attempts' 
      AND column_name = 'status'
  ) THEN
    ALTER TABLE public.attempts ADD COLUMN status text DEFAULT 'in_progress' 
      CHECK (status IN ('in_progress', 'paused', 'submitted', 'timed_out'));
  END IF;

  -- Add current_section column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'attempts' 
      AND column_name = 'current_section'
  ) THEN
    ALTER TABLE public.attempts ADD COLUMN current_section text;
  END IF;

  -- Add current_question_index column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'attempts' 
      AND column_name = 'current_question_index'
  ) THEN
    ALTER TABLE public.attempts ADD COLUMN current_question_index int DEFAULT 0;
  END IF;

  -- Add last_saved_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'attempts' 
      AND column_name = 'last_saved_at'
  ) THEN
    ALTER TABLE public.attempts ADD COLUMN last_saved_at timestamptz DEFAULT now() NOT NULL;
  END IF;

  -- Add elapsed_seconds column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'attempts' 
      AND column_name = 'elapsed_seconds'
  ) THEN
    ALTER TABLE public.attempts ADD COLUMN elapsed_seconds int DEFAULT 0 NOT NULL;
  END IF;

  -- Add remaining_seconds column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'attempts' 
      AND column_name = 'remaining_seconds'
  ) THEN
    ALTER TABLE public.attempts ADD COLUMN remaining_seconds int;
  END IF;

  -- Add total_seconds column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'attempts' 
      AND column_name = 'total_seconds'
  ) THEN
    ALTER TABLE public.attempts ADD COLUMN total_seconds int;
  END IF;

  -- Add section_locked column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'attempts' 
      AND column_name = 'section_locked'
  ) THEN
    ALTER TABLE public.attempts ADD COLUMN section_locked jsonb DEFAULT '{}'::jsonb NOT NULL;
  END IF;

  -- Add section_scores column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'attempts' 
      AND column_name = 'section_scores'
  ) THEN
    ALTER TABLE public.attempts ADD COLUMN section_scores jsonb;
  END IF;
END $$;

-- Update existing attempts to have default status if NULL
UPDATE public.attempts SET status = 'submitted' WHERE status IS NULL AND finished_at IS NOT NULL;
UPDATE public.attempts SET status = 'in_progress' WHERE status IS NULL AND finished_at IS NULL;

-- ============================================================================
-- 3. ADD INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_attempts_status ON public.attempts(status);
CREATE INDEX IF NOT EXISTS idx_attempts_user_status 
  ON public.attempts(user_id, status) 
  WHERE status IN ('in_progress', 'paused');
CREATE INDEX IF NOT EXISTS idx_mocks_is_trial ON public.mocks(is_trial);

-- ============================================================================
-- 4. CREATE PROFILES TABLE (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  trial_used boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE INDEX IF NOT EXISTS idx_profiles_trial_used ON public.profiles(trial_used);

-- ============================================================================
-- 5. HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user can start trial
CREATE OR REPLACE FUNCTION can_start_trial(user_id_param uuid)
RETURNS boolean AS $$
DECLARE
  trial_used_flag boolean;
BEGIN
  SELECT trial_used INTO trial_used_flag
  FROM public.profiles
  WHERE id = user_id_param;
  
  RETURN COALESCE(trial_used_flag, false) = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate score (adapted for mocks table)
CREATE OR REPLACE FUNCTION calculate_attempt_score(attempt_id_param uuid)
RETURNS jsonb AS $$
DECLARE
  attempt_record record;
  total_score numeric := 0;
  total_questions int := 0;
  correct_answers int := 0;
BEGIN
  -- Get attempt data
  SELECT * INTO attempt_record
  FROM public.attempts
  WHERE id = attempt_id_param;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Attempt not found');
  END IF;
  
  -- Get all questions for this mock
  SELECT COUNT(*) INTO total_questions
  FROM public.questions
  WHERE mock_id = attempt_record.mock_id;
  
  -- Count correct answers
  -- Assuming answers is JSONB object like {"question_id": "answer"}
  SELECT COUNT(*) INTO correct_answers
  FROM public.questions q
  WHERE q.mock_id = attempt_record.mock_id
    AND (attempt_record.answers->>q.id::text) = q.correct_answer;
  
  total_score := correct_answers;
  
  -- Update attempt with score
  UPDATE public.attempts
  SET score = total_score
  WHERE id = attempt_id_param;
  
  RETURN jsonb_build_object(
    'totalScore', total_score,
    'totalQuestions', total_questions,
    'correctAnswers', correct_answers,
    'percentage', ROUND((total_score::numeric / NULLIF(total_questions, 0)::numeric) * 100, 2)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. TRIAL ENFORCEMENT
-- ============================================================================

-- Note: Trial enforcement is handled at the application level by:
-- 1. Checking profiles.trial_used before creating attempt
-- 2. Setting profiles.trial_used = true after trial exam is submitted
-- 
-- This is more flexible than a database constraint and allows for:
-- - Grace period for incomplete attempts
-- - Admin overrides if needed
-- - Better error messaging to users
--
-- The can_start_trial() function above should be called before allowing
-- a user to start a trial exam.

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

/*
NEXT STEPS:
1. This migration is now complete
2. Your existing data is preserved
3. New columns have been added to support save/resume
4. Run the data seeding script next to add trial exam

TO VERIFY:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'attempts' 
ORDER BY ordinal_position;
*/
