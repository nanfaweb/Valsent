'use client';

import { useState, useCallback } from 'react';
import { getAllPurchases, type PurchaseRow, type AdminStats } from './actions';
import styles from './admin.module.css';

import AdminStatsBar from './AdminStatsBar';
import AdminSearchUser from './AdminSearchUser';
import AdminPurchasesTable from './AdminPurchasesTable';

interface AdminDashboardProps {
    initialStats: AdminStats;
    initialPurchases: PurchaseRow[];
    whatsappNumber: string;
}

export default function AdminDashboard({
    initialStats,
    initialPurchases,
    whatsappNumber,
}: AdminDashboardProps) {
    const [purchases, setPurchases] = useState(initialPurchases);

    const handlePurchasesUpdate = useCallback(async () => {
        const updatedPurchases = await getAllPurchases();
        setPurchases(updatedPurchases);
    }, []);

    return (
        <div className={styles.dashboard}>
            {/* Stats Bar Component */}
            <AdminStatsBar stats={initialStats} whatsappNumber={whatsappNumber} />

            {/* Search Section Component */}
            <AdminSearchUser onGrantSuccess={handlePurchasesUpdate} />

            {/* Purchases Table Component */}
            <AdminPurchasesTable purchases={purchases} onRevokeSuccess={handlePurchasesUpdate} />
        </div>
    );
}
