
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import { ResultReview } from "@/components/exam/ResultReview";
import styles from "./page.module.css";

interface Question {
    id: string;
    question_text: string;
    choices?: string[];
    correct_answer: string;
    type: "mcq" | "text" | "math" | "eng";
    section?: string;
    explanation?: string;
}

export default function ResultHistoryPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const attemptId = params.attemptId as string;

    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [score, setScore] = useState(0);
    const [timeTaken, setTimeTaken] = useState(0);
    const [hasPurchase, setHasPurchase] = useState(false);

    useEffect(() => {
        async function loadResult() {
            if (!user || !attemptId) {
                if (!loading) router.push("/dashboard");
                return;
            }

            try {
                // Check purchase status
                const { data: purchase } = await supabase
                    .from("purchases")
                    .select("status")
                    .eq("user_id", user.id)
                    .eq("status", "active")
                    .single();

                setHasPurchase(!!purchase);

                // 1. Get the attempt
                const { data: attempt, error: attemptError } = await supabase
                    .from('attempts')
                    .select('*')
                    .eq('id', attemptId)
                    .eq('user_id', user.id)
                    .single();

                if (attemptError || !attempt) {
                    console.error("Attempt not found", attemptError);
                    router.push("/dashboard");
                    return;
                }

                // Check for trial status of the mock
                const { data: mockData } = await supabase
                    .from('mocks')
                    .select('is_trial')
                    .eq('id', attempt.mock_id)
                    .single();

                if (mockData && !mockData.is_trial) {
                    const { data: purchase } = await supabase
                        .from('purchases')
                        .select('status')
                        .eq('user_id', user.id)
                        .eq('status', "active")
                        .single();

                    if (!purchase) {
                        router.push('/pricing');
                        return;
                    }
                }

                // 2. Get questions for this mock
                const { data: questionsData, error: qError } = await supabase
                    .from('questions')
                    .select('*')
                    .eq('mock_id', attempt.mock_id)
                    .order('created_at', { ascending: true }); // Assume creation order for now

                if (qError) {
                    console.error("Failed to load questions", qError);
                    return;
                }

                if (questionsData && questionsData.length > 0) {
                    // Map questions to expected format
                    const mappedQuestions: Question[] = questionsData.map((q: any) => ({
                        id: q.id,
                        question_text: q.question_text,
                        choices: q.choices, // Database stores jsonb, supabase returns object/array
                        correct_answer: q.correct_answer,
                        type: q.type, // 'mcq' usually
                        // Strictly use type field as per user instruction
                        section: q.type === 'mcq' ? (q.section || 'Mathematics') : (q.type === 'eng' ? 'English' : 'Mathematics'),
                        explanation: q.explanation // If exists
                    }));

                    setQuestions(mappedQuestions);

                    // Parse answers from attempt
                    const attemptAnswers = attempt.answers || {};
                    setAnswers(attemptAnswers);
                    setScore(attempt.score || 0);

                    // Calculate time taken
                    const startTime = new Date(attempt.started_at).getTime();
                    const endTime = attempt.finished_at ? new Date(attempt.finished_at).getTime() : Date.now();
                    const seconds = Math.floor((endTime - startTime) / 1000);
                    setTimeTaken(seconds);
                }
            } catch (err) {
                console.error("Error loading result:", err);
            } finally {
                setLoading(false);
            }
        }

        loadResult();
    }, [user, attemptId, router]);

    const handleBackToDashboard = () => {
        // Check if coming from "Retake"? No, just go to dashboard or exams list.
        router.push("/dashboard");
    };

    const handleBackToOverview = () => {
        router.push("/results");
    };

    const handleRetake = async () => {
        // Redirect to /exams page or trigger retake logic?
        // Let's redirect to /exams where user can click Retake.
        router.push("/exams");
    };

    if (loading) return <div className={styles.loading}>Loading attempt details...</div>;
    if (!questions.length) return <div className={styles.loading}>No questions found for this attempt.</div>;

    return (
        <div className={styles.container}>
            {/* We might want to wrap ResultReview with a layout or header? 
                ResultReview seems to be a full page component based on trial/result usage. 
            */}
            <ResultReview
                questions={questions}
                answers={answers}
                score={score}
                timeTaken={timeTaken}
                onBackToDashboard={handleBackToDashboard}
                onBackToOverview={handleBackToOverview}
                showBackToOverview={hasPurchase}
            />
        </div>
    );
}
