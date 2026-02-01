"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { TrialResultCard } from "@/components/dashboard/TrialResultCard";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { ExamPreviewGrid } from "@/components/dashboard/ExamPreviewGrid";
import { UpgradePrompt } from "@/components/dashboard/UpgradePrompt";
import Link from "next/link";
import styles from "./page.module.css";

type DashboardState = "trial_available" | "trial_completed" | "plan_purchased";

interface TrialAttempt {
    score: number;
    total_questions: number;
    time_taken_seconds: number;
    percentile?: number;
}

export default function Dashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [state, setState] = useState<DashboardState>("trial_available");
    const [trialAttempt, setTrialAttempt] = useState<TrialAttempt | null>(null);
    const [stats, setStats] = useState<any>(null);
    const [mockExams, setMockExams] = useState<any[]>([]);
    const [trialMockId, setTrialMockId] = useState<string | null>(null);
    const [submittedTrialAttemptId, setSubmittedTrialAttemptId] = useState<string | null>(null);

    useEffect(() => {
        async function loadDashboard() {
            if (!user) {
                router.push("/auth/signin");
                return;
            }

            try {
                // 1. Check for active purchase
                const { data: purchase } = await supabase
                    .from("purchases")
                    .select("*")
                    .eq("user_id", user.id)
                    .eq("status", "active")
                    .single();

                if (purchase) {
                    // State 3: Plan Purchased
                    setState("plan_purchased");

                    // Load stats
                    const { data: attempts } = await supabase
                        .from("attempts")
                        .select("*")
                        .eq("user_id", user.id);



                    const avgScore = attempts?.length
                        ? Math.round(attempts.reduce((acc, a) => acc + (a.score || 0), 0) / attempts.length)
                        : 0;

                    // Calculate average time from submitted attempts
                    // Uses (total_seconds - remaining_seconds) OR (finished_at - started_at)
                    const submittedAttempts = attempts?.filter(a => a.status === 'submitted' && a.finished_at && a.started_at) || [];
                    let avgTimeMinutes = 0;
                    if (submittedAttempts.length > 0) {
                        const totalSeconds = submittedAttempts.reduce((acc, a) => {
                            // Prefer elapsed time from remaining_seconds if available
                            if (a.total_seconds && a.remaining_seconds !== undefined) {
                                return acc + (a.total_seconds - a.remaining_seconds);
                            }
                            // Fallback to timestamp difference
                            const start = new Date(a.started_at).getTime();
                            const end = new Date(a.finished_at).getTime();
                            return acc + ((end - start) / 1000);
                        }, 0);
                        avgTimeMinutes = Math.round(totalSeconds / submittedAttempts.length / 60);
                    }

                    setStats({
                        totalExams: 11,
                        testsTaken: attempts?.length || 0,
                        avgScore: avgScore || "—",
                        avgTime: avgTimeMinutes > 0 ? avgTimeMinutes : "—",
                    });
                } else {
                    // No purchase - show trial available state (trials can be repeated)
                    setState("trial_available");
                }

                // Load mock mocks for preview
                // Filter by discipline if available
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("discipline")
                    .eq("id", user.id)
                    .single();

                const userDiscipline = profile?.discipline;

                let mocksQuery = supabase
                    .from("mocks")
                    .select("*")
                    .order("created_at", { ascending: false });

                if (userDiscipline) {
                    // Fetch mocks that match discipline OR are trials (if trial is global, but requirement says trial is discipline specific)
                    // Requirement: "mocks.discipline = profiles.discipline (and include discipline-specific trials only)"
                    mocksQuery = mocksQuery.eq('discipline', userDiscipline);
                }

                const { data: mocks } = await mocksQuery;

                if (mocks) {
                    // Find trial mock
                    const trialMock = mocks.find(m => m.is_trial);
                    if (trialMock) {
                        setTrialMockId(trialMock.id);

                        // Check if in progress
                        if (state === "trial_available") {
                            const { data: activeAttempt } = await supabase
                                .from("attempts")
                                .select("status")
                                .eq("user_id", user.id)
                                .eq("mock_id", trialMock.id)
                                .in("status", ["in_progress", "paused"])
                                .single();

                            if (activeAttempt) {
                                setTrialAttempt({ status: activeAttempt.status } as any);
                            }
                        }

                        // Check for submitted trial attempt (for "View Trial Performance" button)
                        const { data: submittedAttempt } = await supabase
                            .from("attempts")
                            .select("id")
                            .eq("user_id", user.id)
                            .eq("mock_id", trialMock.id)
                            .eq("status", "submitted")
                            .order("created_at", { ascending: false })
                            .limit(1)
                            .single();

                        if (submittedAttempt) {
                            setSubmittedTrialAttemptId(submittedAttempt.id);
                        }
                    }

                    setMockExams(
                        mocks.map((m) => ({
                            id: m.id,
                            title: m.title,
                            duration: m.duration_minutes,
                            totalQuestions: m.total_questions,
                            difficulty: m.difficulty,
                        }))
                    );
                }
            } catch (error) {
                console.error("Error loading dashboard:", error);
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, [user, router]);

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student";

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <WelcomeHeader userName={userName} />

                {/* STATE 1: Trial Available or In Progress */}
                {state === "trial_available" && (
                    <>

                        <div className={styles.primaryAction}>
                            <div className={styles.buttonsContainer}>
                                {trialMockId ? (
                                    <Link href={`/exam/${trialMockId}/rules`} className={styles.ctaLink}>
                                        <Button size="lg" className={styles.primaryCta}>
                                            {(trialAttempt as any)?.status === 'in_progress' || (trialAttempt as any)?.status === 'paused'
                                                ? "Continue Your Free Mock Exam"
                                                : "Start Your Free Mock Exam"}
                                        </Button>
                                    </Link>
                                ) : (
                                    <Button size="lg" className={styles.primaryCta} disabled>
                                        Loading trial exam...
                                    </Button>
                                )}
                                {submittedTrialAttemptId && (
                                    <Link href="/results" className={styles.ctaLink}>
                                        <Button size="lg" variant="outline" className={styles.primaryCta}>
                                            View Trial Performance
                                        </Button>
                                    </Link>
                                )}
                            </div>
                            <p className={styles.ctaSubtext}>
                                Experience the full exam interface with no commitment
                            </p>
                        </div>

                        {/* Placeholder stats */}
                        <StatsGrid
                            stats={[
                                { label: "Mock exams available", value: "10+", icon: "exams" },
                                { label: "Tests taken", value: "—", icon: "taken" },
                                { label: "Average score", value: "—", icon: "score" },
                                { label: "Average time", value: "—", icon: "time" },
                            ]}
                        />

                        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                            <Link href="/exams">
                                <Button variant="outline">Browse All Exams</Button>
                            </Link>
                        </div>

                        {/* Show preview of paid exams (locked) */}
                        <div style={{ marginTop: '2rem' }}>
                            <ExamPreviewGrid
                                exams={mockExams.filter(m => !m.title?.toLowerCase().includes('trial')).slice(0, 4)}
                                locked={true}
                            />
                        </div>
                    </>
                )}

                {/* STATE 2: Trial Completed */}
                {state === "trial_completed" && (
                    <>

                        {trialAttempt && (
                            <TrialResultCard
                                score={trialAttempt.score}
                                totalQuestions={trialAttempt.total_questions}
                                timeTaken={trialAttempt.time_taken_seconds}
                                percentile={trialAttempt.percentile}
                            />
                        )}

                        <UpgradePrompt />

                        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                            <Link href="/exams">
                                <Button variant="outline">Browse All Exams</Button>
                            </Link>
                        </div>

                        {/* Show preview of paid exams (locked) */}
                        <div style={{ marginTop: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Paid Mocks Library</h3>
                            <ExamPreviewGrid
                                exams={mockExams.filter(m => !m.title?.toLowerCase().includes('trial')).slice(0, 4)}
                                locked={true}
                            />
                        </div>
                    </>
                )}

                {/* STATE 3: Plan Purchased */}
                {state === "plan_purchased" && (
                    <>


                        <StatsGrid
                            stats={[
                                { label: "Total mock exams", value: stats.totalExams, icon: "exams" },
                                { label: "Tests taken", value: stats.testsTaken, icon: "taken" },
                                { label: "Average score", value: `${stats.avgScore}%`, icon: "score" },
                                { label: "Average time", value: stats.avgTime !== "—" ? `${stats.avgTime} mins` : "—", icon: "time" },
                            ]}
                        />

                        <div className={styles.actions}>
                            <Link href="/exams" className={styles.ctaLink}>
                                <Button size="lg" className={styles.primaryCta}>
                                    View All Mock Exams
                                </Button>
                            </Link>
                            <Link href="/results" className={styles.ctaLink}>
                                <Button size="lg" className={styles.primaryCta} variant="outline">
                                    View Performance Summary
                                </Button>
                            </Link>
                        </div>

                        {/* Show real exams (excluding trial) for purchased users */}
                        <ExamPreviewGrid
                            exams={mockExams.filter(m => !m.title?.toLowerCase().includes('trial'))}
                            locked={false}
                            showTitle={false}
                        />
                    </>
                )}
            </div>
        </main>
    );
}