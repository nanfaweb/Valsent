
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Clock, HelpCircle, PlayCircle, RotateCcw, ArrowRight, Lock } from "lucide-react";
import styles from "./page.module.css";
import { getAvailableExams, startExamAttempt } from "@/app/exam/actions";

export default function BrowseExamsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [exams, setExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            router.push("/auth/signin");
            return;
        }

        async function loadExams() {
            try {
                const data = await getAvailableExams(user!.id);
                setExams(data);
            } catch (error) {
                console.error("Failed to load exams", error);
            } finally {
                setLoading(false);
            }
        }

        loadExams();
    }, [user, router]);

    const handleAction = async (examId: string, action: 'start' | 'resume' | 'retake') => {
        if (!user) return;
        setActionLoading(examId);

        try {
            // Call server action to start/resume
            const result = await startExamAttempt(user.id, examId);

            // Redirect to exam player
            router.push(`/exam/${examId}`);

            // Note: The player will fetch the attempt details using the exam ID. 
            // Wait, the player route is /exam/[id]. 
            // In existing code (/exam/[id]/page.tsx), it checks for existing in_progress attempt.
            // If we created a NEW one (Retake), the player needs to know WHICH attempt to load?
            // The existing player logic uses:
            // const { data: existingAttempt } = await supabase... eq('status', 'in_progress')
            // So if we just created a NEW in_progress attempt, the player will find it!
            // Correct.

        } catch (error) {
            console.error("Failed to start exam", error);
            alert("Failed to start exam. Please try again.");
            setActionLoading(null);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading exams...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Browse Exams</h1>
                <p className={styles.subtitle}>Choose a mock exam to practice your skills</p>
            </div>

            <div className={styles.grid}>
                {exams.map((exam) => {
                    const latest = exam.latestAttempt;
                    const isLocked = exam.isLocked;
                    const inProgress = latest?.status === 'in_progress' || latest?.status === 'paused';
                    const completed = latest?.status === 'submitted';

                    return (
                        <div key={exam.id} className={styles.examCard}>
                            <div className={styles.cardHeader}>
                                <div className={styles.cardTop}>
                                    <h3 className={styles.examTitle}>{exam.title}</h3>
                                    {exam.is_trial && <span className={`${styles.badge} ${styles.badgeTrial}`}>FREE TRIAL</span>}
                                </div>
                                <div className={styles.cardMeta}>
                                    <div className={styles.metaItem}>
                                        <Clock size={18} className="text-primary/60" />
                                        <span>{exam.duration_minutes}m</span>
                                    </div>
                                    <div className={styles.metaItem}>
                                        <HelpCircle size={18} className="text-primary/60" />
                                        <span>{exam.total_questions || 90} Qs</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.divider}></div>

                            <div className={styles.cardFooter}>
                                {isLocked ? (
                                    <Button variant="outline" disabled style={{ width: '100%' }}>
                                        <Lock size={16} style={{ marginRight: 8 }} /> Locked
                                    </Button>
                                ) : (
                                    <>
                                        {inProgress ? (
                                            <Button
                                                variant="secondary"
                                                isLoading={actionLoading === exam.id}
                                                onClick={() => handleAction(exam.id, 'resume')}
                                                style={{ width: '100%', borderColor: '#f59e0b', color: '#d97706' }}
                                            >
                                                <PlayCircle size={16} style={{ marginRight: 8 }} /> Resume Exam
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="primary"
                                                isLoading={actionLoading === exam.id}
                                                onClick={() => handleAction(exam.id, 'start')}
                                                style={{ width: '100%' }}
                                            >
                                                {completed ? (
                                                    <><RotateCcw size={16} style={{ marginRight: 8 }} /> Retake Exam</>
                                                ) : (
                                                    <><PlayCircle size={16} style={{ marginRight: 8 }} /> Start Exam</>
                                                )}
                                            </Button>
                                        )}
                                    </>
                                )}

                                {latest && (
                                    <div className={styles.statusInfo}>
                                        {completed && (
                                            <>
                                                <span>Last Attempt:</span>
                                                <span className={styles.scoreGood}>
                                                    {Math.round((latest.score / (exam.total_questions || 90 * 4)) * 100)}%
                                                    ({latest.score})
                                                </span>
                                            </>
                                        )}
                                        {inProgress && (
                                            <span className={styles.statusInProgress}>In Progress...</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
