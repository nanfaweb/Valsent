
import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import 'dotenv/config';

// Load env vars from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
require('dotenv').config({ path: envPath });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
    console.log("Checking Trial Mock...");
    const { data: mock, error } = await supabase.from('mocks').select('*').eq('is_trial', true).single();

    if (error) {
        console.error("Error fetching mock:", error);
        return;
    }
    console.log('Mock found:', mock.title, mock.id);

    const { count, error: countError } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('mock_id', mock.id);

    if (countError) {
        console.error("Error counting questions:", countError);
    } else {
        console.log('Questions count:', count);
    }

    // Check one question
    const { data: q } = await supabase.from('questions').select('*').eq('mock_id', mock.id).limit(1).single();
    if (q) {
        console.log("Sample Question:", q.question_text.substring(0, 50) + "...");
    } else {
        console.log("No questions found.");
    }
}

check().catch(console.error);
