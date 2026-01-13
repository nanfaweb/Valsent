
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ResultReview } from "@/components/exam/ResultReview";
import styles from "./page.module.css";

interface Question {
    id: string;
    question_text: string;
    choices?: string[];
    correct_answer: string;
    type: "mcq" | "text" | "math" | "eng";
    section?: string;
}

export default function TrialResultPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [score, setScore] = useState(0);
    const [timeTaken, setTimeTaken] = useState(0);

    useEffect(() => {
        async function loadResult() {
            if (!user) return;

            // Get Trial Mock
            const { data: trialMock } = await supabase
                .from('mocks')
                .select('id')
                .eq('is_trial', true)
                .single();

            if (!trialMock) {
                router.push("/dashboard");
                return;
            }

            // Get the most recent submitted attempt
            const { data: attempt } = await supabase
                .from('attempts')
                .select('*')
                .eq('user_id', user.id)
                .eq('mock_id', trialMock.id)
                .eq('status', 'submitted')
                .order('finished_at', { ascending: false })
                .limit(1)
                .single();

            if (!attempt) {
                router.push("/dashboard");
                return;
            }

            // Get all questions for the mock
            const { data: questionsData } = await supabase
                .from('questions')
                .select('*')
                .eq('mock_id', trialMock.id)
                .order('created_at', { ascending: true });

            if (questionsData && questionsData.length > 0) {
                // Group questions by section
                const mathQuestions = questionsData
                    .filter(q => q.type === 'math')
                    .map(q => ({ ...q, section: 'Mathematics' }));

                const engQuestions = questionsData
                    .filter(q => q.type === 'eng')
                    .map(q => ({ ...q, section: 'English' }));

                const allQuestions = [...mathQuestions, ...engQuestions];
                setQuestions(allQuestions);

                // Parse answers from attempt
                const attemptAnswers = attempt.answers || {};
                setAnswers(attemptAnswers);
                setScore(attempt.score || 0);

                // Calculate time taken
                const startTime = new Date(attempt.started_at).getTime();
                const endTime = new Date(attempt.finished_at).getTime();
                const seconds = Math.floor((endTime - startTime) / 1000);
                setTimeTaken(seconds);
            }

            setLoading(false);
        }

        if (user) loadResult();
    }, [user, router]);

    if (loading) return <div className={styles.loading}>Loading Results...</div>;
    if (!questions.length) return null;

    const handleBackToDashboard = () => {
        router.push("/dashboard");
    };

    return (
        <ResultReview
            questions={questions}
            answers={answers}
            score={score}
            timeTaken={timeTaken}
            onBackToDashboard={handleBackToDashboard}
        />
    );
}
