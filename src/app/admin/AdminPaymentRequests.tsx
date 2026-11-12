'use client';

import { useState, useTransition } from 'react';
import {
    approvePaymentRequest,
    rejectPaymentRequest,
    type PaymentRequestRow,
} from './actions';
import styles from './admin.module.css';

interface Props {
    requests: PaymentRequestRow[];
    onChange: () => void | Promise<void>;
}

export default function AdminPaymentRequests({ requests, onChange }: Props) {
    const [busyId, setBusyId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [, startTransition] = useTransition();

    const pending = requests.filter((r) => r.status === 'pending');
    const recent = requests.filter((r) => r.status !== 'pending').slice(0, 10);

    const approve = (r: PaymentRequestRow) => {
        const ok = window.confirm(
            `Approve ${r.userEmail}?\n\nConfirm in the ${r.method} app that TID ${r.txnId} for PKR ${r.amountPkr} arrived.`
        );
        if (!ok) return;
        setBusyId(r.id);
        setError(null);
        startTransition(async () => {
            const res = await approvePaymentRequest(r.id);
            if (!res.success) setError(res.error ?? 'Could not approve.');
            await onChange();
            setBusyId(null);
        });
    };

    const reject = (r: PaymentRequestRow) => {
        const note = window.prompt('Reason shown to the student (optional):', 'Payment not found');
        if (note === null) return;
        setBusyId(r.id);
        setError(null);
        startTransition(async () => {
            const res = await rejectPaymentRequest(r.id, note);
            if (!res.success) setError(res.error ?? 'Could not reject.');
            await onChange();
            setBusyId(null);
        });
    };

    const rows = (list: PaymentRequestRow[], actions: boolean) =>
        list.map((r) => (
            <tr key={r.id}>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
                <td>{r.userEmail}</td>
                <td>{r.referenceCode}</td>
                <td>{r.method}</td>
                <td>{r.txnId}</td>
                <td>{r.senderNumber}</td>
                <td>PKR {r.amountPkr.toLocaleString()}</td>
                <td>
                    {actions ? (
                        <>
                            <button
                                className={styles.grantBtn}
                                disabled={busyId === r.id}
                                onClick={() => approve(r)}
                            >
                                Approve
                            </button>{' '}
                            <button
                                className={styles.revokeBtn}
                                disabled={busyId === r.id}
                                onClick={() => reject(r)}
                            >
                                Reject
                            </button>
                        </>
                    ) : (
                        r.status
                    )}
                </td>
            </tr>
        ));

    return (
        <section className={styles.tableSection}>
            <h2 className={styles.sectionTitle}>Payment requests ({pending.length} pending)</h2>
            {error && <p className={styles.grantMessage}>{error}</p>}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Submitted</th>
                            <th>Student</th>
                            <th>Ref</th>
                            <th>Method</th>
                            <th>TID</th>
                            <th>Paid from</th>
                            <th>Amount</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {pending.length === 0 && (
                            <tr>
                                <td colSpan={8} className={styles.emptyRow}>
                                    No pending requests.
                                </td>
                            </tr>
                        )}
                        {rows(pending, true)}
                        {rows(recent, false)}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
