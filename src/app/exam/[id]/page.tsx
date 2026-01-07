"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { TestPlayer } from "@/components/features/TestPlayer";
import { Button } from "@/components/ui/Button";
import { useRouter, useParams } from "next/navigation";
import styles from "./page.module.css";
import { useAuth } from "@/context/AuthContext";

export default function ExamPage() {
    const params = useParams();
    const id = params.id as string;
    const { user } = useAuth();
    const router = useRouter();

    const [exam, setExam] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const [startExam, setStartExam] = useState(false);

    useEffect(() => {
        async function loadExam() {
            if (!user) return; // Wait for auth

            // Verify Purchase
            const { data: purchase } = await supabase
                .from("purchases")
                .select("status")
                .eq("user_id", user.id)
                .eq("status", "active")
                .single();

            if (!purchase) {
                router.push("/dashboard");
                return;
            }
            setAuthorized(true);

            // Load Exam & Questions
            const { data: examData } = await supabase
                .from("mocks")
                .select("*")
                .eq("id", id)
                .single();

            if (examData) {
                setExam(examData);

                const { data: qData } = await supabase
                    .from("questions")
                    .select("*")
                    .eq("mock_id", id);

                if (qData) setQuestions(qData);
            }
            setLoading(false);
        }

        if (user) loadExam();
        else if (!user && !loading) router.push("/auth/signin"); // Should be handled by layout but double check

    }, [user, id, router]);

    if (loading) return <div className={styles.loading}>Loading Exam...</div>;
    if (!authorized) return <div className={styles.loading}>Redirecting...</div>;
    if (!exam) return <div className={styles.loading}>Exam not found.</div>;

    if (!startExam) {
        return (
            <div className={styles.container}>
                <div className={styles.startCard}>
                    <h1>{exam.title}</h1>
                    <p>{exam.description}</p>
                    <div className={styles.info}>
                        <div>
                            <strong>Duration:</strong> {exam.duration_minutes} Mins
                        </div>
                        <div>
                            <strong>Questions:</strong> {questions.length}
                        </div>
                    </div>
                    <div className={styles.instructions}>
                        <h3>Instructions:</h3>
                        <ul>
                            <li>The timer will start immediately after you click Start.</li>
                            <li>Your progress is auto-saved locally.</li>
                            <li>Do not close the browser window during the exam.</li>
                        </ul>
                    </div>
                    <Button size="lg" onClick={() => setStartExam(true)}>
                        Start Exam
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <TestPlayer exam={exam} questions={questions} />
        </div>
    );
}
