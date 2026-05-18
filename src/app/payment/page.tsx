import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/utils/supabase/server';
import WhatsAppButton from './WhatsAppButton';
import styles from './payment.module.css';
import { CheckCircle, Smartphone, Building2 } from 'lucide-react';

export const metadata = {
    title: 'Payment — Valsent',
    description: 'Complete your payment to unlock full access to all Valsent mock exams.',
};

export default async function PaymentPage() {
    const supabase = await createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth/signin');

    // Redirect if already purchased
    const { data: purchase } = await supabase
        .from('purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle();

    if (purchase) redirect('/dashboard');

    // Get discipline
    const { data: profile } = await supabase
        .from('profiles')
        .select('discipline')
        .eq('id', user.id)
        .single();

    if (!profile) redirect('/onboarding/discipline');

    const discipline = profile.discipline as 'bba' | 'bcs';
    const disciplineLabel = discipline === 'bba' ? 'BBA' : 'BCS';
    const planName = `${disciplineLabel} Access Pass`;

    // Fetch plan pricing from DB
    const { data: plan } = await supabase
        .from('plans')
        .select('price_pkr, original_price_pkr')
        .eq('name', planName)
        .single();

    const price = plan?.price_pkr ?? 2999;
    const originalPrice = plan?.original_price_pkr ?? 3499;

    const easypaisaNumber = process.env.NEXT_PUBLIC_EASYPAISA_NUMBER ?? '';
    const bankIban = process.env.NEXT_PUBLIC_BANK_IBAN ?? '';
    const bankTitle = process.env.NEXT_PUBLIC_BANK_TITLE ?? '';

    const features = [
        `Access to all ${disciplineLabel} mock exams`,
        'Detailed score breakdowns after each exam',
        'Pause & resume any exam',
        'Performance tracking across attempts',
    ];

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                {/* Hero / Pricing Card */}
                <section className={styles.heroSection}>
                    <h1 className={styles.heroTitle}>Unlock Full Access</h1>
                    <p className={styles.heroSubtitle}>
                        One-time payment. Lifetime access to all mock exams for your discipline.
                    </p>

                    <div className={styles.pricingCard}>
                        <span className={styles.planBadge}>{planName}</span>
                        <div className={styles.priceRow}>
                            <span className={styles.originalPrice}>
                                PKR {originalPrice.toLocaleString()}
                            </span>
                            <span className={styles.currentPrice}>
                                PKR {price.toLocaleString()}
                            </span>
                        </div>
                        <ul className={styles.featureList}>
                            {features.map((f) => (
                                <li key={f} className={styles.featureItem}>
                                    <CheckCircle size={16} className={styles.checkIcon} />
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* Payment Methods */}
                <section className={styles.methodsSection}>
                    <h2 className={styles.sectionTitle}>Choose a Payment Method</h2>
                    <div className={styles.methodsGrid}>
                        {/* EasyPaisa */}
                        <div className={styles.methodCard}>
                            <div className={styles.methodHeader}>
                                <Smartphone size={22} className={styles.methodIcon} />
                                <h3>EasyPaisa</h3>
                            </div>
                            <div className={styles.methodBody}>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Account Number</span>
                                    <span className={styles.detailValue}>{easypaisaNumber}</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Account Name</span>
                                    <span className={styles.detailValue}>Valsent</span>
                                </div>
                            </div>
                            <p className={styles.methodInstruction}>
                                Send PKR {price.toLocaleString()} to the number above, then tap the
                                button below to notify us.
                            </p>
                        </div>

                        {/* Bank Transfer */}
                        <div className={styles.methodCard}>
                            <div className={styles.methodHeader}>
                                <Building2 size={22} className={styles.methodIcon} />
                                <h3>Bank Transfer</h3>
                            </div>
                            <div className={styles.methodBody}>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>IBAN</span>
                                    <span className={styles.detailValue}>{bankIban}</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Account Title</span>
                                    <span className={styles.detailValue}>{bankTitle}</span>
                                </div>
                            </div>
                            <p className={styles.methodInstruction}>
                                Transfer PKR {price.toLocaleString()} to the account above, then
                                tap the button below to notify us.
                            </p>
                        </div>
                    </div>
                </section>

                {/* WhatsApp CTA (Client Component) */}
                <WhatsAppButton email={user.email ?? ''} planName={planName} />
            </div>
        </main>
    );
}
