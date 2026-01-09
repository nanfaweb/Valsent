import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import styles from './UpgradePrompt.module.css';
import { Sparkles, Check } from 'lucide-react';

export const UpgradePrompt = () => {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Sparkles className={styles.sparkle} size={24} />
                <h2 className={styles.title}>Unlock All Mock Exams</h2>
            </div>

            <div className={styles.pricing}>
                <span className={styles.originalPrice}>PKR 3,499</span>
                <span className={styles.currentPrice}>PKR 2,999</span>
            </div>

            <p className={styles.subtitle}>One-time payment • Lifetime access</p>

            <ul className={styles.features}>
                <li className={styles.feature}>
                    <Check className={styles.checkIcon} size={16} />
                    <span>50+ comprehensive mock exams</span>
                </li>
                <li className={styles.feature}>
                    <Check className={styles.checkIcon} size={16} />
                    <span>Detailed performance analytics</span>
                </li>
                <li className={styles.feature}>
                    <Check className={styles.checkIcon} size={16} />
                    <span>Unlimited practice attempts</span>
                </li>
            </ul>

            <Link href="/pricing" className={styles.ctaLink}>
                <Button size="lg" className={styles.cta}>
                    Get Full Access Now
                </Button>
            </Link>
        </div>
    );
};
