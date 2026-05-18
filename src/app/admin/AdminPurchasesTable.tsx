'use client';

import { useState } from 'react';
import { revokePurchase, type PurchaseRow } from './actions';
import styles from './admin.module.css';

interface AdminPurchasesTableProps {
    purchases: PurchaseRow[];
    onRevokeSuccess: () => void;
}

export default function AdminPurchasesTable({ purchases, onRevokeSuccess }: AdminPurchasesTableProps) {
    const [revokingId, setRevokingId] = useState<string | null>(null);

    const handleRevoke = async (purchaseId: string) => {
        setRevokingId(purchaseId);
        const result = await revokePurchase(purchaseId);
        if (result.success) {
            onRevokeSuccess();
        }
        setRevokingId(null);
    };

    return (
        <section className={styles.tableSection}>
            <h2 className={styles.sectionTitle}>All Purchases</h2>
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Plan</th>
                            <th>Payment Method</th>
                            <th>Granted At</th>
                            <th>Notes</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchases.length === 0 ? (
                            <tr>
                                <td colSpan={7} className={styles.emptyRow}>
                                    No purchases yet.
                                </td>
                            </tr>
                        ) : (
                            purchases.map((p) => (
                                <tr key={p.id}>
                                    <td>{p.userEmail}</td>
                                    <td>{p.planName}</td>
                                    <td>{p.paymentMethod ?? '—'}</td>
                                    <td>
                                        {new Intl.DateTimeFormat('en-PK', {
                                            dateStyle: 'medium',
                                            timeStyle: 'short',
                                        }).format(new Date(p.grantedAt))}
                                    </td>
                                    <td className={styles.notesCell}>{p.notes ?? '—'}</td>
                                    <td>
                                        <span
                                            className={
                                                p.status === 'active'
                                                    ? styles.badgeActive
                                                    : styles.badgeRevoked
                                            }
                                        >
                                            {p.status}
                                        </span>
                                    </td>
                                    <td>
                                        {p.status === 'active' && (
                                            <button
                                                className={styles.revokeBtn}
                                                onClick={() => handleRevoke(p.id)}
                                                disabled={revokingId === p.id}
                                            >
                                                {revokingId === p.id ? '...' : 'Revoke'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
