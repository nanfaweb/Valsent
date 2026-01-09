import { Lock, Clock, FileText } from 'lucide-react';
import styles from './ExamPreviewGrid.module.css';

interface ExamPreview {
    id: string;
    title: string;
    duration: number;
    totalQuestions: number;
    difficulty?: 'easy' | 'medium' | 'hard';
}

interface ExamPreviewGridProps {
    exams: ExamPreview[];
    locked: boolean;
    showTitle?: boolean;
}

const difficultyColors = {
    easy: '#059669',
    medium: '#F59E0B',
    hard: '#DC2626',
};

export const ExamPreviewGrid = ({ exams, locked, showTitle = true }: ExamPreviewGridProps) => {
    // For locked state (non-purchased users), show 4 placeholder cards
    const placeholderExams: ExamPreview[] = [
        {
            id: 'placeholder-1',
            title: 'Advanced Engineering Mock Exam',
            duration: 120,
            totalQuestions: 100,
            difficulty: 'hard' as const,
        },
        {
            id: 'placeholder-2',
            title: 'Medical Entrance Test Preparation',
            duration: 150,
            totalQuestions: 120,
            difficulty: 'hard' as const,
        },
        {
            id: 'placeholder-3',
            title: 'Mathematics & Physics Mock',
            duration: 90,
            totalQuestions: 75,
            difficulty: 'medium' as const,
        },
        {
            id: 'placeholder-4',
            title: 'Chemistry Complete Practice Test',
            duration: 100,
            totalQuestions: 80,
            difficulty: 'medium' as const,
        },
    ];

    // Use placeholders for locked cards, real exams for unlocked
    const displayExams = locked ? placeholderExams : exams.slice(0, 4);

    return (
        <div className={styles.container}>
            {showTitle && (
                <h2 className={styles.sectionTitle}>
                    {locked ? 'Unlock Full Access' : 'Available Mock Exams'}
                </h2>
            )}

            <div className={styles.grid}>
                {displayExams.map((exam) => (
                    <div key={exam.id} className={`${styles.card} ${locked ? styles.locked : ''}`}>
                        {locked && (
                            <div className={styles.lockOverlay}>
                                <div className={styles.lockIcon}>
                                    <Lock size={40} strokeWidth={2} />
                                </div>
                                <p className={styles.lockText}>Premium Content</p>
                            </div>
                        )}

                        <div className={styles.cardContent}>
                            <h3 className={styles.examTitle}>{exam.title}</h3>

                            <div className={styles.meta}>
                                <div className={styles.metaItem}>
                                    <Clock size={16} />
                                    <span>{exam.duration} mins</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <FileText size={16} />
                                    <span>{exam.totalQuestions} questions</span>
                                </div>
                            </div>

                            {exam.difficulty && (
                                <div
                                    className={styles.difficulty}
                                    style={{ backgroundColor: `${difficultyColors[exam.difficulty]}15`, color: difficultyColors[exam.difficulty] }}
                                >
                                    {exam.difficulty.charAt(0).toUpperCase() + exam.difficulty.slice(1)}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {locked && exams.length > 6 && (
                <p className={styles.moreText}>+ {exams.length - 6} more exams available</p>
            )}
        </div>
    );
};
