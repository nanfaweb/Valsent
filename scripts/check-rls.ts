
import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import 'dotenv/config';

// Load env vars from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
require('dotenv').config({ path: envPath });

// Use ANON key to simulate client-side access
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function check() {
    console.log("Checking RLS visibility with ANON key...");

    // 1. Get trial mock (publicly readable?)
    const { data: mock, error: mockError } = await supabase.from('mocks').select('id, is_trial').eq('is_trial', true).single();

    if (mockError) {
        console.error("Error fetching mock with ANON key:", mockError);
        return;
    }
    console.log('Mock readable:', mock.id);

    // 2. Check questions visibility
    const { count, error: countError } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('mock_id', mock.id);

    if (countError) {
        console.error("Error counting questions with ANON key:", countError);
    } else {
        console.log('Questions visible to ANON:', count);
    }
}

check().catch(console.error);
