
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import styles from "./page.module.css";
import { Loader2 } from "lucide-react";

type Discipline = "bba" | "bcs";

export default function DisciplineSelectionPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [discipline, setDiscipline] = useState<Discipline | null>(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !discipline) return;

        setLoading(true);
        setErr(null);

        try {
            const response = await fetch('/api/profiles/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    discipline: discipline
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to update profile");
            }

            // Success! Redirect to dashboard
            router.push('/dashboard');
            router.refresh(); // Ensure middleware/server components re-run

        } catch (error: any) {
            console.error("Error saving discipline:", error);
            setErr(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        // Technically this page is protected, but if user context isn't loaded yet...
        return (
            <div className={styles.container}>
                <Loader2 className="animate-spin text-white" />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Card className={styles.card}>
                <div className={styles.header}>
                    <h1>Select Your Discipline</h1>
                    <p>
                        To give you the best experience, we need to know which track you are preparing for.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {err && <div className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded">{err}</div>}

                    <div className={styles.disciplineGroup}>
                        <label
                            className={`${styles.radioLabel} ${discipline === 'bba' ? styles.selected : ''}`}
                            onClick={() => setDiscipline('bba')}
                        >
                            <input
                                type="radio"
                                name="discipline"
                                value="bba"
                                checked={discipline === 'bba'}
                                onChange={() => setDiscipline('bba')}
                                className={styles.radioInput}
                            />
                            <div className={styles.radioContent}>
                                <span className={styles.radioTitle}>BBA</span>
                                <span className={styles.radioDesc}>Bachelor of Business Administration</span>
                            </div>
                        </label>

                        <label
                            className={`${styles.radioLabel} ${discipline === 'bcs' ? styles.selected : ''}`}
                            onClick={() => setDiscipline('bcs')}
                        >
                            <input
                                type="radio"
                                name="discipline"
                                value="bcs"
                                checked={discipline === 'bcs'}
                                onChange={() => setDiscipline('bcs')}
                                className={styles.radioInput}
                            />
                            <div className={styles.radioContent}>
                                <span className={styles.radioTitle}>BCS</span>
                                <span className={styles.radioDesc}>Bachelor of Computer Science</span>
                            </div>
                        </label>
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        className={styles.submitBtn}
                        isLoading={loading}
                        disabled={!discipline}
                    >
                        Save & Continue
                    </Button>
                </form>

                <p className={styles.helperText}>
                    This helps us filter the mock exams and trials relevant to your studies.
                </p>
            </Card>
        </div>
    );
}
