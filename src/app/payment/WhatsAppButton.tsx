'use client';

import styles from './payment.module.css';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
    email: string;
    planName: string;
}

export default function WhatsAppButton({ email, planName }: WhatsAppButtonProps) {
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '';
    const message = encodeURIComponent(
        `Hi, I have made the payment for Valsent ${planName}. My registered email is: ${email}. Please activate my account.`
    );
    const href = `https://wa.me/${whatsappNumber}?text=${message}`;

    return (
        <section className={styles.ctaSection}>
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.whatsappBtn}
            >
                <MessageCircle size={20} />
                I&apos;ve Paid — Notify Us on WhatsApp
            </a>
            <p className={styles.ctaNote}>
                We verify and activate accounts within a few hours during business hours.
            </p>
            <p className={styles.ctaSecondary}>
                After activation, refresh this page or log out and back in.
            </p>
        </section>
    );
}
