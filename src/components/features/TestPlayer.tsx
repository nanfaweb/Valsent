"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import styles from "./TestPlayer.module.css";
import { Timer, AlertCircle, CheckCircle, ChevronRight, ChevronLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

type Question = {
    id: string;
    type: "mcq" | "text";
    question_text: string;
    choices?: string[]; // stored as JSONB in DB, parsed to array here
    correct_answer: string;
};

type Exam = {
    id: string;
    title: string;
    duration_minutes: number;
};

interface TestPlayerProps {
    exam: Exam;
    questions: Question[];
}

export const TestPlayer = ({ exam, questions }: TestPlayerProps) => {
    const { user } = useAuth();
    const router = useRouter();

    // State
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timeLeft, setTimeLeft] = useState(exam.duration_minutes * 60);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [score, setScore] = useState(0);

    // Load saved progress
    useEffect(() => {
        const saved = localStorage.getItem(`exam_progress_${exam.id}`);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Only restore if valid
            if (parsed.answers) setAnswers(parsed.answers);
            // Restore time? complex if they left page. Let's restart time for simplicity 
            // or implement server-side start time tracking. 
            // For MVP, we reset time on refresh OR we track 'started_at' in localStorage.
        }
    }, [exam.id]);

    // Timer
    useEffect(() => {
        if (isFinished) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit(); // Auto submit
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isFinished]);

    // Auto-save
    useEffect(() => {
        if (!isFinished) {
            localStorage.setItem(`exam_progress_${exam.id}`, JSON.stringify({ answers }));
        }
    }, [answers, exam.id, isFinished]);

    const handleAnswer = (val: string) => {
        const qId = questions[currentQuestionIndex].id;
        setAnswers((prev) => ({ ...prev, [qId]: val }));
    };

    const calculateScore = () => {
        let correct = 0;
        questions.forEach((q) => {
            if (answers[q.id] === q.correct_answer) {
                correct++;
            }
        });
        return correct;
    };

    const handleSubmit = useCallback(async () => {
        if (isSubmitting || isFinished) return;
        setIsSubmitting(true);

        const finalScore = calculateScore();
        setScore(finalScore);
        setIsFinished(true);

        try {
            // Save to Supabase
            if (user) {
                await supabase.from("attempts").insert({
                    user_id: user.id,
                    mock_id: exam.id,
                    score: finalScore,
                    answers: answers,
                    finished_at: new Date().toISOString(),
                    // started_at should technically be passed or tracked
                });
            }

            // Clear local storage
            localStorage.removeItem(`exam_progress_${exam.id}`);

        } catch (error) {
            console.error("Failed to submit:", error);
        } finally {
            setIsSubmitting(false);
        }
    }, [answers, exam.id, isFinished, isSubmitting, questions, user]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    if (isFinished) {
        return (
            <Card className={styles.resultCard}>
                <CheckCircle size={48} className={styles.successIcon} />
                <h2>Exam Submitted!</h2>
                <div className={styles.scoreDisplay}>
                    <span className={styles.scoreLabel}>Your Score</span>
                    <span className={styles.scoreValue}>{score} / {questions.length}</span>
                </div>
                <p>Percentage: {Math.round((score / questions.length) * 100)}%</p>
                <div className={styles.actions}>
                    <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
                    {/* Add Review Answers logic later */}
                </div>
            </Card>
        );
    }

    const currentQ = questions[currentQuestionIndex];
    const isLast = currentQuestionIndex === questions.length - 1;

    return (
        <div className={styles.playerContainer}>
            <div className={styles.topBar}>
                <div className={styles.progress}>
                    Question {currentQuestionIndex + 1} / {questions.length}
                </div>
                <div className={`${styles.timer} ${timeLeft < 300 ? styles.timerWarning : ""}`}>
                    <Timer size={18} />
                    {formatTime(timeLeft)}
                </div>
            </div>

            <Card className={styles.questionCard}>
                <h3 className={styles.questionText}>{currentQ.question_text}</h3>

                <div className={styles.choices}>
                    {currentQ.type === "mcq" && currentQ.choices?.map((choice, idx) => (
                        <label
                            key={idx}
                            className={`${styles.choice} ${answers[currentQ.id] === choice ? styles.selected : ""}`}
                        >
                            <input
                                type="radio"
                                name={currentQ.id}
                                value={choice}
                                checked={answers[currentQ.id] === choice}
                                onChange={() => handleAnswer(choice)}
                                className={styles.radio}
                            />
                            <span className={styles.choiceText}>{choice}</span>
                        </label>
                    ))}

                    {currentQ.type === "text" && (
                        <textarea
                            className={styles.textArea}
                            value={answers[currentQ.id] || ""}
                            onChange={(e) => handleAnswer(e.target.value)}
                            placeholder="Type your answer here..."
                        />
                    )}
                </div>
            </Card>

            <div className={styles.footer}>
                <Button
                    variant="outline"
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                >
                    <ChevronLeft size={16} /> Previous
                </Button>

                {isLast ? (
                    <Button
                        variant="primary"
                        onClick={() => handleSubmit()}
                        isLoading={isSubmitting}
                        className={styles.submitBtn}
                    >
                        Submit Exam
                    </Button>
                ) : (
                    <Button
                        variant="secondary"
                        onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                    >
                        Next <ChevronRight size={16} />
                    </Button>
                )}
            </div>
        </div>
    );
};
