const fs = require('fs');
const path = require('path');

const mathPath = path.join(__dirname, '../cs_papers_json/bcs_math_11.json');
const engPath = path.join(__dirname, '../cs_papers_json/bcs_eng_11.json');
const outputPath = path.join(__dirname, '../supabase/bcs_mock_11_generated.sql');

try {
    const mathQuestions = JSON.parse(fs.readFileSync(mathPath, 'utf8'));
    const engQuestions = JSON.parse(fs.readFileSync(engPath, 'utf8'));

    // Determine counts
    const totalQuestions = mathQuestions.length + engQuestions.length;

    let sql = `-- BCS Mock Exam Migration\n`;
    sql += `-- Generated on ${new Date().toISOString()}\n\n`;

    sql += `DO $$\n`;
    sql += `DECLARE\n`;
    sql += `  mock_uuid uuid;\n`;
    sql += `BEGIN\n`;
    sql += `  -- 1. Create Mock\n`;
    sql += `  INSERT INTO public.mocks (title, duration_minutes, total_questions, difficulty, is_trial, created_at)\n`;
    sql += `  VALUES (\n`;
    sql += `    'BCS Mock Exam 11',  -- <== USER TO EDIT THIS TITLE\n`;
    sql += `    165, -- Assumed duration, adjust if needed\n`;
    sql += `    ${totalQuestions},\n`;
    sql += `    'medium', -- Default difficulty\n`;
    sql += `    false, -- A trial exam\n`;
    sql += `    now()\n`;
    sql += `  )\n`;
    sql += `  RETURNING id INTO mock_uuid;\n\n`;

    sql += `  -- 2. Insert Math Questions\n`;
    mathQuestions.forEach(q => {
        const questionText = q.question.replace(/'/g, "''"); // Escape single quotes
        const choices = JSON.stringify(q.options).replace(/'/g, "''");
        const correctAnswer = q.answer.replace(/'/g, "''");

        sql += `    INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer, section, created_at)\n`;
        sql += `    VALUES (mock_uuid, 'bcs', '${questionText}', '${choices}'::jsonb, '${correctAnswer}', 'Mathematics', now());\n\n`;
    });

    sql += `  -- 3. Insert English Questions\n`;
    engQuestions.forEach(q => {
        const questionText = q.question.replace(/'/g, "''");
        const choices = JSON.stringify(q.options).replace(/'/g, "''");
        const correctAnswer = q.answer.replace(/'/g, "''");

        sql += `    INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer, section, created_at)\n`;
        sql += `    VALUES (mock_uuid, 'bcs', '${questionText}', '${choices}'::jsonb, '${correctAnswer}', 'English', now());\n\n`;
    });

    sql += `END $$;\n`;

    fs.writeFileSync(outputPath, sql);
    console.log(`Successfully generated SQL at ${outputPath}`);

} catch (err) {
    console.error('Error generating SQL:', err);
}