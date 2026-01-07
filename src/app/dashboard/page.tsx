"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import styles from "./page.module.css";
import { Lock, PlayCircle, Clock } from "lucide-react";

type MockExam = {
    id: string;
    title: string;
    duration_minutes: number;
    description: string;
};

type Purchase = {
    status: string;
};

export default function Dashboard() {
    const { user } = useAuth();
    const [hasActivePlan, setHasActivePlan] = useState<boolean | null>(null);
    const [exams, setExams] = useState<MockExam[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadDashboardData() {
            if (!user) return;

            try {
                // 1. Check Purchase Status
                const { data: purchase } = await supabase
                    .from("purchases")
                    .select("status")
                    .eq("user_id", user.id)
                    .eq("status", "active")
                    .single();

                setHasActivePlan(!!purchase);

                // 2. Load Exams (if active or just metadata if public)
                // We'll load metadata anyway, but maybe lock them.
                const { data: mocks } = await supabase
                    .from("mocks")
                    .select("*")
                    .order("created_at", { ascending: false });

                if (mocks) setExams(mocks);

            } catch (error) {
                console.error("Error loading dashboard:", error);
            } finally {
                setLoading(false);
            }
        }

        loadDashboardData();
    }, [user]);

    if (loading) return <div>Loading...</div>;

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <h1>Your Dashboard</h1>
                {hasActivePlan ? (
                    <span className={styles.badgeActive}>Premium Active</span>
                ) : (
                    <span className={styles.badgeInactive}>Free Account</span>
                )}
            </div>

            {!hasActivePlan && (
                <Card className={styles.upsellCard}>
                    <div className={styles.upsellContent}>
                        <h2>Unlock Full Access</h2>
                        <p>Get access to all {exams.length || "50+"} mock exams and detailed reporting.</p>
                        <Link href="/pricing">
                            <Button>Upgrade Now</Button>
                        </Link>
                    </div>
                    <Lock className={styles.lockIcon} size={48} />
                </Card>
            )}

            <div className={styles.grid}>
                {exams.length === 0 ? (
                    <p>No exams available yet. Check back soon!</p>
                ) : (
                    exams.map((exam) => (
                        <Card key={exam.id} className={styles.examCard}>
                            <div className={styles.examHeader}>
                                <h3>{exam.title}</h3>
                                {hasActivePlan ? (
                                    <span className={styles.duration}>
                                        <Clock size={14} /> {exam.duration_minutes} mins
                                    </span>
                                ) : (
                                    <Lock size={16} className={styles.cardLock} />
                                )}
                            </div>
                            <p className={styles.examDesc}>{exam.description || "Comprehensive mock exam."}</p>

                            <div className={styles.examActions}>
                                {hasActivePlan ? (
                                    <Link href={`/exam/${exam.id}`}>
                                        <Button size="sm" variant="outline" className={styles.startBtn}>
                                            <PlayCircle size={16} /> Start Exam
                                        </Button>
                                    </Link>
                                ) : (
                                    <Button size="sm" disabled className={styles.startBtn}>
                                        Locked
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </main>
    );
}
