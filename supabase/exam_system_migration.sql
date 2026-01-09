-- ============================================================================
-- VALSENT EXAM SYSTEM - SAFE MIGRATION
-- This migration extends the existing schema to support exam save/resume/submit
-- All statements are idempotent and safe to run on existing databases
-- ============================================================================

-- Enable UUID extension (safe if already exists)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. EXAMS TABLE
-- Stores exam metadata including questions and answers as JSONB
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.exams (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  external_id text UNIQUE NOT NULL,
  title text NOT NULL,
  duration_seconds int NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add index for fast lookups by external_id
CREATE INDEX IF NOT EXISTS idx_exams_external_id ON public.exams(external_id);

-- ============================================================================
-- 2. ATTEMPTS TABLE
-- Tracks user attempts with save/resume/submit capability
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.attempts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exam_external_id text NOT NULL,
  
  -- Status tracking
  status text NOT NULL DEFAULT 'in_progress' 
    CHECK (status IN ('in_progress', 'paused', 'submitted', 'timed_out')),
  
  -- Navigation state
  current_section text,
  current_question_index int DEFAULT 0,
  
  -- Time tracking
  started_at timestamptz DEFAULT now() NOT NULL,
  last_saved_at timestamptz DEFAULT now() NOT NULL,
  elapsed_seconds int DEFAULT 0 NOT NULL,
  remaining_seconds int,
  total_seconds int NOT NULL,
  
  -- Answers and section lock state
  answers jsonb DEFAULT '[]'::jsonb NOT NULL,
  section_locked jsonb DEFAULT '{}'::jsonb NOT NULL,
  
  -- Scoring (populated after submission)
  score numeric,
  section_scores jsonb,
  
  -- Completion tracking
  finished_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON public.attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_exam_external_id ON public.attempts(exam_external_id);
CREATE INDEX IF NOT EXISTS idx_attempts_created_at ON public.attempts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_attempts_status ON public.attempts(status);

-- Composite index for user's active attempts
CREATE INDEX IF NOT EXISTS idx_attempts_user_status 
  ON public.attempts(user_id, status) 
  WHERE status IN ('in_progress', 'paused');

-- ============================================================================
-- 3. PROFILES TABLE EXTENSION
-- Add trial_used flag (safe - won't fail if column already exists)
-- ============================================================================

-- Check if profiles table exists, create if not
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Add trial_used column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'trial_used'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN trial_used boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Index for quick trial checks
CREATE INDEX IF NOT EXISTS idx_profiles_trial_used ON public.profiles(trial_used);

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on exams
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

-- Exams are readable by everyone (for browsing)
DROP POLICY IF EXISTS "Exams are viewable by everyone" ON public.exams;
CREATE POLICY "Exams are viewable by everyone" 
  ON public.exams FOR SELECT 
  USING (true);

-- Enable RLS on attempts
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;

-- Users can view their own attempts
DROP POLICY IF EXISTS "Users can view own attempts" ON public.attempts;
CREATE POLICY "Users can view own attempts" 
  ON public.attempts FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can create their own attempts
DROP POLICY IF EXISTS "Users can create own attempts" ON public.attempts;
CREATE POLICY "Users can create own attempts" 
  ON public.attempts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own attempts (for save/resume)
DROP POLICY IF EXISTS "Users can update own attempts" ON public.attempts;
CREATE POLICY "Users can update own attempts" 
  ON public.attempts FOR UPDATE 
  USING (auth.uid() = user_id);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- ============================================================================
-- 5. INSERT TRIAL EXAM DATA
-- ============================================================================

INSERT INTO public.exams (external_id, title, duration_seconds, metadata)
VALUES (
  'trial-001',
  'BBA Mathematics Mock Test 1',
  3600, -- 60 minutes
  '{
    "sections": [
      {
        "id": "math",
        "title": "Mathematics",
        "questions": [
          {
            "id": "q1",
            "text": "What is the value of ∫(2x + 3)dx?",
            "type": "mcq",
            "options": [
              "x² + 3x + C",
              "2x² + 3x + C",
              "x² + 3x",
              "2x + 3x + C"
            ],
            "correctAnswer": 0,
            "marks": 1
          },
          {
            "id": "q2",
            "text": "Solve for x: 3x - 7 = 14",
            "type": "mcq",
            "options": [
              "x = 5",
              "x = 7",
              "x = 21",
              "x = 3"
            ],
            "correctAnswer": 1,
            "marks": 1
          },
          {
            "id": "q3",
            "text": "If f(x) = x² + 2x + 1, what is f(3)?",
            "type": "mcq",
            "options": [
              "12",
              "14",
              "16",
              "18"
            ],
            "correctAnswer": 2,
            "marks": 1
          },
          {
            "id": "q4",
            "text": "The slope of the line passing through (2,3) and (4,7) is:",
            "type": "mcq",
            "options": [
              "1",
              "2",
              "3",
              "4"
            ],
            "correctAnswer": 1,
            "marks": 1
          },
          {
            "id": "q5",
            "text": "What is the derivative of x³ + 2x² - 5x + 7?",
            "type": "mcq",
            "options": [
              "3x² + 4x - 5",
              "x³ + 2x² - 5",
              "3x² + 2x - 5",
              "3x² + 4x - 5x"
            ],
            "correctAnswer": 0,
            "marks": 1
          }
        ]
      }
    ],
    "totalMarks": 5,
    "passingMarks": 3
  }'::jsonb
)
ON CONFLICT (external_id) DO UPDATE
SET metadata = EXCLUDED.metadata,
    updated_at = now();

-- ============================================================================
-- 6. HELPER FUNCTIONS
-- ============================================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for exams table
DROP TRIGGER IF EXISTS update_exams_updated_at ON public.exams;
CREATE TRIGGER update_exams_updated_at
  BEFORE UPDATE ON public.exams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. SCORING FUNCTION (Server-side)
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_attempt_score(attempt_id_param uuid)
RETURNS jsonb AS $$
DECLARE
  attempt_record record;
  exam_metadata jsonb;
  total_score numeric := 0;
  section_scores_result jsonb := '{}'::jsonb;
  section record;
  question record;
  user_answer jsonb;
BEGIN
  -- Get attempt and exam data
  SELECT a.*, e.metadata 
  INTO attempt_record, exam_metadata
  FROM public.attempts a
  JOIN public.exams e ON e.external_id = a.exam_external_id
  WHERE a.id = attempt_id_param;
  
  -- Loop through sections
  FOR section IN 
    SELECT * FROM jsonb_array_elements(exam_metadata->'sections')
  LOOP
    DECLARE
      section_score numeric := 0;
      section_id text := section.value->>'id';
    BEGIN
      -- Loop through questions in section
      FOR question IN 
        SELECT * FROM jsonb_array_elements(section.value->'questions')
      LOOP
        DECLARE
          question_id text := question.value->>'id';
          correct_answer int := (question.value->>'correctAnswer')::int;
          marks numeric := (question.value->>'marks')::numeric;
        BEGIN
          -- Find user's answer
          SELECT answer INTO user_answer
          FROM jsonb_array_elements(attempt_record.answers) AS answer
          WHERE answer->>'questionId' = question_id;
          
          -- Check if answer is correct
          IF user_answer IS NOT NULL AND 
             (user_answer->>'selectedOption')::int = correct_answer THEN
            section_score := section_score + marks;
            total_score := total_score + marks;
          END IF;
        END;
      END LOOP;
      
      -- Store section score
      section_scores_result := jsonb_set(
        section_scores_result,
        ARRAY[section_id],
        to_jsonb(section_score)
      );
    END;
  END LOOP;
  
  -- Update attempt with scores
  UPDATE public.attempts
  SET score = total_score,
      section_scores = section_scores_result
  WHERE id = attempt_id_param;
  
  RETURN jsonb_build_object(
    'totalScore', total_score,
    'sectionScores', section_scores_result
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. TRIAL ENFORCEMENT OPTIONS
-- ============================================================================

-- OPTION A: Database-level constraint (Partial Unique Index)
-- Ensures one non-failed trial attempt per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_trial_per_user
  ON public.attempts(user_id)
  WHERE exam_external_id = 'trial-001' 
    AND status IN ('in_progress', 'paused', 'submitted');

-- OPTION B: Application-level check (preferred for flexibility)
-- Before creating a trial attempt, check:
-- SELECT trial_used FROM profiles WHERE id = auth.uid()
-- If false, proceed and set trial_used = true after creation

-- Helper function for app-level check
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

-- ============================================================================
-- SAFETY NOTES & RECOMMENDATIONS
-- ============================================================================

/*
SAFETY NOTES:
1. All DDL uses IF NOT EXISTS - safe to run multiple times
2. No DROP TABLE or DROP COLUMN commands - existing data preserved
3. ALTER TABLE uses DO blocks to check column existence first
4. Indexes are created with IF NOT EXISTS
5. Policies are dropped and recreated to ensure correct definition

ANSWER STRUCTURE (attempts.answers JSONB):
[
  {
    "questionId": "q1",
    "sectionId": "math",
    "selectedOption": 0,
    "answeredAt": "2024-01-09T10:30:00Z"
  },
  {
    "questionId": "q2",
    "sectionId": "math",
    "selectedOption": 1,
    "answeredAt": "2024-01-09T10:31:00Z"
  }
]

SECTION LOCKED STRUCTURE (attempts.section_locked JSONB):
{
  "math": true,
  "english": false
}

NEXT STEPS:
1. Run this migration in Supabase SQL Editor
2. Verify tables created: SELECT * FROM exams WHERE external_id = 'trial-001'
3. Test trial enforcement with: SELECT can_start_trial(auth.uid())
4. Create attempt: INSERT INTO attempts (user_id, exam_external_id, total_seconds)
5. Save progress: UPDATE attempts SET answers = [...], last_saved_at = now()
6. Submit: UPDATE attempts SET status = 'submitted', finished_at = now()
7. Score: SELECT calculate_attempt_score(attempt_id)

USAGE EXAMPLES:

-- Start an attempt
INSERT INTO public.attempts (
  user_id, 
  exam_external_id, 
  total_seconds, 
  remaining_seconds
)
VALUES (
  auth.uid(),
  'trial-001',
  3600,
  3600
)
RETURNING id;

-- Save progress (every 30 seconds or on answer change)
UPDATE public.attempts
SET 
  answers = '[{"questionId":"q1","sectionId":"math","selectedOption":0}]'::jsonb,
  current_question_index = 1,
  elapsed_seconds = 45,
  remaining_seconds = 3555,
  last_saved_at = now()
WHERE id = 'attempt-uuid';

-- Pause exam
UPDATE public.attempts
SET status = 'paused'
WHERE id = 'attempt-uuid' AND user_id = auth.uid();

-- Resume exam
UPDATE public.attempts
SET status = 'in_progress'
WHERE id = 'attempt-uuid' AND user_id = auth.uid();

-- Lock a section
UPDATE public.attempts
SET section_locked = jsonb_set(section_locked, '{math}', 'true')
WHERE id = 'attempt-uuid';

-- Submit exam
UPDATE public.attempts
SET 
  status = 'submitted',
  finished_at = now()
WHERE id = 'attempt-uuid' AND user_id = auth.uid();

-- Calculate score
SELECT calculate_attempt_score('attempt-uuid');

*/
