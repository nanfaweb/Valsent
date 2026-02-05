"use client";

import Link from "next/link";
import { Button } from "./Button";
import { Card } from "./Card";
import styles from "./PricingCard.module.css";
import { Check, Lock } from "lucide-react";
import { CheckoutButton } from "./CheckoutButton";
import { useAuth } from "@/context/AuthContext";

interface PricingCardProps {
    isCheckout?: boolean;
    type?: 'trial' | 'bba' | 'bcs';
}

export const PricingCard = ({ isCheckout = false, type = 'bba' }: PricingCardProps) => {
    const { user } = useAuth();
    const isTrial = type === 'trial';

    const getContent = () => {
        switch (type) {
            case 'trial':
                return {
                    badge: "Free Starter",
                    title: "Free Trial Exam",
                    description: "Get a taste of our premium preparation material.",
                    price: "Zero.",
                    currency: "PKR",
                    original: null,
                    features: [
                        "1 Full-Length Mock Exam",
                        "Performance Analytics",
                        "Section-wise Practice",
                        "Unlimited Retakes",
                        "Account required"
                    ],
                    cta: (
                        <Link href={user ? "/dashboard" : "/auth/signup"} style={{ width: '100%' }}>
                            <Button size="lg" className={styles.button} variant="outline"> Start Free </Button>
                        </Link>
                    )
                };
            case 'bba':
                return {
                    badge: "Coming Soon",
                    title: "BBA Access Pass",
                    description: "Everything you need to ace your entrance exam.",
                    price: "2,999",
                    currency: "PKR",
                    original: "PKR 3,499",
                    features: [
                        "10+ Mock Exams with Free Trial",
                        "Performance Analytics",
                        "Section-wise Practice",
                        "Real Exam Simulation",
                        "24/7 Access"
                    ],
                    isLocked: true,
                    cta: null
                };
            case 'bcs':
                return {
                    badge: "Most Popular",
                    title: "BCS Access Pass",
                    description: "Everything you need to ace your entrance exam.",
                    price: "2,999",
                    currency: "PKR",
                    original: "PKR 3,499",
                    features: [
                        "10+ Mock Exams with Free Trial",
                        "Detailed Performance Analytics",
                        "Section-wise Practice",
                        "Real Exam Simulation",
                        "24/7 Access"
                    ],
                    isLocked: false,
                    cta: isCheckout ? (
                        <CheckoutButton />
                    ) : (
                        <Link href="/pricing" style={{ width: '100%' }}>
                            <Button size="lg" className={styles.button}> Enroll Now </Button>
                        </Link>
                    )
                };
            default:
                return {
                    badge: "",
                    title: "",
                    description: "",
                    price: "",
                    currency: "",
                    original: null,
                    features: [],
                    isLocked: false,
                    cta: null
                };
        }
    };

    const content = getContent();

    return (
        <Card className={`${styles.container} ${isTrial ? styles.trial : ''} ${content.isLocked ? styles.soon : ''}`}>
            {content.badge && (
                <div className={`${styles.badge} ${content.isLocked ? styles.lockedBadge : ''}`}>
                    {content.isLocked && <Lock size={12} />}
                    {content.badge}
                </div>
            )}
            <h3 className={styles.title}>{content.title}</h3>
            <p className={styles.description}>{content.description}</p>

            {content.isLocked ? (
                <div className={styles.lockedContent}>
                    <Lock size={64} className={styles.mainLock} />
                    <p className={styles.lockCaption}>Stay tuned for Round 2</p>
                </div>
            ) : (
                <>
                    <div className={styles.price}>
                        {content.currency && <span className={styles.currency}>{content.currency}</span>}
                        <span className={styles.amount}>{content.price}</span>
                        {content.original && <span className={styles.original}>{content.original}</span>}
                    </div>

                    <ul className={styles.features}>
                        {content.features.map((feature, i) => (
                            <li key={i} className={styles.feature}>
                                <Check size={18} className={styles.check} />
                                {feature}
                            </li>
                        ))}
                    </ul>

                    {content.cta && (
                        <div className={styles.cta}>
                            {content.cta}
                        </div>
                    )}
                </>
            )}
        </Card>
    );
};
