'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { submitPaymentRequest } from './actions';
import styles from './payment.module.css';

export default function PaymentForm() {
    const router = useRouter();
    const [method, setMethod] = useState('easypaisa');
    const [txnId, setTxnId] = useState('');
    const [senderNumber, setSenderNumber] = useState('');
    const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        startTransition(async () => {
            const result = await submitPaymentRequest({ method, txnId, senderNumber });
            if (result.success) {
                setMessage({
                    ok: true,
                    text: 'Request received. We will verify it and unlock your account shortly.',
                });
                setTxnId('');
                router.refresh();
            } else {
                setMessage({ ok: false, text: result.error ?? 'Something went wrong.' });
            }
        });
    };

    return (
        <form className={styles.paidForm} onSubmit={handleSubmit}>
            <h2 className={styles.sectionTitle}>Step 2 — Enter your payment details</h2>

            <div className={styles.formField}>
                <label htmlFor="method">Paid with</label>
                <select
                    id="method"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className={styles.formInput}
                >
                    <option value="easypaisa">EasyPaisa</option>
                    <option value="jazzcash">JazzCash</option>
                    <option value="bank">Bank transfer</option>
                </select>
            </div>

            <div className={styles.formField}>
                <label htmlFor="txnId">Transaction ID (TID)</label>
                <input
                    id="txnId"
                    type="text"
                    value={txnId}
                    onChange={(e) => setTxnId(e.target.value)}
                    placeholder="e.g. 41234567890"
                    className={styles.formInput}
                    autoComplete="off"
                    required
                />
            </div>

            <div className={styles.formField}>
                <label htmlFor="senderNumber">Mobile number you paid from</label>
                <input
                    id="senderNumber"
                    type="tel"
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                    placeholder="03001234567"
                    className={styles.formInput}
                    required
                />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isPending}>
                {isPending ? <Loader2 size={16} className={styles.spin} /> : 'Submit payment details'}
            </button>

            {message && (
                <p className={message.ok ? styles.formSuccess : styles.formError}>{message.text}</p>
            )}
        </form>
    );
}
