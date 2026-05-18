import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/utils/supabase/server';
import { getAdminStats, getAllPurchases } from './actions';
import AdminDashboard from './AdminDashboard';
import styles from './admin.module.css';

export const metadata = {
    title: 'Admin — Valsent',
    description: 'Valsent admin dashboard for managing users and purchases.',
};

export default async function AdminPage() {
    // 1. Auth check: must be logged in
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) notFound();

    // 2. Admin check: email must match ADMIN_EMAIL (server-only env var)
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail || user.email !== adminEmail) {
        notFound();
    }

    // 3. Fetch initial data server-side
    const [stats, purchases] = await Promise.all([
        getAdminStats(),
        getAllPurchases(),
    ]);

    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '';

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>Admin Dashboard</h1>
                <AdminDashboard
                    initialStats={stats}
                    initialPurchases={purchases}
                    whatsappNumber={whatsappNumber}
                />
            </div>
        </main>
    );
}
