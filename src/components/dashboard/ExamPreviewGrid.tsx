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
    return (
        <div className={styles.container}>
            {showTitle && (
                <h2 className={styles.sectionTitle}>
                    {locked ? 'Preview: Mock Exams' : 'Available Mock Exams'}
                </h2>
            )}

            <div className={styles.grid}>
                {exams.slice(0, 6).map((exam) => (
                    <div key={exam.id} className={`${styles.card} ${locked ? styles.locked : ''}`}>
                        {locked && (
                            <div className={styles.lockOverlay}>
                                <Lock size={32} />
                                <p>Unlock to access</p>
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
