
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import styles from "./page.module.css";
import { CheckCircle, Clock, Award, Unlock, BarChart2 } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface ResultData {
    score: number;
    total_questions: number;
    ticks: number; // elapsed seconds
    percentile: string;
}

export default function TrialResultPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<ResultData | null>(null);

    useEffect(() => {
        async function loadResult() {
            if (!user) return;

            // Get Trial Mock ID
            const { data: trialMock } = await supabase
                .from('mocks')
                .select('id, total_questions')
                .eq('is_trial', true)
                .single();

            if (!trialMock) {
                router.push("/dashboard");
                return;
            }

            // Get Submitted Attempt
            const { data: attempt } = await supabase
                .from('attempts')
                .select('*')
                .eq('user_id', user.id)
                .eq('mock_id', trialMock.id)
                .eq('status', 'submitted')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (!attempt) {
                // If no submitted attempt, maybe they are still playing?
                router.push("/dashboard");
                return;
            }

            const elapsed = attempt.total_seconds - attempt.remaining_seconds;

            // Placeholder percentile logic
            // In a real app, count how many scores are below this score
            const percentile = "Top 15%";

            setResult({
                score: attempt.score,
                total_questions: trialMock.total_questions,
                ticks: elapsed,
                percentile
            });
            setLoading(false);
        }

        if (user) loadResult();
    }, [user, router]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    if (loading) return <div className={styles.loading}>Loading Results...</div>;
    if (!result) return null;

    return (
        <main className={styles.container}>
            <div className={styles.wrapper}>
                <Card className={styles.resultCard}>
                    <CheckCircle size={64} className={styles.successIcon} />
                    <h1>Trial Exam Completed!</h1>
                    <p className={styles.subtitle}>Here is how you performed</p>

                    <div className={styles.statsGrid}>
                        <div className={styles.statItem}>
                            <div className={styles.label}>Score</div>
                            <div className={styles.value}>{result.score} <span className={styles.total}>/ {result.total_questions * 4}</span></div>
                        </div>
                        <div className={styles.statItem}>
                            <div className={styles.label}>Time Taken</div>
                            <div className={styles.value}>{formatTime(result.ticks)}</div>
                        </div>
                        <div className={styles.statItem}>
                            <div className={styles.label}>Performance</div>
                            <div className={styles.value}>{result.percentile}</div>
                        </div>
                    </div>

                    <div className={styles.promoSection}>
                        <h2>Unlock Full Access</h2>
                        <p>Get access to 50+ full-length mock exams, detailed analytics, and more.</p>

                        <div className={styles.benefits}>
                            <div className={styles.benefit}><Unlock size={16} /> All Mock Exams</div>
                            <div className={styles.benefit}><BarChart2 size={16} /> Advanced Analytics</div>
                            <div className={styles.benefit}><Clock size={16} /> Real-time Ranking</div>
                        </div>

                        <div className={styles.actions}>
                            <Link href="/pricing" className={styles.fullWidth}>
                                <Button size="lg" className={styles.upgradeBtn}>Unlock Premium</Button>
                            </Link>
                            <Link href="/dashboard" className={styles.fullWidth}>
                                <Button size="lg" variant="outline">Back to Dashboard</Button>
                            </Link>
                        </div>
                    </div>
                </Card>
            </div>
        </main>
    );
}
