
"use client";

import { useAuth } from "@/context/AuthContext";
import { startTrialAttempt } from "@/app/exam/actions";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { Card } from "@/components/ui/Card";
import { Clock, BookOpen, AlertCircle, PlayCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function TrialInstructionsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [activeAttempt, setActiveAttempt] = useState<any>(null);

    useEffect(() => {
        if (!user) return;
        async function checkAttempt() {
            const { data: trialMock } = await supabase.from('mocks').select('id').eq('is_trial', true).single();
            if (trialMock) {
                const { data: attempt } = await supabase
                    .from('attempts')
                    .select('id, status, remaining_seconds')
                    .eq('user_id', user.id)
                    .eq('mock_id', trialMock.id)
                    .in('status', ['in_progress', 'paused'])
                    .single();

                if (attempt) {
                    setActiveAttempt(attempt);
                }
            }
        }
        checkAttempt();
    }, [user]);

    const handleStart = async () => {
        if (!user) {
            router.push("/auth/signin");
            return;
        }

        try {
            setLoading(true);
            const { attemptId } = await startTrialAttempt(user.id);
            if (attemptId) {
                router.push("/exam/trial/play");
            }
        } catch (error) {
            console.error("Failed to start trial:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h} hour${h !== 1 ? 's' : ''} ${m} minute${m !== 1 ? 's' : ''}`;
    };

    return (
        <main className={styles.container}>
            <div className={styles.wrapper}>

                <div className={styles.content}>
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
                                        <h3>2 Hours 45 Minutes</h3>
                                        <p>Total duration. Timer pauses if you save & exit.</p>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className={styles.divider} />
                        <div className={styles.row}>
                            <BookOpen className={styles.icon} />
                            <div>
                                <h3>90 Questions</h3>
                                <p>Includes two sections: Mathematics and English, with 45 questions each, totaling 360 marks.</p>
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
