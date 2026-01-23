import Link from "next/link";
import { Button } from "./Button";
import { Card } from "./Card";
import styles from "./PricingCard.module.css";
import { Check } from "lucide-react";
import { CheckoutButton } from "./CheckoutButton";

export const PricingCard = ({ isCheckout = false }: { isCheckout?: boolean }) => {
    return (
        <Card className={styles.container}>
            <div className={styles.badge}>Most Popular</div>
            <h3 className={styles.title}>Full Access Pass</h3>
            <p className={styles.description}>
                Everything you need to ace your entrance exam.
            </p>

            <div className={styles.price}>
                <span className={styles.currency}>PKR</span>
                <span className={styles.amount}>2,999</span>
                <span className={styles.original}>PKR 3,499</span>
            </div>

            <ul className={styles.features}>
                {[
                    "10+ Mock Exams with Free Trial",
                    "Detailed Performance Analytics",
                    "Subject-wise Practice",
                    "Real Exam Simulation",
                    "24/7 Access"
                ].map((feature, i) => (
                    <li key={i} className={styles.feature}>
                        <Check size={18} className={styles.check} />
                        {feature}
                    </li>
                ))}
            </ul>

            <div className={styles.cta}>
                {isCheckout ? (
                    <CheckoutButton />
                ) : (
                    <Link href="/pricing" style={{ width: '100%' }}>
                        <Button size="lg" className={styles.button}> Enroll Now </Button>
                    </Link>
                )}
            </div>
        </Card>
    );
};
