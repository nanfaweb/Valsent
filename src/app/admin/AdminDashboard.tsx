'use client';

import { useState, useCallback } from 'react';
import {
    getAllPurchases,
    getPaymentRequests,
    type PurchaseRow,
    type PaymentRequestRow,
    type AdminStats,
} from './actions';
import styles from './admin.module.css';

import AdminStatsBar from './AdminStatsBar';
import AdminSearchUser from './AdminSearchUser';
import AdminPurchasesTable from './AdminPurchasesTable';
import AdminPaymentRequests from './AdminPaymentRequests';

interface AdminDashboardProps {
    initialStats: AdminStats;
    initialPurchases: PurchaseRow[];
    initialRequests: PaymentRequestRow[];
    whatsappNumber: string;
}

export default function AdminDashboard({
    initialStats,
    initialPurchases,
    initialRequests,
    whatsappNumber,
}: AdminDashboardProps) {
    const [purchases, setPurchases] = useState(initialPurchases);
    const [requests, setRequests] = useState(initialRequests);

    const handlePurchasesUpdate = useCallback(async () => {
        const [updatedPurchases, updatedRequests] = await Promise.all([
            getAllPurchases(),
            getPaymentRequests(),
        ]);
        setPurchases(updatedPurchases);
        setRequests(updatedRequests);
    }, []);

    return (
        <div className={styles.dashboard}>
            {/* Stats Bar Component */}
            <AdminStatsBar stats={initialStats} whatsappNumber={whatsappNumber} />

            {/* Pending manual payments */}
            <AdminPaymentRequests requests={requests} onChange={handlePurchasesUpdate} />

            {/* Search Section Component */}
            <AdminSearchUser onGrantSuccess={handlePurchasesUpdate} />

            {/* Purchases Table Component */}
            <AdminPurchasesTable purchases={purchases} onRevokeSuccess={handlePurchasesUpdate} />
        </div>
    );
}
