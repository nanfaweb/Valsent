import { Clock, Target, TrendingUp } from 'lucide-react';
import styles from './TrialResultCard.module.css';

interface TrialResultCardProps {
    score: number;
    totalQuestions: number;
    timeTaken: number; // in seconds
    percentile?: number;
    averageScore?: number;
    averageTime?: number;
}

export const TrialResultCard = ({
    score,
    totalQuestions,
    timeTaken,
    percentile,
    averageScore = 65,
    averageTime = 45,
}: TrialResultCardProps) => {
    const scorePercentage = Math.round((score / totalQuestions) * 100);
    const timeInMinutes = Math.floor(timeTaken / 60);

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Your Trial Performance</h2>

            <div className={styles.mainScore}>
                <div className={styles.scoreCircle}>
                    <svg className={styles.progressRing} viewBox="0 0 120 120">
                        <circle
                            className={styles.progressBackground}
                            cx="60"
                            cy="60"
                            r="54"
                            fill="none"
                            strokeWidth="8"
                        />
                        <circle
                            className={styles.progressForeground}
                            cx="60"
                            cy="60"
                            r="54"
                            fill="none"
                            strokeWidth="8"
                            strokeDasharray={`${scorePercentage * 3.39} 339`}
                            strokeLinecap="round"
                            transform="rotate(-90 60 60)"
                        />
                    </svg>
                    <div className={styles.scoreText}>
                        <span className={styles.scoreValue}>{scorePercentage}%</span>
                        <span className={styles.scoreLabel}>{score}/{totalQuestions}</span>
                    </div>
                </div>
            </div>

            <div className={styles.metrics}>
                <div className={styles.metric}>
                    <Clock className={styles.icon} size={20} />
                    <div>
                        <p className={styles.metricLabel}>Time Taken</p>
                        <p className={styles.metricValue}>{timeInMinutes} mins</p>
                    </div>
                </div>

                {percentile !== undefined && (
                    <div className={styles.metric}>
                        <TrendingUp className={styles.icon} size={20} />
                        <div>
                            <p className={styles.metricLabel}>Percentile</p>
                            <p className={styles.metricValue}>Top {100 - percentile}%</p>
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.benchmark}>
                <h3 className={styles.benchmarkTitle}>Benchmark</h3>
                <div className={styles.benchmarkGrid}>
                    <div className={styles.benchmarkItem}>
                        <Target className={styles.benchmarkIcon} size={16} />
                        <span className={styles.benchmarkLabel}>Average score:</span>
                        <span className={styles.benchmarkValue}>{averageScore}%</span>
                    </div>
                    <div className={styles.benchmarkItem}>
                        <Clock className={styles.benchmarkIcon} size={16} />
                        <span className={styles.benchmarkLabel}>Ideal time:</span>
                        <span className={styles.benchmarkValue}>{averageTime} mins</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
