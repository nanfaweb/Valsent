"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { TestPlayer } from "@/components/features/TestPlayer";
import { Button } from "@/components/ui/Button";
import { useRouter, useParams } from "next/navigation";
import styles from "./page.module.css";
import { useAuth } from "@/context/AuthContext";
import { ExamDropdown } from "@/components/exam/ExamDropdown";

export default function ExamPage() {
    const params = useParams();
    const id = params.id as string;
    const { user } = useAuth();
    const router = useRouter();

    const [exam, setExam] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const [startExam, setStartExam] = useState(false);
    const [availableExams, setAvailableExams] = useState<any[]>([]);
    const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null);

    useEffect(() => {
        async function loadExam() {
            if (!user) return; // Wait for auth

            let purchase = null;

            // Load Exam first to check if it's a trial
            const { data: examData } = await supabase
                .from("mocks")
                .select("*")
                .eq("id", id)
                .single();

            if (!examData) {
                setLoading(false);
                return;
            }

            setExam(examData);

            // If it's a trial exam, allow access
            // Otherwise, verify purchase
            if (!examData.is_trial) {
                const { data: purchaseData } = await supabase
                    .from("purchases")
                    .select("status")
                    .eq("user_id", user.id)
                    .eq("status", "active")
                    .single();

                purchase = purchaseData;

                if (!purchaseData) {
                    router.push("/dashboard");
                    return;
                }
            }

            setAuthorized(true);

            // Load Questions
            const { data: qData } = await supabase
                .from("questions")
                .select("*")
                .eq("mock_id", id);

            if (qData) {
                // Map DB type to UI section
                const mappedQuestions = qData.map((q: any) => {
                    let section = 'Mathematics'; // default

                    if (q.type === 'mcq') {
                        // For MCQ, use the section field directly
                        section = q.section || 'Mathematics';
                    } else if (q.type === 'eng') {
                        // Legacy support for 'eng' type
                        section = 'English';
                    } else if (q.type === 'math') {
                        // Legacy support for 'math' type
                        section = 'Mathematics';
                    }

                    return { ...q, section };
                });
                setQuestions(mappedQuestions);
            }

            // Check for existing unfinished attempt
            const { data: existingAttempt } = await supabase
                .from("attempts")
                .select("id, status")
                .eq("user_id", user.id)
                .eq("mock_id", id)
                .in("status", ["in_progress", "paused"])
                .single();

            if (existingAttempt) {
                setCurrentAttemptId(existingAttempt.id);
                setStartExam(true); // Auto-resume if existing attempt
            }

            // Load available exams based on access
            if (examData.is_trial || purchase) {
                // Load all exams if user has access
                const { data: allExams } = await supabase
                    .from("mocks")
                    .select("id, title, is_trial")
                    .order("created_at", { ascending: true });

                if (allExams) {
                    // For trial users, show only trial exam
                    // For paid users, show all exams
                    const filtered = purchase ? allExams : allExams.filter(e => e.is_trial);
                    setAvailableExams(filtered);
                }
            }

            setLoading(false);
        }

        if (user) loadExam();
        else if (!user && !loading) router.push("/auth/signin");

    }, [user, id, router, loading]);

    const handleStartExam = async () => {
        if (!user) return;
        if (currentAttemptId) {
            setStartExam(true);
            return;
        }

        try {
            // Create new attempt
            const { data: newAttempt, error } = await supabase
                .from("attempts")
                .insert({
                    user_id: user.id,
                    mock_id: id,
                    status: 'in_progress',
                    started_at: new Date().toISOString(),
                    total_seconds: exam.duration_minutes * 60,
                    remaining_seconds: exam.duration_minutes * 60,
                    answers: {}
                })
                .select()
                .single();

            if (error) throw error;
            if (newAttempt) {
                setCurrentAttemptId(newAttempt.id);
                setStartExam(true);
            }
        } catch (err) {
            console.error("Failed to start exam:", err);
            alert("Failed to start exam. Please try again.");
        }
    };

    if (loading) return <div className={styles.loading}>Loading Exam...</div>;
    if (!authorized) return <div className={styles.loading}>Redirecting...</div>;
    if (!exam) return <div className={styles.loading}>Exam not found.</div>;

    if (!startExam) {
        return (
            <div className={styles.container}>
                <div className={styles.startCard}>
                    {availableExams.length > 0 && (
                        <div className={styles.dropdownWrapper}>
                            <ExamDropdown currentExamId={id} exams={availableExams} />
                        </div>
                    )}

                    <h1>{exam.title}</h1>
                    <p>{exam.description}</p>
                    <div className={styles.info}>
                        <div>
                            <strong>Duration:</strong> {exam.duration_minutes} Mins
                        </div>
                        <div>
                            <strong>Questions:</strong> {exam.total_questions || questions.length}
                        </div>
                    </div>
                    <div className={styles.instructions}>
                        <h3>Instructions:</h3>
                        <ul>
                            <li>The timer will start immediately after you click Start.</li>
                            <li>Your progress is auto-saved locally.</li>
                            <li>Do not close the browser window during the exam.</li>
                        </ul>
                    </div>
                    <Button size="lg" onClick={handleStartExam}>
                        {currentAttemptId ? "Resume Exam" : "Start Exam"}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <TestPlayer exam={exam} questions={questions} attemptId={currentAttemptId || undefined} />
        </div>
    );
}
