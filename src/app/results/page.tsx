"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import styles from "./page.module.css";
import { ArrowLeft, BookOpen } from "lucide-react";

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
    const [expandedMockId, setExpandedMockId] = useState<string | null>(null);

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
                            attempts: mockAttempts
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
                    <Link href="/dashboard">
                        <Button size="sm" style={{ background: "#5F002A", color: "white" }}>
                            <ArrowLeft size={16} style={{ marginRight: "0.5rem" }} />
                            Back to Dashboard
                        </Button>
                    </Link>
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
                    // Results List
                    <div className={styles.resultsList}>
                        {mockIds.map(mockId => {
                            const group = groupedAttempts[mockId];
                            const isExpanded = expandedMockId === mockId;
                            const attemptCount = group.attempts.length;
                            const bestScore = Math.max(...group.attempts.map(a => a.score || 0));
                            const avgScore = Math.round(
                                group.attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attemptCount
                            );
                            const mostRecent = group.attempts[0];

                            return (
                                <div key={mockId} className={styles.examCard}>
                                    {/* Exam Header */}
                                    <button
                                        className={`${styles.examHeader} ${isExpanded ? styles.expanded : ""}`}
                                        onClick={() =>
                                            setExpandedMockId(isExpanded ? null : mockId)
                                        }
                                    >
                                        <div className={styles.examInfo}>
                                            <h3 className={styles.examTitle}>{group.mock.title}</h3>
                                            <span className={styles.attemptCount}>
                                                {attemptCount} {attemptCount === 1 ? "attempt" : "attempts"}
                                            </span>
                                        </div>

                                        <div className={styles.examStats}>
                                            <div className={styles.stat}>
                                                <span className={styles.statLabel}>Best</span>
                                                <span className={styles.statValue}>{bestScore}</span>
                                            </div>
                                            <div className={styles.stat}>
                                                <span className={styles.statLabel}>Avg</span>
                                                <span className={styles.statValue}>{avgScore}</span>
                                            </div>
                                            <div className={styles.toggleIcon}>
                                                {isExpanded ? "▼" : "▶"}
                                            </div>
                                        </div>
                                    </button>

                                    {/* Recent Attempt Preview */}
                                    {!isExpanded && (
                                        <div className={styles.recentPreview}>
                                            <span className={styles.recentLabel}>Most Recent</span>
                                            <div className={styles.attemptPreview}>
                                                <span className={styles.attemptDate}>
                                                    {formatDate(new Date(mostRecent.finished_at))}
                                                </span>
                                                <span className={styles.attemptScore}>
                                                    {mostRecent.score}/360 marks ({Math.round(((mostRecent.score || 0) / 360) * 100)}%)
                                                </span>
                                                <span className={styles.attemptTime}>
                                                    {formatTime(mostRecent.started_at, mostRecent.finished_at)}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Expanded Attempts List */}
                                    {isExpanded && (
                                        <div className={styles.attemptsList}>
                                            {group.attempts.map((attempt, index) => {
                                                const percentage = attempt.score
                                                    ? Math.round((attempt.score / 360) * 100)
                                                    : 0;
                                                const performanceLevel = getPerformanceLevel(percentage);

                                                return (
                                                    <div key={attempt.id} className={styles.attemptItem}>
                                                        <div className={styles.attemptItemLeft}>
                                                            <div className={styles.attemptHeader}>
                                                                <span className={styles.attemptNumber}>
                                                                    Attempt {attemptCount - index}
                                                                </span>
                                                                <span className={styles.attemptDate}>
                                                                    {formatDate(new Date(attempt.finished_at))}
                                                                </span>
                                                            </div>

                                                            <div className={styles.scoreDisplay}>
                                                                <div className={styles.scoreMain}>
                                                                    <span className={styles.scoreNumber}>{attempt.score || 0}</span>
                                                                    <span className={styles.scoreTotal}>/360</span>
                                                                </div>
                                                                <span className={styles.scorePercentage}>
                                                                    {Math.round(((attempt.score || 0) / 360) * 100)}%
                                                                </span>
                                                            </div>

                                                            <span className={styles.timeInfo}>
                                                                ⏱ {formatTime(attempt.started_at, attempt.finished_at)}
                                                            </span>
                                                        </div>

                                                        <div className={styles.attemptItemRight}>
                                                            <div className={`${styles.badge} ${styles[performanceLevel]}`}>
                                                                {performanceLevel === "excellent"
                                                                    ? "Excellent"
                                                                    : performanceLevel === "good"
                                                                    ? "Good"
                                                                    : performanceLevel === "average"
                                                                    ? "Average"
                                                                    : "Needs Work"}
                                                            </div>
                                                            <div className={styles.attemptButtons}>
                                                                <Link href={`/exam/results/${attempt.id}`}>
                                                                    <Button size="sm" style={{ background: "#5F002A", color: "white" }}>
                                                                        View Details
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Retake Button */}
                                    {isExpanded && (
                                        <div className={styles.retakeSection}>
                                            <Link href={`/exam/${mockId}/rules`}>
                                                <Button size="lg" style={{ background: "#5F002A", color: "white", width: "100%" }}>
                                                    Retake {group.mock.title}
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
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

function formatTime(startTime: string, endTime: string): string {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const seconds = Math.floor((end - start) / 1000);

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
}

function getPerformanceLevel(percentage: number): string {
    if (percentage >= 80) return "excellent";
    if (percentage >= 60) return "good";
    if (percentage >= 40) return "average";
    return "poor";
}
