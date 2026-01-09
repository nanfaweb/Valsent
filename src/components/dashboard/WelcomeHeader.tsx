import styles from './WelcomeHeader.module.css';

interface WelcomeHeaderProps {
    userName: string;
}

export const WelcomeHeader = ({ userName }: WelcomeHeaderProps) => {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.greeting}>
                {getGreeting()}, <span className={styles.name}>{userName}</span>
            </h1>
            <p className={styles.subtitle}>Ready to ace your exam?</p>
        </div>
    );
};
