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
    type?: 'trial' | 'pro' | 'soon';
}

export const PricingCard = ({ isCheckout = false, type = 'pro' }: PricingCardProps) => {
    const { user } = useAuth();
    const isTrial = type === 'trial';
    const isSoon = type === 'soon';

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
                        "Topic-wise Practice",
                        "Unlimited Retakes",
                        "Account required"
                    ],
                    cta: (
                        <Link href={user ? "/dashboard" : "/auth/signup"} style={{ width: '100%' }}>
                            <Button size="lg" className={styles.button} variant="outline"> Start Free </Button>
                        </Link>
                    )
                };
            case 'soon':
                return {
                    badge: "Coming Soon",
                    title: "CS Preparation",
                    description: "Complete preparation plan for IBA CS entry exam.",
                    price: "",
                    currency: "",
                    original: null,
                    features: [],
                    cta: null
                };
            default: // pro
                return {
                    badge: "Most Popular",
                    title: "Full Access Pass",
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
                    cta: isCheckout ? (
                        <CheckoutButton />
                    ) : (
                        <Link href="/pricing" style={{ width: '100%' }}>
                            <Button size="lg" className={styles.button}> Enroll Now </Button>
                        </Link>
                    )
                };
        }
    };

    const content = getContent();

    return (
        <Card className={`${styles.container} ${isSoon ? styles.soon : ''} ${isTrial ? styles.trial : ''}`}>
            {content.badge && <div className={styles.badge}>{content.badge}</div>}
            <h3 className={styles.title}>{content.title}</h3>
            <p className={styles.description}>{content.description}</p>

            {!isSoon && (
                <div className={styles.price}>
                    {content.currency && <span className={styles.currency}>{content.currency}</span>}
                    <span className={styles.amount}>{content.price}</span>
                    {content.original && <span className={styles.original}>{content.original}</span>}
                </div>
            )}

            {isSoon ? (
                <div className={styles.lockedContent}>
                    <Lock size={64} className={styles.mainLock} />
                    <p className={styles.lockCaption}>We'll be with you shortly...</p>
                </div>
            ) : (
                <ul className={styles.features}>
                    {content.features.map((feature, i) => (
                        <li key={i} className={styles.feature}>
                            <Check size={18} className={styles.check} />
                            {feature}
                        </li>
                    ))}
                </ul>
            )}

            {content.cta && (
                <div className={styles.cta}>
                    {content.cta}
                </div>
            )}
        </Card>
    );
};
