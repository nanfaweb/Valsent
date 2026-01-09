"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Lock, Clock, FileText, Play } from "lucide-react";
import styles from "./page.module.css";

interface Exam {
    id: string;
    title: string;
    description: string;
    duration_minutes: number;
    total_questions: number;
    difficulty: "easy" | "medium" | "hard";
    is_trial: boolean;
}

const difficultyColors = {
    easy: { bg: "#D1FAE5", text: "#059669" },
    medium: { bg: "#FEF3C7", text: "#F59E0B" },
    hard: { bg: "#FEE2E2", text: "#DC2626" },
};

export default function ExamsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [exams, setExams] = useState<Exam[]>([]);
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
        async function loadExams() {
            if (!user) {
                router.push("/auth/signin");
                return;
            }

            try {
                // Check if user has purchased plan
                const { data: purchase } = await supabase
                    .from("purchases")
                    .select("*")
                    .eq("user_id", user.id)
                    .eq("status", "active")
                    .single();

                setHasAccess(!!purchase);

                // Load all mocks
                const { data: mocks } = await supabase
                    .from("mocks")
                    .select("*")
                    .order("created_at", { ascending: false });

                if (mocks) setExams(mocks);
            } catch (error) {
                console.error("Error loading exams:", error);
            } finally {
                setLoading(false);
            }
        }

        loadExams();
    }, [user, router]);

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading exams...</p>
            </div>
        );
    }

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Mock Exams</h1>
                    <p className={styles.subtitle}>
                        {hasAccess
                            ? "Choose any exam to start practicing"
                            : "Unlock all exams to access the full exam bank"}
                    </p>
                </div>

                {!hasAccess && (
                    <div className={styles.upgradeBanner}>
                        <p>You don't have access to these exams yet.</p>
                        <Link href="/pricing">
                            <Button className={styles.upgradeBtn}>Unlock All Exams</Button>
                        </Link>
                    </div>
                )}

                <div className={styles.grid}>
                    {exams.map((exam) => {
                        const isLocked = !hasAccess && !exam.is_trial;
                        const diffColor = difficultyColors[exam.difficulty];

                        return (
                            <div
                                key={exam.id}
                                className={`${styles.examCard} ${isLocked ? styles.locked : ""}`}
                            >
                                {isLocked && (
                                    <div className={styles.lockOverlay}>
                                        <Lock size={40} />
                                        <p>Locked</p>
                                    </div>
                                )}

                                <div className={styles.cardHeader}>
                                    <h2 className={styles.examTitle}>{exam.title}</h2>
                                    {exam.is_trial && (
                                        <span className={styles.trialBadge}>Free Trial</span>
                                    )}
                                </div>

                                <p className={styles.description}>{exam.description}</p>

                                <div className={styles.meta}>
                                    <div className={styles.metaItem}>
                                        <Clock size={18} />
                                        <span>{exam.duration_minutes} minutes</span>
                                    </div>
                                    <div className={styles.metaItem}>
                                        <FileText size={18} />
                                        <span>{exam.total_questions} questions</span>
                                    </div>
                                </div>

                                <div
                                    className={styles.difficulty}
                                    style={{
                                        backgroundColor: diffColor.bg,
                                        color: diffColor.text,
                                    }}
                                >
                                    {exam.difficulty.charAt(0).toUpperCase() + exam.difficulty.slice(1)}
                                </div>

                                {!isLocked && (
                                    <Link href={`/exam/${exam.id}`} className={styles.startLink}>
                                        <Button className={styles.startBtn}>
                                            <Play size={18} />
                                            Start Exam
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
