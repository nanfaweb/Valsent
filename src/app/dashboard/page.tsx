"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { TrialIndicator } from "@/components/dashboard/TrialIndicator";
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

                    const { data: allMocks } = await supabase
                        .from("mocks")
                        .select("*");

                    const avgScore = attempts?.length
                        ? Math.round(attempts.reduce((acc, a) => acc + (a.score || 0), 0) / attempts.length)
                        : 0;

                    setStats({
                        totalExams: allMocks?.length || 0,
                        testsTaken: attempts?.length || 0,
                        avgScore: avgScore || "—",
                        avgTime: "45", // Placeholder
                    });
                } else {
                    // Check if trial used from profiles table
                    const { data: profile } = await supabase
                        .from("profiles")
                        .select("trial_used")
                        .eq("id", user.id)
                        .single();

                    const trialUsed = profile?.trial_used || false;

                    if (trialUsed) {
                        // State 2: Trial Completed
                        setState("trial_completed");

                        // Load trial attempt - get trial mock first
                        const { data: trialMock } = await supabase
                            .from("mocks")
                            .select("id")
                            .eq("is_trial", true)
                            .single();

                        if (trialMock) {
                            const { data: attempt } = await supabase
                                .from("attempts")
                                .select("*, mocks(total_questions)")
                                .eq("user_id", user.id)
                                .eq("mock_id", trialMock.id)
                                .eq("status", "submitted")
                                .order("created_at", { ascending: false })
                                .limit(1)
                                .single();

                            if (attempt) {
                                const totalQuestions = (attempt.mocks as any)?.total_questions || 45;
                                const timeTaken = attempt.elapsed_seconds ||
                                    (attempt.finished_at && attempt.started_at
                                        ? (new Date(attempt.finished_at).getTime() - new Date(attempt.started_at).getTime()) / 1000
                                        : 0);

                                setTrialAttempt({
                                    score: attempt.score || 0,
                                    total_questions: totalQuestions,
                                    time_taken_seconds: timeTaken,
                                    percentile: undefined, // Can be calculated later
                                });
                            }
                        }
                    } else {
                        // State 1: Trial Available
                        setState("trial_available");
                    }
                }

                // Load mock exams for preview
                const { data: mocks } = await supabase
                    .from("mocks")
                    .select("*")
                    .order("created_at", { ascending: false });

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
                        <TrialIndicator used={false} showNoCardRequired />

                        <div className={styles.primaryAction}>
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
                            <p className={styles.ctaSubtext}>
                                Experience the full exam interface with no commitment
                            </p>
                        </div>

                        {/* Placeholder stats */}
                        <StatsGrid
                            stats={[
                                { label: "Mock exams available", value: "50+", icon: "exams" },
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
                            <h3 style={{ marginBottom: '1rem' }}>Available Paid Mocks</h3>
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
                        <TrialIndicator used={true} />

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
                        <div className={styles.confirmationBanner}>
                            <h2>All mock exams unlocked!</h2>
                            <p>You have lifetime access to all content</p>
                        </div>

                        <StatsGrid
                            stats={[
                                { label: "Total mock exams", value: stats.totalExams, icon: "exams" },
                                { label: "Tests taken", value: stats.testsTaken, icon: "taken" },
                                { label: "Average score", value: `${stats.avgScore}%`, icon: "score" },
                                { label: "Average time", value: `${stats.avgTime} mins`, icon: "time" },
                            ]}
                        />

                        <div className={styles.actions}>
                            <Link href="/exams" className={styles.ctaLink}>
                                <Button size="lg" className={styles.primaryCta}>
                                    View All Mock Exams
                                </Button>
                            </Link>
                            <Link href="/performance">
                                <Button size="lg" variant="outline">
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
