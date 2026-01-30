
'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function startTrialAttempt(userId: string) {
    // 0. Get user discipline
    const { data: profile } = await supabase
        .from('profiles')
        .select('discipline')
        .eq('id', userId)
        .single();

    const userDiscipline = profile?.discipline;

    // 1. Get Trial Mock ID
    let query = supabase
        .from('mocks')
        .select('id, duration_minutes')
        .eq('is_trial', true);

    if (userDiscipline) {
        query = query.eq('discipline', userDiscipline);
    }

    const { data: trialMock } = await query.limit(1).single();

    if (!trialMock) throw new Error("Trial mock not found for your discipline");

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

export async function getAvailableExams(userId: string) {
    // Check purchase status
    const { data: purchase } = await supabase
        .from("purchases")
        .select("status")
        .eq("user_id", userId)
        .eq("status", "active")
        .single();

    // Check user discipline
    const { data: profile } = await supabase
        .from("profiles")
        .select("discipline")
        .eq("id", userId)
        .single();

    const userDiscipline = profile?.discipline;

    // Fetch all exams filtered by discipline
    let query = supabase
        .from("mocks")
        .select("*")
        .order("created_at", { ascending: true });

    if (userDiscipline) {
        query = query.eq('discipline', userDiscipline);
    }

    const { data: exams } = await query;

    if (!exams) return [];

    // Filter if not purchased
    // If purchased, show all. If not, show only trial.
    // NOTE: For "Browse Exams", we might want to show locked exams too?
    // Requirement says: "Unpaid users: Paid exams should be hidden or visually locked"
    // Let's return ALL, but mark them as locked if not purchased.

    // Actually, user requirement: "Paid exams should be hidden or visually locked"
    // I will return all, and add an 'isLocked' property.

    const isPaid = !!purchase;

    const examsWithStatus = await Promise.all(exams.map(async (exam) => {
        // Accessibility check
        const isLocked = !exam.is_trial && !isPaid;

        // Fetch latest attempt status
        const { data: latestAttempt } = await supabase
            .from("attempts")
            .select("id, status, score, total_seconds, elapsed_seconds, created_at")
            .eq("user_id", userId)
            .eq("mock_id", exam.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        return {
            ...exam,
            isLocked,
            latestAttempt: latestAttempt || null
        };
    }));

    // Sort exams: Trial Mock first, then by Mock Exam Number
    examsWithStatus.sort((a, b) => {
        // 1. Trial Mock always first (checks title)
        if (a.title.includes("Trial Mock")) return -1;
        if (b.title.includes("Trial Mock")) return 1;

        // 2. Mock Exam X sorting
        const getMockNumber = (title: string) => {
            const match = title.match(/Mock Exam (\d+)/i);
            return match ? parseInt(match[1]) : 999999;
        };

        const numA = getMockNumber(a.title);
        const numB = getMockNumber(b.title);

        if (numA !== 999999 || numB !== 999999) {
            return numA - numB;
        }

        // 3. Fallback to created_at or title
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    return examsWithStatus;
}

export async function startExamAttempt(userId: string, examId: string) {
    // 1. Verify Access
    const { data: exam } = await supabase
        .from("mocks")
        .select("is_trial, duration_minutes")
        .eq("id", examId)
        .single();

    if (!exam) throw new Error("Exam not found");

    if (!exam.is_trial) {
        const { data: purchase } = await supabase
            .from("purchases")
            .select("status")
            .eq("user_id", userId)
            .eq("status", "active")
            .single();

        if (!purchase) throw new Error("Access denied");
    }

    // 2. Check for existing IN_PROGRESS attempt (Resume)
    const { data: existingAttempt } = await supabase
        .from("attempts")
        .select("id")
        .eq("user_id", userId)
        .eq("mock_id", examId)
        .in("status", ["in_progress", "paused"])
        .single();

    if (existingAttempt) {
        return { attemptId: existingAttempt.id, resumed: true };
    }

    // 3. Create NEW attempt (Start or Retake)
    const { data: newAttempt, error } = await supabase
        .from("attempts")
        .insert({
            user_id: userId,
            mock_id: examId,
            status: "in_progress",
            started_at: new Date().toISOString(),
            total_seconds: exam.duration_minutes * 60,
            remaining_seconds: exam.duration_minutes * 60,
            answers: {},
            current_section: "Mathematics", // Default start
            section_locked: { Mathematics: false, English: true }
        })
        .select()
        .single();

    if (error) throw error;

    revalidatePath('/dashboard');
    revalidatePath('/exams');
    return { attemptId: newAttempt.id, resumed: false };
}

