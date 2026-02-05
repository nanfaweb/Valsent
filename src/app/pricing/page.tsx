import { PricingCard } from "@/components/ui/PricingCard";
import styles from "./page.module.css";
import { CheckCircle, Gift, RotateCcw, Sparkles } from "lucide-react";

export default function PricingPage() {
    return (
        <main className={styles.main}>
            <section className={styles.hero}>
                <h1>Invest in Your Future</h1>
                <p>Get unlimited access to premium entry test preparation material.</p>
            </section>

            <div className={styles.container}>
                <div className={styles.trialCard}>
                    <div className={styles.trialHeader}>
                        <div className={styles.trialBadge}>
                            <Gift size={16} />
                            <span>Free Trial Available</span>
                        </div>
                        <h2>One Free Trial Exam</h2>
                        <p>Get a taste of our premium preparation material by creating an account today.</p>
                    </div>
                    <div className={styles.trialFeatures}>
                        <div className={styles.trialFeature}>
                            <Sparkles className={styles.trialIcon} />
                            <div>
                                <h3>Full Access Mock</h3>
                                <p>Experience one complete, timed mock exam exactly like the real thing.</p>
                            </div>
                        </div>
                        <div className={styles.trialFeature}>
                            <RotateCcw className={styles.trialIcon} />
                            <div>
                                <h3>Unlimited Retakes</h3>
                                <p>Review your performance and retake the trial exam as many times as you want.</p>
                            </div>
                        </div>
                    </div>
                </div>

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
                                <h3>Section-wise Practice Questions</h3>
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

                <div className={styles.pricingGrid}>
                    <PricingCard type="bcs" isCheckout={true} />
                    <PricingCard type="bba" isCheckout={true} />
                </div>
            </div>
        </main>
    );
}
