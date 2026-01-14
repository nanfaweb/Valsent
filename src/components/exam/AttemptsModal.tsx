"use client";

import { useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import styles from "./AttemptsModal.module.css";

interface Attempt {
    id: string;
    score: number;
    started_at: string;
    finished_at: string;
}

interface Mock {
    id: string;
    title: string;
}

interface AttemptsModalProps {
    isOpen: boolean;
    onClose: () => void;
    mock: Mock;
    attempts: Attempt[];
}

export default function AttemptsModal({
    isOpen,
    onClose,
    mock,
    attempts,
}: AttemptsModalProps) {
    const handleBackdropClick = useCallback(
        (e: React.MouseEvent) => {
            if (e.target === e.currentTarget) {
                onClose();
            }
        },
        [onClose]
    );

    if (!isOpen) return null;

    return (
        <div className={styles.backdrop} onClick={handleBackdropClick}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{mock.title}</h2>
                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        ✕
                    </button>
                </div>

                <div className={styles.content}>
                    {attempts.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>No attempts found for this exam.</p>
                        </div>
                    ) : (
                        <div className={styles.attemptsList}>
                            {attempts.map((attempt, index) => {
                                const percentage = attempt.score
                                    ? Math.round((attempt.score / 360) * 100)
                                    : 0;

                                const performanceLevel =
                                    percentage >= 80
                                        ? "excellent"
                                        : percentage >= 60
                                        ? "good"
                                        : percentage >= 40
                                        ? "average"
                                        : "poor";

                                const formatDate = (date: Date): string => {
                                    return new Intl.DateTimeFormat("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    }).format(date);
                                };

                                const formatTime = (
                                    started: string,
                                    finished: string
                                ): string => {
                                    const start = new Date(started);
                                    const end = new Date(finished);
                                    const diff = Math.floor(
                                        (end.getTime() - start.getTime()) / 1000
                                    );
                                    const minutes = Math.floor(diff / 60);
                                    const seconds = diff % 60;
                                    return `${minutes}m ${seconds}s`;
                                };

                                return (
                                    <div
                                        key={attempt.id}
                                        className={styles.attemptCard}
                                    >
                                        <div className={styles.attemptInfo}>
                                            <div className={styles.attemptHeader}>
                                                <div className={styles.attemptTitleSection}>
                                                    <span
                                                        className={styles.attemptLabel}
                                                    >
                                                        Attempt {attempts.length - index}
                                                    </span>
                                                    <span
                                                        className={`${styles.badge} ${styles[performanceLevel]}`}
                                                    >
                                                        {performanceLevel ===
                                                        "excellent"
                                                            ? "Excellent"
                                                            : performanceLevel ===
                                                              "good"
                                                            ? "Good"
                                                            : performanceLevel ===
                                                              "average"
                                                            ? "Average"
                                                            : "Needs Work"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className={styles.scoreRow}>
                                                <div className={styles.score}>
                                                    <span
                                                        className={
                                                            styles.scoreNumber
                                                        }
                                                    >
                                                        {attempt.score || 0}
                                                    </span>
                                                    <span
                                                        className={
                                                            styles.scoreTotal
                                                        }
                                                    >
                                                        /360
                                                    </span>
                                                </div>
                                            </div>

                                            <span className={styles.timeInfo}>
                                                ⏱ Time:{" "}
                                                {formatTime(
                                                    attempt.started_at,
                                                    attempt.finished_at
                                                )}
                                            </span>
                                        </div>

                                        <div className={styles.attemptFooter}>
                                            <span
                                                className={styles.attemptDate}
                                            >
                                                {formatDate(
                                                    new Date(attempt.finished_at)
                                                )}
                                            </span>
                                        </div>

                                        <div className={styles.reviewButton}>
                                            <Link href={`/exam/results/${attempt.id}`}>
                                                <Button
                                                    size="sm"
                                                    style={{
                                                        background: "#5F002A",
                                                        color: "white",
                                                    }}
                                                >
                                                    Review
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className={styles.footer}>
                    <Link href={`/exam/${mock.id}/rules`}>
                        <Button
                            size="lg"
                            style={{
                                background: "#5F002A",
                                color: "white",
                                width: "100%",
                            }}
                        >
                            Retake Exam
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
