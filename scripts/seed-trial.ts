
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

// Load env vars from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = require('dotenv').config({ path: envPath });

if (envConfig.error) {
    console.warn("Could not find .env.local, checking process.env");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Allow using service role key if available for bypassing RLS, otherwise anon
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
    console.log("Starting seed...");

    // 1. Read JSON files
    const mathPath = path.join(__dirname, '../bba_math_1.json');
    const engPath = path.join(__dirname, '../bba_eng_1.json');

    const mathQuestions = JSON.parse(fs.readFileSync(mathPath, 'utf8'));
    const engQuestions = JSON.parse(fs.readFileSync(engPath, 'utf8'));

    console.log(`Loaded ${mathQuestions.length} Math questions and ${engQuestions.length} English questions.`);

    // 2. Create or Update Mock Exam
    const mockData = {
        title: 'BBA Trial Mock Exam',
        description: 'A free trial mock exam consisting of Mathematics and English sections. Total duration: 2 hours 45 minutes.',
        duration_minutes: 165,
        total_questions: mathQuestions.length + engQuestions.length,
        difficulty: 'medium', // Lowercase to match check constraint
        is_trial: true
    };

    // Check if trial mock exists
    let { data: existingMock, error: fetchError } = await supabase
        .from('mocks')
        .select('id')
        .eq('is_trial', true)
        .single();

    let mockId;

    if (existingMock) {
        console.log(`Trial mock exists (ID: ${existingMock.id}). Updating details...`);
        const { error } = await supabase
            .from('mocks')
            .update(mockData)
            .eq('id', existingMock.id);

        if (error) {
            console.error("Error updating mock:", error);
            return;
        }
        mockId = existingMock.id;

        // Delete existing questions to prevent duplicates/conflicts
        console.log("Clearing existing questions for this mock...");
        await supabase.from('questions').delete().eq('mock_id', mockId);
    } else {
        console.log("Creating new trial mock...");
        const { data: newMock, error } = await supabase
            .from('mocks')
            .insert(mockData)
            .select()
            .single();

        if (error || !newMock) {
            console.error("Error creating mock:", error);
            return;
        }
        mockId = newMock.id;
    }

    // 3. Insert Questions
    console.log("Preparing questions...");

    const allQuestions = [];

    // Process Math
    mathQuestions.forEach((q: any) => {
        allQuestions.push({
            mock_id: mockId,
            question_text: q.question,
            choices: q.options, // Assuming options is array of strings
            correct_answer: q.answer,
        });
    });

    // Process English
    engQuestions.forEach((q: any) => {
        allQuestions.push({
            mock_id: mockId,
            question_text: q.question,
            choices: q.options,
            correct_answer: q.answer,
        });
    });

    // Batch insert
    const BATCH_SIZE = 50;
    for (let i = 0; i < allQuestions.length; i += BATCH_SIZE) {
        const batch = allQuestions.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from('questions').insert(batch);

        if (error) {
            console.error(`Error inserting batch ${i}:`, error);
        } else {
            console.log(`Inserted batch ${i} - ${i + batch.length}`);
        }
    }

    console.log("Seed completed successfully!");
}

seed().catch(console.error);
