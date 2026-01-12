"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { supabase } from "@/lib/supabase";
import { TestPlayer } from "@/components/features/TestPlayer";

export default function TrialExamPlayerPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [examData, setExamData] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [attemptId, setAttemptId] = useState<string | null>(null);

    useEffect(() => {
        async function loadExam() {
            if (!user) return;

            // 1. Get Trial Mock
            const { data: trialMock } = await supabase
                .from('mocks')
                .select('*')
                .eq('is_trial', true)
                .single();

            if (!trialMock) {
                alert("Trial exam not found.");
                router.push('/dashboard');
                return;
            }

            // 2. Get Active Attempt
            const { data: attempt } = await supabase
                .from('attempts')
                .select('id, status')
                .eq('user_id', user.id)
                .eq('mock_id', trialMock.id)
                .in('status', ['in_progress', 'paused'])
                .single();

            if (!attempt) {
                // No active attempt, redirect to instructions
                router.push('/exam/trial');
                return;
            }

            setAttemptId(attempt.id);
            setExamData(trialMock);

            // 3. Get Questions
            const { data: qData } = await supabase
                .from('questions')
                .select('*')
                .eq('mock_id', trialMock.id)
                .order('created_at', { ascending: true }); // Ensure strictly ordered by insertion

            if (qData && qData.length > 0) {
                // Map questions to sections based on known structure (45 Math, 45 English)
                // Since we inserted Math first, then English.
                const sectionsCount = { math: 45, eng: 45 };

                const questionsWithSections = qData.map((q, idx) => {
                    let section = 'Mathematics';
                    if (idx >= sectionsCount.math) {
                        section = 'English';
                    }
                    return { ...q, section };
                });

                setQuestions(questionsWithSections);
            } else {
                console.warn("No questions found for trial mock.");
            }

            setLoading(false);
        }

        if (user) {
            loadExam();
        } else {
            console.log("Waiting for user...", user);
        }
    }, [user, router]);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading Exam...</p>
            </div>
        );
    }

    // Debugging blank screen
    if (!examData || !questions.length || !attemptId) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h3>Error Loading Exam</h3>
                <p>Missing data:</p>
                <ul>
                    {!examData && <li>Exam Data Not Found</li>}
                    {!questions.length && <li>Questions Not Loaded ({questions.length})</li>}
                    {!attemptId && <li>Attempt ID Not Found</li>}
                </ul>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    return (
        <div className={styles.playerWrapper}>
            <TestPlayer
                exam={examData}
                questions={questions}
                attemptId={attemptId}
            />
        </div>
    );
}
