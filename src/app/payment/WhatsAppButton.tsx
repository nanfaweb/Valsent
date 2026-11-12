'use client';

import styles from './payment.module.css';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
    email: string;
    planName: string;
    referenceCode: string;
}

export default function WhatsAppButton({ email, planName, referenceCode }: WhatsAppButtonProps) {
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '';
    const message = encodeURIComponent(
        `Hi, I have made the payment for Valsent ${planName}.\nReference: ${referenceCode}\nEmail: ${email}\nI will attach my payment screenshot below. Please activate my account.`
    );
    const href = `https://wa.me/${whatsappNumber}?text=${message}`;

    return (
        <section className={styles.ctaSection}>
            <h2 className={styles.sectionTitle}>Step 3 — Send us the screenshot</h2>
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.whatsappBtn}
            >
                <MessageCircle size={20} />
                I&apos;ve Paid — Message Us on WhatsApp
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
