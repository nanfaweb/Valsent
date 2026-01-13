import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import styles from "./TestPlayer.module.css";
import { Timer, CheckCircle, ChevronRight, ChevronLeft, Menu, X, Flag, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

type Question = {
    id: string;
    type: "mcq" | "text" | "math" | "eng";
    question_text: string;
    choices?: string[];
    correct_answer: string;
    section?: string;
};

type Exam = {
    id: string;
    title: string;
    duration_minutes: number;
};

interface TestPlayerProps {
    exam: Exam;
    questions: Question[];
    attemptId?: string;
}

export const TestPlayer = ({ exam, questions, attemptId }: TestPlayerProps) => {
    const { user } = useAuth();
    const router = useRouter();

    const sections = ["Mathematics", "English"];

    const [currentSection, setCurrentSection] = useState<string>("Mathematics");
    const [sectionLocks, setSectionLocks] = useState<Record<string, boolean>>({
        Mathematics: false,
        English: true
    });

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timeLeft, setTimeLeft] = useState(exam.duration_minutes * 60);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [score, setScore] = useState(0);

    // UI States
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showSectionModal, setShowSectionModal] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);

    const activeQuestions = questions.filter(q => (q.section || 'Mathematics') === currentSection);

    useEffect(() => {
        setCurrentQuestionIndex(0);
    }, [currentSection]);

    useEffect(() => {
        async function loadProgress() {
            if (!attemptId) return;

            const { data: attempt } = await supabase
                .from("attempts")
                .select("answers, remaining_seconds, current_question_index, status, current_section, section_locked")
                .eq("id", attemptId)
                .single();

            if (attempt) {
                if (attempt.answers) setAnswers(attempt.answers);
                if (attempt.remaining_seconds) setTimeLeft(attempt.remaining_seconds);
                if (attempt.current_section) setCurrentSection(attempt.current_section);
                if (attempt.section_locked) setSectionLocks(attempt.section_locked);
            }
        }
        loadProgress();
    }, [attemptId]);

    useEffect(() => {
        if (isFinished) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    confirmSubmitExam();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [isFinished]);

    useEffect(() => {
        if (!isFinished && attemptId) {
            const saveToDb = async () => {
                await supabase
                    .from("attempts")
                    .update({
                        answers,
                        remaining_seconds: timeLeft,
                        current_question_index: currentQuestionIndex,
                        current_section: currentSection,
                        section_locked: sectionLocks,
                        last_saved_at: new Date().toISOString()
                    })
                    .eq("id", attemptId);
            };
            const timeoutId = setTimeout(saveToDb, 1000);
            return () => clearTimeout(timeoutId);
        }
    }, [answers, timeLeft, currentQuestionIndex, isFinished, attemptId, currentSection, sectionLocks]);

    const handleAnswer = (val: string) => {
        const qId = activeQuestions[currentQuestionIndex].id;
        setAnswers((prev) => {
            const newAnswers = { ...prev };
            // Deselection logic using radio-like behavior
            if (newAnswers[qId] === val) {
                delete newAnswers[qId]; // Remove answer if clicked again
            } else {
                newAnswers[qId] = val;
            }
            return newAnswers;
        });
    };

    const calculateScore = () => {
        let correct = 0;
        questions.forEach((q) => {
            if (answers[q.id] === q.correct_answer) {
                correct += 4;
            }
        });
        return correct;
    };

    const handleSubmitSection = () => {
        if (sections.indexOf(currentSection) < sections.length - 1) {
            setShowSectionModal(true);
        } else {
            setShowSubmitModal(true);
        }
    };

    const confirmSubmitSection = async () => {
        setShowSectionModal(false);
        const newLocks = { ...sectionLocks, [currentSection]: true };
        const nextSectionIndex = sections.indexOf(currentSection) + 1;

        if (nextSectionIndex < sections.length) {
            const nextSection = sections[nextSectionIndex];
            newLocks[nextSection] = false;
            setSectionLocks(newLocks);
            setCurrentSection(nextSection);

            if (attemptId) {
                try {
                    const { submitSection } = await import("@/app/exam/actions");
                    await submitSection(attemptId, currentSection, nextSection);
                } catch (err) {
                    console.error("Failed to submit section:", err);
                }
            }
        }
    };

    const confirmSubmitExam = useCallback(async () => {
        setShowSubmitModal(false);
        if (isSubmitting || isFinished) return;
        setIsSubmitting(true);

        const finalScore = calculateScore();
        setScore(finalScore);
        setIsFinished(true);

        try {
            if (user && attemptId) {
                const { submitExam } = await import("@/app/exam/actions");
                await submitExam(attemptId, answers, timeLeft);
            }
        } catch (error) {
            console.error("Failed to submit:", error);
        } finally {
            setIsSubmitting(false);
        }
    }, [answers, isFinished, isSubmitting, questions, user, attemptId, timeLeft]);

    const handleSaveAndExit = () => {
        // Triggered by "Save & Exit" button
        setShowSaveModal(true);
    };

    const confirmExit = () => {
        // Logic to simply route away, as auto-save handles the data
        router.push("/dashboard");
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        if (h > 0) {
            return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
        }
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    if (isFinished) {
        return (
            <Card className={styles.resultCard}>
                <CheckCircle size={48} className={styles.successIcon} />
                <h2>Exam Submitted!</h2>
                <div className={styles.scoreDisplay}>
                    <span className={styles.scoreLabel}>Your Score</span>
                    <span className={styles.scoreValue}>{score} / {questions.length * 4}</span>
                </div>
                <p>Percentage: {Math.round((score / (questions.length * 4)) * 100)}%</p>
                <div className={styles.actions}>
                    <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
                </div>
            </Card>
        );
    }

    if (!activeQuestions || activeQuestions.length === 0) {
        if (currentSection === "English") {
            return (
                <div className={styles.playerContainer}>
                    <div className={styles.topBar}>
                        <h3 style={{ margin: 0 }}>Section: {currentSection}</h3>
                        <div className={styles.timer}>{formatTime(timeLeft)}</div>
                    </div>
                    <Card className={styles.questionCard}>
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <h3>English Section Coming Soon</h3>
                            <p>This section is not yet available.</p>
                        </div>
                    </Card>
                </div>
            );
        }
        return <div className={styles.error}>No questions found for {currentSection}.</div>;
    }

    const currentQ = activeQuestions[currentQuestionIndex];
    const isLastInList = currentQuestionIndex === activeQuestions.length - 1;
    const isLastSection = sections.indexOf(currentSection) === sections.length - 1;

    return (
        <div className={styles.playerContainer}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.examTitle}>{exam.title}</h1>
                    <div className={styles.sectionBadge}>{currentSection}</div>
                </div>
                <div className={styles.headerRight}>
                    <div className={`${styles.timer} ${timeLeft < 300 ? styles.timerWarning : ""}`}>
                        <Timer size={18} />
                        {formatTime(timeLeft)}
                    </div>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleSaveAndExit}
                        className={styles.saveExitBtn}
                    >
                        <Save size={18} style={{ marginRight: "4px" }} /> Save & Exit
                    </Button>
                </div>
            </div>

            <div className={styles.mainContent}>
                {/* Sidebar Navigation (Desktop) / Dropdown (Mobile) */}
                <div className={`${styles.navPanel} ${isMenuOpen ? styles.navPanelOpen : ''}`}>
                    <div className={styles.navHeader}>
                        <h3>Questions</h3>
                        <button className={styles.closeNav} onClick={() => setIsMenuOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>
                    <div className={styles.questionGrid}>
                        {activeQuestions.map((q, idx) => {
                            const isAnswered = !!answers[q.id];
                            const isCurrent = currentQuestionIndex === idx;
                            return (
                                <button
                                    key={q.id}
                                    className={`${styles.navItem} ${isAnswered ? styles.navItemAnswered : ''} ${isCurrent ? styles.navItemCurrent : ''}`}
                                    onClick={() => {
                                        setCurrentQuestionIndex(idx);
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    {idx + 1}
                                </button>
                            );
                        })}
                    </div>
                    <div className={styles.navLegend}>
                        <div className={styles.legendItem}><span className={styles.dotCurrent}></span> Current</div>
                        <div className={styles.legendItem}><span className={styles.dotAnswered}></span> Answered</div>
                        <div className={styles.legendItem}><span className={styles.dotUnanswered}></span> Unanswered</div>
                    </div>
                </div>

                {/* Mobile Menu Toggle */}
                <button className={styles.menuToggle} onClick={() => setIsMenuOpen(true)}>
                    <Menu size={24} />
                    <span>Question List</span>
                </button>

                {/* Question Area */}
                <div className={styles.questionArea}>
                    <Card className={styles.questionCard}>
                        <div className={styles.questionHeader}>
                            <span className={styles.qNumber}>Question {currentQuestionIndex + 1} of {activeQuestions.length}</span>
                            <div className={styles.questionNav}>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    disabled={currentQuestionIndex === 0}
                                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                                    className={styles.navBtnSmall}
                                >
                                    <ChevronLeft size={16} />
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    disabled={currentQuestionIndex === activeQuestions.length - 1}
                                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                                    className={styles.navBtnSmall}
                                >
                                    <ChevronRight size={16} />
                                </Button>
                            </div>
                        </div>

                        <h3 className={styles.questionText}>{currentQ.question_text}</h3>

                        <div className={styles.choices}>
                            {["mcq", "math", "eng"].includes(currentQ.type) && currentQ.choices?.map((choice, idx) => (
                                <div
                                    key={idx}
                                    className={`${styles.choice} ${answers[currentQ.id] === choice ? styles.selected : ""}`}
                                    onClick={() => handleAnswer(choice)}
                                >
                                    <div className={styles.radioWrapper}>
                                        <div className={`${styles.fakeRadio} ${answers[currentQ.id] === choice ? styles.fakeRadioChecked : ""}`}></div>
                                    </div>
                                    <span className={styles.choiceText}>{choice}</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {isLastInList && (
                        <div className={styles.footer}>
                            <Button
                                variant="primary"
                                onClick={handleSubmitSection}
                                isLoading={isSubmitting}
                                className={styles.submitBtn}
                            >
                                {isLastSection ? "Submit Exam" : `Submit Section`} <ChevronRight size={16} />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Save & Exit Modal */}
            {showSaveModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3>Save & Exit?</h3>
                            <button onClick={() => setShowSaveModal(false)}><X size={20} /></button>
                        </div>
                        <div className={styles.modalBody}>
                            <p>Your progress will be saved automatically. You can resume this exam later from the Dashboard. The timer will pause.</p>
                        </div>
                        <div className={styles.modalFooter}>
                            <Button variant="outline" onClick={() => setShowSaveModal(false)}>Cancel</Button>
                            <Button variant="primary" onClick={confirmExit}>Confirm Exit</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Section Submission Modal */}
            {showSectionModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3>Proceed to English Section?</h3>
                            <button onClick={() => setShowSectionModal(false)}><X size={20} /></button>
                        </div>
                        <div className={styles.modalBody}>
                            <p>Are you sure you want to proceed to the English section? You will not be able to return to the Mathematics section after this.</p>
                        </div>
                        <div className={styles.modalFooter}>
                            <Button variant="outline" onClick={() => setShowSectionModal(false)}>Cancel</Button>
                            <Button variant="primary" onClick={confirmSubmitSection}>Confirm & Proceed</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Exam Submission Modal */}
            {showSubmitModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3>Submit Exam?</h3>
                            <button onClick={() => setShowSubmitModal(false)}><X size={20} /></button>
                        </div>
                        <div className={styles.modalBody}>
                            <p>Are you sure you want to submit the exam and see your results?</p>
                        </div>
                        <div className={styles.modalFooter}>
                            <Button variant="outline" onClick={() => setShowSubmitModal(false)}>Cancel</Button>
                            <Button variant="primary" onClick={confirmSubmitExam}>Submit Exam</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
