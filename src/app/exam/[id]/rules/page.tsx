"use client";

import { useAuth } from "@/context/AuthContext";
import { startExamAttempt } from "@/app/exam/actions";
import { Button } from "@/components/ui/Button";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { Card } from "@/components/ui/Card";
import { Clock, BookOpen, AlertCircle, PlayCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ExamRulesPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const examId = params.id as string;

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [exam, setExam] = useState<any>(null);
    const [activeAttempt, setActiveAttempt] = useState<any>(null);

    useEffect(() => {
        if (!user) return; // Wait for auth, or redirect if protected layout doesn't handle it

        async function loadData() {
            try {
                // 1. Load Exam Details
                const { data: examData, error: examError } = await supabase
                    .from('mocks')
                    .select('*')
                    .eq('id', examId)
                    .single();

                if (examError || !examData) {
                    console.error("Exam not found");
                    router.push('/exams'); // Fallback
                    return;
                }
                setExam(examData);

                // 2. Check for Active Attempt
                const { data: attempt } = await supabase
                    .from('attempts')
                    .select('id, status, remaining_seconds')
                    .eq('user_id', user.id)
                    .eq('mock_id', examId)
                    .in('status', ['in_progress', 'paused'])
                    .single();

                if (attempt) {
                    setActiveAttempt(attempt);
                }
            } catch (error) {
                console.error("Error loading exam data:", error);
            } finally {
                setPageLoading(false);
            }
        }

        loadData();
    }, [user, examId, router]);

    const handleStart = async () => {
        if (!user) {
            router.push("/auth/signin");
            return;
        }

        try {
            setLoading(true);
            const { attemptId } = await startExamAttempt(user!.id, examId);
            if (attemptId) {
                router.push(`/exam/${examId}`);
            }
        } catch (error) {
            console.error("Failed to start exam:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const parts = [];
        if (h > 0) parts.push(`${h} hour${h !== 1 ? 's' : ''}`);
        if (m > 0 || h === 0) parts.push(`${m} minute${m !== 1 ? 's' : ''}`);
        return parts.join(' ');
    };

    if (pageLoading) {
        return (
            <main className={styles.container}>
                <div className={styles.loading}>Loading exam details...</div>
            </main>
        );
    }

    if (!exam) return null;

    return (
        <main className={styles.container}>
            <div className={styles.wrapper}>

                <div className={styles.content}>
                    <div className={styles.pageTitle}>
                        <h1>{exam.title}</h1>
                    </div>

                    <Card className={styles.infoCard}>
                        <div className={styles.row}>
                            <Clock className={styles.icon} />
                            <div>
                                {activeAttempt ? (
                                    <>
                                        <h3>{formatTime(activeAttempt.remaining_seconds || 0)} Remaining</h3>
                                        <p>Time left in your active attempt.</p>
                                    </>
                                ) : (
                                    <>
                                        <h3>{formatTime(exam.duration_minutes * 60)}</h3>
                                        <p>Total duration. Timer pauses if you save & exit.</p>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className={styles.divider} />
                        <div className={styles.row}>
                            <BookOpen className={styles.icon} />
                            <div>
                                <h3>{exam.total_questions || 90} Questions</h3>
                                <p>Includes structured sections (e.g. Mathematics, English) totaling maximum marks.</p>
                            </div>
                        </div>
                    </Card>

                    <div className={styles.rulesSection}>
                        <h2>Exam Rules</h2>
                        <ul className={styles.rulesList}>
                            <li>
                                <strong>Sequential Sections:</strong> You must attempt multiple sections in order.
                                <br />
                                <span className={styles.highlight}>Mathematics</span> → <span className={styles.highlight}>English</span>
                            </li>
                            <li>
                                <strong>Section Locking:</strong> Once you submit a section (e.g., Math), it becomes <span className={styles.locked}>LOCKED</span>. You cannot go back to change answers.
                            </li>
                            <li>
                                <strong>Auto-Save:</strong> Your progress is saved automatically. You can leave and resume later.
                            </li>
                            <li>
                                <strong>Retakes & Previous Results:</strong> When you retake an exam, a new attempt is created. All your previous results are saved and available in your results page for comparison and review.
                            </li>
                        </ul>
                    </div>

                    <div className={styles.actionSection}>
                        {loading ? (
                            <Button size="lg" disabled className={styles.startBtn}>
                                {activeAttempt ? "Resuming Exam..." : "Starting Exam..."}
                            </Button>
                        ) : (
                            <Button size="lg" onClick={handleStart} className={styles.startBtn}>
                                {activeAttempt ? "Continue" : "Start"}
                                <PlayCircle size={20} style={{ marginLeft: 8 }} />
                            </Button>
                        )}
                        <p className={styles.note}>
                            <AlertCircle size={14} style={{ display: 'inline', marginRight: 4 }} />
                            {activeAttempt ? "Resume where you left off." : "By clicking start, you agree to the exam rules."}
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
