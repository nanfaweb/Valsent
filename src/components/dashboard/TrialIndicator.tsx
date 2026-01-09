import styles from './TrialIndicator.module.css';

interface TrialIndicatorProps {
    used: boolean;
    showNoCardRequired?: boolean;
}

export const TrialIndicator = ({ used, showNoCardRequired = false }: TrialIndicatorProps) => {
    return (
        <div className={styles.container}>
            <div className={styles.indicator}>
                <span className={styles.label}>Free trial:</span>
                <span className={used ? styles.valueUsed : styles.valueAvailable}>
                    {used ? '1 / 1 used' : '1 / 1 available'}
                </span>
            </div>
            {showNoCardRequired && !used && (
                <p className={styles.microcopy}>No card required</p>
            )}
        </div>
    );
};
