import { PricingCard } from "@/components/ui/PricingCard";
import styles from "./page.module.css";
import { CheckCircle } from "lucide-react";

export default function PricingPage() {
    return (
        <main className={styles.main}>
            <section className={styles.hero}>
                <h1>Invest in Your Future</h1>
                <p>Get unlimited access to premium entry test preparation material.</p>
            </section>

            <div className={styles.container}>
                <div className={styles.grid}>
                    <div className={styles.details}>
                        <h2>What's included in the Full Access Pass?</h2>
                        <p>Our comprehensive package is designed to give you the edge you need.</p>

                        <ul className={styles.featureList}>
                            <li>
                                <CheckCircle className={styles.icon} />
                                <div>
                                    <h3>10+ Full-Length Mock Exams</h3>
                                    <p>Modeled after actual university entrance tests.</p>
                                </div>
                            </li>
                            <li>
                                <CheckCircle className={styles.icon} />
                                <div>
                                    <h3>Topic-wise Practice Questions</h3>
                                    <p>Master specific subjects with focused question banks.</p>
                                </div>
                            </li>
                            <li>
                                <CheckCircle className={styles.icon} />
                                <div>
                                    <h3>Performance Dashboard</h3>
                                    <p>Track your progress and identify weak areas.</p>
                                </div>
                            </li>
                            <li>
                                <CheckCircle className={styles.icon} />
                                <div>
                                    <h3>Mobile Friendly</h3>
                                    <p>Study on the go, anytime, anywhere.</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div className={styles.cardWrapper}>
                        <PricingCard isCheckout={true} />
                    </div>
                </div>
            </div>
        </main>
    );
}
