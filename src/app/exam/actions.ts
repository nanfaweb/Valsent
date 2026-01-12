
'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function startTrialAttempt(userId: string) {
    // 1. Get Trial Mock ID
    const { data: trialMock } = await supabase
        .from('mocks')
        .select('id, duration_minutes')
        .eq('is_trial', true)
        .single();

    if (!trialMock) throw new Error("Trial mock not found");

    // 2. Check for existing attempt
    const { data: existingAttempt } = await supabase
        .from('attempts')
        .select('id, status')
        .eq('user_id', userId)
        .eq('mock_id', trialMock.id)
        .in('status', ['in_progress', 'paused'])
        .single();

    if (existingAttempt) {
        return { attemptId: existingAttempt.id };
    }

    // 3. Create new attempt
    const { data: newAttempt, error } = await supabase
        .from('attempts')
        .insert({
            user_id: userId,
            mock_id: trialMock.id,
            status: 'in_progress',
            started_at: new Date().toISOString(),
            total_seconds: trialMock.duration_minutes * 60,
            remaining_seconds: trialMock.duration_minutes * 60,
            answers: {},
            current_section: 'Mathematics',
            section_locked: { Mathematics: false, English: true }
        })
        .select()
        .single();

    if (error) throw error;
    return { attemptId: newAttempt.id };
}

export async function submitSection(attemptId: string, currentSection: string, nextSection: string) {
    const { data: attempt } = await supabase
        .from('attempts')
        .select('section_locked')
        .eq('id', attemptId)
        .single();

    if (!attempt) throw new Error("Attempt not found");

    const newLocks = { ...attempt.section_locked, [currentSection]: true, [nextSection]: false };

    const { error } = await supabase
        .from('attempts')
        .update({
            section_locked: newLocks,
            current_section: nextSection,
            last_saved_at: new Date().toISOString()
        })
        .eq('id', attemptId);

    if (error) throw error;
    return { success: true };
}

export async function submitExam(attemptId: string, answers: any, timeLeft: number) {
    // Calculate score server-side for security
    const { data: attempt } = await supabase
        .from('attempts')
        .select('mock_id')
        .eq('id', attemptId)
        .single();

    if (!attempt) throw new Error("Attempt not found");

    const { data: questions } = await supabase
        .from('questions')
        .select('id, correct_answer')
        .eq('mock_id', attempt.mock_id);

    let score = 0;
    if (questions) {
        questions.forEach(q => {
            if (answers[q.id] === q.correct_answer) {
                score += 4;
            }
        });
    }

    const { error } = await supabase
        .from('attempts')
        .update({
            status: 'submitted',
            score: score,
            answers: answers,
            remaining_seconds: timeLeft,
            finished_at: new Date().toISOString()
        })
        .eq('id', attemptId);

    // Update profile trial_used
    const { data: userData } = await supabase.from('attempts').select('user_id').eq('id', attemptId).single();
    if (userData) {
        await supabase.from('profiles').update({ trial_used: true }).eq('id', userData.user_id);
    }

    if (error) throw error;
    revalidatePath('/dashboard');
    return { success: true, score };
}
