"use client";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { User, LogOut, Package, CreditCard } from "lucide-react";

export default function AccountPage() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [purchase, setPurchase] = useState<any>(null);

    useEffect(() => {
        async function loadProfile() {
            if (!user) {
                router.push("/auth/signin");
                return;
            }

            // Fetch active purchase
            const { data } = await supabase
                .from("purchases")
                .select("*, plans(name)")
                .eq("user_id", user.id)
                .eq("status", "active")
                .single();

            setPurchase(data);
            setLoading(false);
        }
        loadProfile();
    }, [user, router]);

    const handleSignOut = async () => {
        await signOut();
        router.push("/");
    };

    if (!user) return null;
    if (loading) return <div className={styles.loading}>Loading Profile...</div>;

    return (
        <main className={styles.container}>
            <h1 className={styles.title}>My Account</h1>

            <div className={styles.grid}>
                <div className={styles.sidebar}>
                    <Card className={styles.profileCard}>
                        <div className={styles.avatar}>
                            <User size={48} />
                        </div>
                        <h2 className={styles.name}>{user.user_metadata?.full_name || user.email?.split("@")[0]}</h2>
                        <p className={styles.email}>{user.email}</p>
                        <Button
                            variant="outline"
                            onClick={handleSignOut}
                            className={styles.logoutBtn}
                        >
                            <LogOut size={16} /> Sign Out
                        </Button>
                    </Card>
                </div>

                <div className={styles.content}>
                    <Card className={styles.sectionCard}>
                        <div className={styles.sectionHeader}>
                            <Package className={styles.icon} />
                            <h3>Subscription Status</h3>
                        </div>

                        {purchase ? (
                            <div className={styles.planDetails}>
                                <div className={styles.detailRow}>
                                    <span>Current Plan</span>
                                    <strong>{purchase.plans?.name || "Full Access Pass"}</strong>
                                </div>
                                <div className={styles.detailRow}>
                                    <span>Status</span>
                                    <span className={styles.activeBadge}>Active</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span>Start Date</span>
                                    <span>{new Date(purchase.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.emptyState}>
                                <p>You don't have an active subscription.</p>
                                <div className={styles.actions}>
                                    <Button onClick={() => router.push("/pricing")}>View Plans</Button>
                                </div>
                            </div>
                        )}
                    </Card>

                    {purchase && purchase.paypro_order_id && (
                        <Card className={styles.sectionCard}>
                            <div className={styles.sectionHeader}>
                                <CreditCard className={styles.icon} />
                                <h3>Payment Information</h3>
                            </div>
                            <div className={styles.detailRow}>
                                <span>Order Reference</span>
                                <code className={styles.code}>{purchase.paypro_order_id}</code>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </main>
    );
}
