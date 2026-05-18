'use client';

import { ShieldCheck, Users, MessageCircle } from 'lucide-react';
import styles from './admin.module.css';
import type { AdminStats } from './actions';

interface AdminStatsBarProps {
    stats: AdminStats;
    whatsappNumber: string;
}

export default function AdminStatsBar({ stats, whatsappNumber }: AdminStatsBarProps) {
    return (
        <div className={styles.statsBar}>
            <div className={styles.statCard}>
                <ShieldCheck size={24} className={styles.statIcon} />
                <div className={styles.statContent}>
                    <span className={styles.statValue}>{stats.totalActivePurchases}</span>
                    <span className={styles.statLabel}>Active Purchases</span>
                </div>
            </div>

            <div className={styles.statCard}>
                <Users size={24} className={styles.statIcon} />
                <div className={styles.statContent}>
                    <span className={styles.statValue}>{stats.totalUsers}</span>
                    <span className={styles.statLabel}>Total Users</span>
                </div>
            </div>

            <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.statCard}
                style={{ textDecoration: 'none' }}
            >
                <MessageCircle size={24} className={styles.statIcon} />
                <div className={styles.statContent}>
                    <span className={styles.statValue}>Check</span>
                    <span className={styles.statLabel}>WhatsApp</span>
                </div>
            </a>
        </div>
    );
}
