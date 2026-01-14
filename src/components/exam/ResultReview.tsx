"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import styles from "./ResultReview.module.css";

interface Question {
    id: string;
    question_text: string;
    choices?: string[];
    correct_answer: string;
    type: "mcq" | "text" | "math" | "eng";
    section?: string;
}

interface ResultReviewProps {
    questions: Question[];
    answers: Record<string, string>;
    score: number;
    timeTaken: number; // in seconds
    onBackToDashboard: () => void;
    onBackToOverview: () => void;
}

interface ExpandedState {
    [key: string]: boolean;
}

export const ResultReview = ({
    questions,
    answers,
    score,
    timeTaken,
    onBackToDashboard,
    onBackToOverview,
}: ResultReviewProps) => {
    const [expandedQuestions, setExpandedQuestions] = useState<ExpandedState>({});

    const toggleQuestion = (questionId: string) => {
        setExpandedQuestions((prev) => ({
            ...prev,
            [questionId]: !prev[questionId],
        }));
    };

    const totalMarks = questions.length * 4;
    const percentage = Math.round((score / totalMarks) * 100);
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        if (h > 0) {
            return `${h}h ${m}m ${s}s`;
        }
        return `${m}m ${s}s`;
    };

    const getScoreColor = (pct: number) => {
        if (pct >= 80) return styles.excellent;
        if (pct >= 60) return styles.good;
        if (pct >= 40) return styles.average;
        return styles.poor;
    };

    // Group questions by section
    const groupedQuestions = questions.reduce((acc, q) => {
        const section = q.section || "General";
        if (!acc[section]) {
            acc[section] = [];
        }
        acc[section].push(q);
        return acc;
    }, {} as Record<string, Question[]>);

    const sectionOrder = ["Mathematics", "English"];
    const sortedSections = sectionOrder.filter((s) => groupedQuestions[s]);

    return (
        <div className={styles.container}>
            {/* Header Card */}
            <div className={styles.headerCard}>
                <div className={styles.successBadge}>✓</div>
                <h1 className={styles.title}>Exam Results</h1>
                <p className={styles.subtitle}>Here&apos;s how you performed</p>

                {/* Score Summary */}
                <div className={styles.scoreSummary}>
                    <div className={`${styles.scoreBox} ${getScoreColor(percentage)}`}>
                        <div className={styles.scoreCircle}>
                            <span className={styles.scoreValue}>{percentage}%</span>
                        </div>
                        <div className={styles.scoreDetails}>
                            <p className={styles.scoreMarks}>{score} of {totalMarks} marks</p>
                            <p className={styles.scoreLabel}>Total Score</p>
                        </div>
                    </div>

                    <div className={styles.statsContainer}>
                        <div className={styles.stat}>
                            <Clock size={20} className={styles.statIcon} />
                            <div>
                                <p className={styles.statLabel}>Time Taken</p>
                                <p className={styles.statValue}>{formatTime(timeTaken)}</p>
                            </div>
                        </div>

                        <div className={styles.stat}>
                            <div className={styles.statIconBox}>
                                <span>Q</span>
                            </div>
                            <div>
                                <p className={styles.statLabel}>Questions</p>
                                <p className={styles.statValue}>{questions.length}</p>
                            </div>
                        </div>

                        <div className={styles.stat}>
                            <div className={styles.statIconBox}>
                                <span>✓</span>
                            </div>
                            <div>
                                <p className={styles.statLabel}>Correct</p>
                                <p className={styles.statValue}>{Math.round(score / 4)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Questions Review Section */}
            <div className={styles.reviewSection}>
                <h2 className={styles.reviewTitle}>Question Review</h2>
                <p className={styles.reviewSubtitle}>
                    Click on any question to see details
                </p>

                {sortedSections.map((section) => (
                    <div key={section} className={styles.sectionGroup}>
                        <div className={styles.sectionHeader}>
                            <h3 className={styles.sectionTitle}>{section}</h3>
                            <span className={styles.questionCount}>
                                {groupedQuestions[section]?.length} questions
                            </span>
                        </div>

                        <div className={styles.questionsList}>
                            {groupedQuestions[section]?.map((question, index) => {
                                const userAnswer = answers[question.id];
                                const isCorrect = userAnswer === question.correct_answer;
                                const isExpanded =
                                    expandedQuestions[question.id] || false;

                                return (
                                    <div
                                        key={question.id}
                                        className={`${styles.questionItem} ${
                                            isExpanded ? styles.expanded : ""
                                        }`}
                                    >
                                        {/* Question Summary */}
                                        <button
                                            className={`${styles.questionSummary} ${
                                                isCorrect
                                                    ? styles.correct
                                                    : styles.incorrect
                                            }`}
                                            onClick={() =>
                                                toggleQuestion(question.id)
                                            }
                                        >
                                            <div className={styles.questionNumber}>
                                                {index + 1}
                                            </div>

                                            <div className={styles.questionInfo}>
                                                <p
                                                    className={
                                                        styles.questionPreview
                                                    }
                                                >
                                                    {question.question_text.substring(
                                                        0,
                                                        60
                                                    )}
                                                    {question.question_text
                                                        .length > 60
                                                        ? "..."
                                                        : ""}
                                                </p>
                                            </div>

                                            <div className={styles.resultIcon}>
                                                {isCorrect ? (
                                                    <CheckCircle2
                                                        size={20}
                                                        className={
                                                            styles.correctIcon
                                                        }
                                                    />
                                                ) : (
                                                    <XCircle
                                                        size={20}
                                                        className={
                                                            styles.wrongIcon
                                                        }
                                                    />
                                                )}
                                            </div>

                                            <div className={styles.toggleIcon}>
                                                {isExpanded ? (
                                                    <ChevronUp size={20} />
                                                ) : (
                                                    <ChevronDown size={20} />
                                                )}
                                            </div>
                                        </button>

                                        {/* Question Details (Expanded) */}
                                        {isExpanded && (
                                            <div className={styles.questionDetails}>
                                                <div className={styles.detailContent}>
                                                    <h4 className={styles.detailTitle}>
                                                        Question
                                                    </h4>
                                                    <p className={styles.detailText}>
                                                        {question.question_text}
                                                    </p>

                                                    {question.choices &&
                                                        question.choices
                                                            .length > 0 && (
                                                            <div
                                                                className={
                                                                    styles.choicesContainer
                                                                }
                                                            >
                                                                <h5
                                                                    className={
                                                                        styles.choicesLabel
                                                                    }
                                                                >
                                                                    Options:
                                                                </h5>
                                                                <div
                                                                    className={
                                                                        styles.choicesList
                                                                    }
                                                                >
                                                                    {question.choices.map(
                                                                        (
                                                                            choice,
                                                                            idx
                                                                        ) => {
                                                                            const isUserAnswer =
                                                                                choice ===
                                                                                userAnswer;
                                                                            const isCorrectAnswer =
                                                                                choice ===
                                                                                question.correct_answer;

                                                                            return (
                                                                                <div
                                                                                    key={idx}
                                                                                    className={`${styles.choice} ${
                                                                                        isUserAnswer
                                                                                            ? styles.userChoice
                                                                                            : ""
                                                                                    } ${
                                                                                        isCorrectAnswer
                                                                                            ? styles.correctChoice
                                                                                            : ""
                                                                                    }`}
                                                                                >
                                                                                    <span
                                                                                        className={
                                                                                            styles.choiceLetter
                                                                                        }
                                                                                    >
                                                                                        {String.fromCharCode(
                                                                                            65 +
                                                                                                idx
                                                                                        )}
                                                                                    </span>
                                                                                    <span
                                                                                        className={
                                                                                            styles.choiceText
                                                                                        }
                                                                                    >
                                                                                        {choice}
                                                                                    </span>
                                                                                    {isCorrectAnswer && (
                                                                                        <CheckCircle2
                                                                                            size={
                                                                                                16
                                                                                            }
                                                                                            className={
                                                                                                styles.correctMark
                                                                                            }
                                                                                        />
                                                                                    )}
                                                                                    {isUserAnswer &&
                                                                                        !isCorrectAnswer && (
                                                                                            <XCircle
                                                                                                size={
                                                                                                    16
                                                                                                }
                                                                                                className={
                                                                                                    styles.wrongMark
                                                                                                }
                                                                                            />
                                                                                        )}
                                                                                </div>
                                                                            );
                                                                        }
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                    {/* Answer Explanation */}
                                                    <div
                                                        className={
                                                            styles.answerSection
                                                        }
                                                    >
                                                        <div
                                                            className={`${styles.answerBox} ${
                                                                isCorrect
                                                                    ? styles.correctAnswer
                                                                    : styles.wrongAnswer
                                                            }`}
                                                        >
                                                            <div
                                                                className={
                                                                    styles.answerLeft
                                                                }
                                                            >
                                                                {isCorrect ? (
                                                                    <>
                                                                        <CheckCircle2
                                                                            size={24}
                                                                            className={
                                                                                styles.correctIcon
                                                                            }
                                                                        />
                                                                        <div>
                                                                            <p
                                                                                className={
                                                                                    styles.answerTitle
                                                                                }
                                                                            >
                                                                                Correct!
                                                                            </p>
                                                                            <p
                                                                                className={
                                                                                    styles.answerPoints
                                                                                }
                                                                            >
                                                                                +4
                                                                                points
                                                                            </p>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <XCircle
                                                                            size={24}
                                                                            className={
                                                                                styles.wrongIcon
                                                                            }
                                                                        />
                                                                        <div>
                                                                            <p
                                                                                className={
                                                                                    styles.answerTitle
                                                                                }
                                                                            >
                                                                                Incorrect
                                                                            </p>
                                                                            <p
                                                                                className={
                                                                                    styles.answerPoints
                                                                                }
                                                                            >
                                                                                Your
                                                                                answer:{" "}
                                                                                {userAnswer ||
                                                                                    "Not answered"}
                                                                            </p>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>

                                                            {!isCorrect && (
                                                                <div
                                                                    className={
                                                                        styles.correctAnswerBox
                                                                    }
                                                                >
                                                                    <p
                                                                        className={
                                                                            styles.correctAnswerLabel
                                                                        }
                                                                    >
                                                                        Correct answer:
                                                                    </p>
                                                                    <p
                                                                        className={
                                                                            styles.correctAnswerValue
                                                                        }
                                                                    >
                                                                        {question.correct_answer}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Action Buttons */}
            <div className={styles.footer}>
                <div className={styles.buttonGroup}>
                    <Button
                        size="lg"
                        onClick={onBackToOverview}
                        className={styles.overviewBtn}
                        variant="secondary"
                    >
                        <ArrowLeft size={18} style={{ marginRight: "0.5rem" }} />
                        Back to Overview
                    </Button>
                    <Button
                        size="lg"
                        onClick={onBackToDashboard}
                        className={styles.dashboardBtn}
                    >
                        <ArrowLeft size={18} style={{ marginRight: "0.5rem" }} />
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        </div>
    );
};
