# Exam System Migration Documentation

## Overview
This migration safely extends your existing Supabase schema to support a complete exam save/resume/submit workflow without destroying any existing data.

## Files Created
1. **`supabase/exam_system_migration.sql`** - Complete schema migration with RLS policies
2. **`supabase/trial_exam_data.sql`** - BBA Mathematics trial exam data (45 questions)

---

## 1. How to Import the JSON Exam Data

The trial exam JSON has been converted and embedded in `trial_exam_data.sql`. The exam metadata is stored as JSONB with this structure:

```json
{
  "totalQuestions": 45,
  "totalMarks": 45,
  "passingMarks": 27,
  "sections": [
    {
      "id": "mathematics",
      "title": "Mathematics",
      "questions": [
        {
          "id": "q1",
          "topic": "Simplification",
          "text": "Question text...",
          "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
          "correctAnswer": 2,  // Array index (0-based)
          "marks": 1
        }
      ]
    }
  ]
}
```

**To import:**
1. Run `exam_system_migration.sql` first
2. Run `trial_exam_data.sql` second
3. The INSERT uses `ON CONFLICT DO UPDATE` so it's safe to run multiple times

---

## 2. Answers JSON Structure

User answers are stored in `attempts.answers` as a JSONB array:

```json
[
  {
    "questionId": "q1",
    "sectionId": "mathematics",
    "selectedOption": 2,
    "answeredAt": "2024-01-09T10:30:00Z"
  },
  {
    "questionId": "q2",
    "sectionId": "mathematics",
    "selectedOption": 1,
    "answeredAt": "2024-01-09T10:31:15Z"
  }
]
```

**Client-side updates:**
```typescript
// Add/update an answer
const newAnswer = {
  questionId: "q5",
  sectionId: "mathematics",
  selectedOption: 3,
  answeredAt: new Date().toISOString()
};

// Remove existing answer for this question and add new one
const updatedAnswers = [
  ...answers.filter(a => a.questionId !== newAnswer.questionId),
  newAnswer
];

await supabase
  .from('attempts')
  .update({ 
    answers: updatedAnswers,
    last_saved_at: new Date().toISOString()
  })
  .eq('id', attemptId);
```

---

## 3. Server-Side Scoring

A PostgreSQL function `calculate_attempt_score(attempt_id)` is included in the migration. It:

1. Fetches the attempt and exam metadata
2. Loops through all sections and questions
3. Compares user answers with correct answers
4. Calculates section scores and total score
5. Updates the attempt record

**Usage:**
```sql
-- After user submits exam
UPDATE attempts 
SET status = 'submitted', finished_at = now()
WHERE id = 'attempt-uuid';

-- Calculate and store score
SELECT calculate_attempt_score('attempt-uuid');

-- Result:
{
  "totalScore": 38,
  "sectionScores": {
    "mathematics": 38
  }
}
```

**Application-level alternative** (TypeScript):
```typescript
function calculateScore(answers: Answer[], examMetadata: ExamMetadata) {
  let totalScore = 0;
  const sectionScores: Record<string, number> = {};

  examMetadata.sections.forEach(section => {
    let sectionScore = 0;
    
    section.questions.forEach(question => {
      const userAnswer = answers.find(a => a.questionId === question.id);
      
      if (userAnswer && 
          userAnswer.selectedOption === question.correctAnswer) {
        sectionScore += question.marks;
        totalScore += question.marks;
      }
    });
    
    sectionScores[section.id] = sectionScore;
  });

  return { totalScore, sectionScores };
}
```

---

## 4. Enforcing One Free Trial Per User

### Option A: Application-Level (Recommended for Flexibility)

**Before starting trial:**
```sql
SELECT trial_used FROM profiles WHERE id = auth.uid();
```

**After trial attempt created:**
```sql
UPDATE profiles SET trial_used = true WHERE id = auth.uid();
```

**Helper function** (included in migration):
```sql
SELECT can_start_trial(auth.uid());
-- Returns: true or false
```

**TypeScript client:**
```typescript
async function canStartTrial(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('profiles')
    .select('trial_used')
    .eq('id', userId)
    .single();
  
  return !data?.trial_used;
}

// Before creating attempt
if (!await canStartTrial(user.id)) {
  throw new Error('Trial already used');
}

// Create attempt
const { data: attempt } = await supabase
  .from('attempts')
  .insert({
    user_id: user.id,
    exam_external_id: 'trial-001',
    total_seconds: 3600,
    remaining_seconds: 3600
  })
  .select()
  .single();

// Mark trial as used
await supabase
  .from('profiles')
  .update({ trial_used: true })
  .eq('id', user.id);
```

---

### Option B: Database-Level (Strict Enforcement)

**Partial unique index** (included in migration):
```sql
CREATE UNIQUE INDEX idx_one_trial_per_user
  ON attempts(user_id)
  WHERE exam_external_id = 'trial-001' 
    AND status IN ('in_progress', 'paused', 'submitted');
```

This ensures:
- Only ONE non-failed trial attempt per user
- Automatically enforced by PostgreSQL
- Prevents race conditions

**Note:** `timed_out` attempts are excluded, allowing users to retry if they abandoned the trial.

---

## 5. Workflow Examples

### Starting an Exam
```sql
INSERT INTO attempts (
  user_id,
  exam_external_id,
  total_seconds,
  remaining_seconds,
  status
)
VALUES (
  auth.uid(),
  'trial-001',
  3600,
  3600,
  'in_progress'
)
RETURNING *;
```

### Auto-Save Progress (Every 30 seconds)
```sql
UPDATE attempts
SET 
  answers = $1::jsonb,  -- Updated answers array
  current_question_index = $2,
  elapsed_seconds = $3,
  remaining_seconds = $4,
  last_saved_at = now()
WHERE id = $5 AND user_id = auth.uid();
```

### Pausing the Exam
```sql
UPDATE attempts
SET status = 'paused'
WHERE id = $1 AND user_id = auth.uid();
```

### Resuming the Exam
```sql
UPDATE attempts
SET status = 'in_progress'
WHERE id = $1 AND user_id = auth.uid();
```

### Locking a Section
```sql
UPDATE attempts
SET section_locked = jsonb_set(
  section_locked,
  '{mathematics}'::text[],
  'true'::jsonb
)
WHERE id = $1 AND user_id = auth.uid();
```

### Submitting the Exam
```sql
-- Step 1: Mark as submitted
UPDATE attempts
SET 
  status = 'submitted',
  finished_at = now()
WHERE id = $1 AND user_id = auth.uid();

-- Step 2: Calculate score
SELECT calculate_attempt_score($1);

-- Step 3: Mark trial as used (if trial exam)
UPDATE profiles
SET trial_used = true
WHERE id = auth.uid();
```

---

## 6. Safety Notes

### ✅ Safe Operations
- All DDL uses `IF NOT EXISTS` - can run multiple times
- `ALTER TABLE ADD COLUMN` wrapped in DO blocks with existence checks
- No `DROP TABLE` or `DROP COLUMN` commands
- Indexes created with `IF NOT EXISTS`
- Policies dropped and recreated to ensure correct definitions

### ⚠️ Important Considerations

1. **Existing Data Preserved**: All existing columns and rows remain untouched

2. **NULL Handling**: New columns on existing rows will be NULL:
   - `profiles.trial_used` defaults to `false` for new rows
   - Existing rows need: `UPDATE profiles SET trial_used = false WHERE trial_used IS NULL;`

3. **Migration Order**:
   - Run `exam_system_migration.sql` FIRST
   - Run `trial_exam_data.sql` SECOND
   - Optional: Run cleanup queries if needed

4. **RLS Policies**: Ensure your Supabase project has RLS enabled globally

---

## 7. Next Steps

### Immediate (Required)
1. ✅ Run `exam_system_migration.sql` in Supabase SQL Editor
2. ✅ Run `trial_exam_data.sql` to insert trial exam
3. ✅ Verify: `SELECT * FROM exams WHERE external_id = 'trial-001';`
4. ✅ Test creating an attempt as a logged-in user

### Application Integration
5. Update your frontend to:
   - Check trial availability before showing "Start Trial" CTA
   - Create attempt on exam start
   - Auto-save progress every 30 seconds
   - Support pause/resume
   - Handle submission and scoring
   - Display results with section breakdown

### Optional Enhancements
6. Add more exams to `exams` table
7. Implement section navigation
8. Add analytics views (user performance over time)
9. Create admin functions for manual scoring adjustments

---

## 8. Testing Checklist

```sql
-- Test 1: Can create trial attempt?
INSERT INTO attempts (user_id, exam_external_id, total_seconds, remaining_seconds)
VALUES (auth.uid(), 'trial-001', 3600, 3600);

-- Test 2: Can save answers?
UPDATE attempts
SET answers = '[{"questionId":"q1","sectionId":"mathematics","selectedOption":2}]'::jsonb
WHERE user_id = auth.uid();

-- Test 3: Can submit and score?
UPDATE attempts SET status = 'submitted', finished_at = now()
WHERE user_id = auth.uid();

SELECT calculate_attempt_score(
  (SELECT id FROM attempts WHERE user_id = auth.uid() LIMIT 1)
);

-- Test 4: Trial enforcement working?
-- Try creating second trial attempt (should fail with Option B)

-- Test 5: Can resume paused attempt?
UPDATE attempts SET status = 'paused' WHERE user_id = auth.uid();
UPDATE attempts SET status = 'in_progress' WHERE user_id = auth.uid();
```

---

## Questions Structure Reference

The BBA Math exam includes 45 questions covering:
- Simplification (3 questions)
- Algebraic Identities (3 questions)
- Inequality and Modulus (3 questions)
- Surd and Indices (3 questions)
- Integers and Numbers (3 questions)
- Averages (3 questions)
- Fraction (3 questions)
- Percentage (3 questions)
- Ratio and Proportion (3 questions)
- Time, Speed and Distance (3 questions)
- Work and Time (3 questions)
- Word Problems (3 questions)
- Probability (3 questions)
- Problem on Numbers (3 questions)
- Mean, Median, Mode (2 questions)
- Combination (1 question)

Total: 45 questions × 1 mark = 45 marks
Duration: 60 minutes (3600 seconds)
Passing: 27 marks (60%)
