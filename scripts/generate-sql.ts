
import fs from 'fs';

const mathData = JSON.parse(fs.readFileSync('c:/Users/afnan/OneDrive/Desktop/valsent/bba_math_1.json', 'utf8'));
const engData = JSON.parse(fs.readFileSync('c:/Users/afnan/OneDrive/Desktop/valsent/bba_eng_1.json', 'utf8'));

const mockId = '11111111-1111-1111-1111-111111111111'; // Placeholder or known ID

const output = [];
output.push(`-- VALSENT TRIAL MOCK EXAM SEED DATA`);
output.push(`-- Mock ID: ${mockId}`);

output.push(`\n-- 0. Update Schema Constraints`);
output.push(`-- Allow 'math' and 'eng' types in questions table`);
output.push(`ALTER TABLE public.questions DROP CONSTRAINT IF EXISTS questions_type_check;`);
output.push(`ALTER TABLE public.questions ADD CONSTRAINT questions_type_check CHECK (type IN ('mcq', 'text', 'math', 'eng'));`);

output.push(`\n-- 1. Cleanup & Insert Mock`);
output.push(`DELETE FROM public.questions WHERE mock_id = '${mockId}';`);

output.push(`INSERT INTO public.mocks (id, title, description, duration_minutes, total_questions, difficulty, is_trial)`);
output.push(`VALUES ('${mockId}', 'BBA Trial Mock Exam', 'A comprehensive trial mock exam for BBA preparation.', 165, 90, 'medium', true)`);
output.push(`ON CONFLICT (id) DO UPDATE SET total_questions = 90, title = 'BBA Trial Mock Exam';`);

output.push(`\n-- 2. Insert Questions (Math)`);
mathData.forEach((q, idx) => {
    const choices = JSON.stringify(q.options);
    const text = q.question.replace(/'/g, "''");
    const answer = q.answer.replace(/'/g, "''");
    output.push(`INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('${mockId}', '${q.type}', '${text}', '${choices}'::jsonb, '${answer}');`);
});

output.push(`\n-- 3. Insert Questions (English)`);
engData.forEach((q, idx) => {
    const choices = JSON.stringify(q.options);
    const text = q.question.replace(/'/g, "''");
    const answer = q.answer.replace(/'/g, "''");
    output.push(`INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('${mockId}', '${q.type}', '${text}', '${choices}'::jsonb, '${answer}');`);
});

fs.writeFileSync('c:/Users/afnan/OneDrive/Desktop/valsent/scripts/seed_trial.sql', output.join('\n'), 'utf8');
console.log('SQL file generated: scripts/seed_trial.sql');

