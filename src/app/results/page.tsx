"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import AttemptsModal from "@/components/exam/AttemptsModal";
import styles from "./page.module.css";
import { BookOpen } from "lucide-react";

interface Attempt {
    id: string;
    mock_id: string;
    score: number;
    started_at: string;
    finished_at: string;
    created_at: string;
}

interface MockExam {
    id: string;
    title: string;
    duration_minutes: number;
}

interface GroupedAttempts {
    [mockId: string]: {
        mock: MockExam;
        attempts: Attempt[];
    };
}

export default function ResultsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [groupedAttempts, setGroupedAttempts] = useState<GroupedAttempts>({});
    const [selectedMockId, setSelectedMockId] = useState<string | null>(null);

    useEffect(() => {
        async function loadResults() {
            if (!user) {
                router.push("/auth/signin");
                return;
            }

            try {
                // Fetch all submitted attempts for the user
                const { data: attempts } = await supabase
                    .from("attempts")
                    .select("*")
                    .eq("user_id", user.id)
                    .eq("status", "submitted")
                    .order("finished_at", { ascending: false });

                if (!attempts || attempts.length === 0) {
                    setLoading(false);
                    return;
                }

                // Get unique mock IDs
                const mockIds = [...new Set(attempts.map(a => a.mock_id))];

                // Fetch mock details
                const { data: mocks } = await supabase
                    .from("mocks")
                    .select("*")
                    .in("id", mockIds);

                // Group attempts by mock_id
                const grouped: GroupedAttempts = {};

                mockIds.forEach(mockId => {
                    const mockAttempts = attempts.filter(a => a.mock_id === mockId);
                    const mockData = mocks?.find(m => m.id === mockId);

                    if (mockData) {
                        grouped[mockId] = {
                            mock: mockData,
                            attempts: mockAttempts.sort((a, b) =>
                                new Date(b.finished_at).getTime() -
                                new Date(a.finished_at).getTime()
                            )
                        };
                    }
                });

                setGroupedAttempts(grouped);
            } catch (error) {
                console.error("Failed to load results:", error);
            } finally {
                setLoading(false);
            }
        }

        if (user) loadResults();
    }, [user, router]);

    if (loading) {
        return (
            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.loading}>
                        <div className={styles.spinner}></div>
                        <p>Loading your results...</p>
                    </div>
                </div>
            </main>
        );
    }

    const mockIds = Object.keys(groupedAttempts);
    const hasAttempts = mockIds.length > 0;

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <h1 className={styles.title}>Your Results</h1>
                        <p className={styles.subtitle}>
                            Review your past exams and track your performance over time.
                        </p>
                    </div>
                </div>

                {!hasAttempts ? (
                    // Empty State
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📋</div>
                        <h2 className={styles.emptyTitle}>No Results Yet</h2>
                        <p className={styles.emptyText}>
                            You haven&apos;t completed any exams yet. Start practicing to see your results here.
                        </p>
                        <div className={styles.emptyActions}>
                            <Link href="/exam/trial">
                                <Button size="lg">Take Trial Exam</Button>
                            </Link>
                            <Link href="/exams">
                                <Button variant="secondary" size="lg">
                                    <BookOpen size={18} style={{ marginRight: "0.5rem" }} />
                                    Browse Exams
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    // Results Grid
                    <>
                        <div className={styles.cardsGrid}>
                            {mockIds.map(mockId => {
                                const group = groupedAttempts[mockId];
                                const attemptCount = group.attempts.length;
                                const bestScore = Math.max(...group.attempts.map(a => a.score || 0));
                                const bestPercentage = Math.round((bestScore / 360) * 100);
                                const avgScore = Math.round(
                                    group.attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attemptCount
                                );
                                const avgPercentage = Math.round((avgScore / 360) * 100);
                                const mostRecent = group.attempts[0];

                                return (
                                    <button
                                        key={mockId}
                                        className={styles.summaryCard}
                                        onClick={() => setSelectedMockId(mockId)}
                                    >
                                        <div className={styles.cardHeader}>
                                            <h3 className={styles.cardTitle}>{group.mock.title}</h3>
                                            <span className={styles.cardBadge}>
                                                {attemptCount} {attemptCount === 1 ? "attempt" : "attempts"}
                                            </span>
                                        </div>

                                        <div className={styles.cardContent}>
                                            <div className={styles.statBlock}>
                                                <span className={styles.statSmallLabel}>Best Score</span>
                                                <div className={styles.scoreBlock}>
                                                    <span className={styles.scoreValue}>{bestScore}/360</span>
                                                    <span className={styles.scorePercentage}>
                                                        {bestPercentage}%
                                                    </span>
                                                </div>
                                            </div>

                                            <div className={styles.statBlock}>
                                                <span className={styles.statSmallLabel}>Average</span>
                                                <div className={styles.scoreBlock}>
                                                    <span className={styles.scoreValue}>{avgScore}/360</span>
                                                    <span className={styles.scorePercentage}>
                                                        {avgPercentage}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={styles.cardFooter}>
                                            <div className={styles.recentInfo}>
                                                <span className={styles.recentLabel}>Last attempt:</span>
                                                <span className={styles.recentDate}>
                                                    {formatDate(new Date(mostRecent.finished_at))}
                                                </span>
                                            </div>
                                            <span className={styles.viewArrow}>→</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Modal */}
                        <AttemptsModal
                            isOpen={selectedMockId !== null}
                            onClose={() => setSelectedMockId(null)}
                            mock={
                                selectedMockId
                                    ? groupedAttempts[selectedMockId].mock
                                    : { id: "", title: "" }
                            }
                            attempts={
                                selectedMockId
                                    ? groupedAttempts[selectedMockId].attempts
                                    : []
                            }
                        />
                    </>
                )}
            </div>
        </main>
    );
}

// Utilities
function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(date);
}
