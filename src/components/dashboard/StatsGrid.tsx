import { BookOpen, Trophy, Clock, TrendingUp } from 'lucide-react';
import styles from './StatsGrid.module.css';

interface Stat {
    label: string;
    value: string | number;
    icon: 'exams' | 'taken' | 'score' | 'time';
}

interface StatsGridProps {
    stats: Stat[];
}

const iconMap = {
    exams: BookOpen,
    taken: Trophy,
    score: TrendingUp,
    time: Clock,
};

export const StatsGrid = ({ stats }: StatsGridProps) => {
    return (
        <div className={styles.grid}>
            {stats.map((stat, index) => {
                const Icon = iconMap[stat.icon];
                return (
                    <div key={index} className={styles.statCard}>
                        <div className={styles.iconWrapper}>
                            <Icon className={styles.icon} size={24} />
                        </div>
                        <div className={styles.content}>
                            <p className={styles.value}>{stat.value}</p>
                            <p className={styles.label}>{stat.label}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
