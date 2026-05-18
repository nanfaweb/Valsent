'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface UserSearchResult {
    id: string;
    email: string;
    discipline: string;
    trialUsed: boolean;
    purchaseStatus: 'active' | 'none';
}

export interface PurchaseRow {
    id: string;
    userEmail: string;
    planName: string;
    paymentMethod: string | null;
    grantedAt: string;
    notes: string | null;
    status: string;
}

export interface AdminStats {
    totalActivePurchases: number;
    totalUsers: number;
}

/* ------------------------------------------------------------------ */
/*  searchUser — find a user by email and return profile + purchase    */
/* ------------------------------------------------------------------ */

export async function searchUser(
    email: string
): Promise<{ found: false } | { found: true; user: UserSearchResult }> {
    const trimmed = email.toLowerCase().trim();
    if (!trimmed) return { found: false };

    // Use admin API to locate user by email
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
        perPage: 1000,
    });

    if (error) throw new Error(`Failed to list users: ${error.message}`);

    const foundUser = users.find(
        (u) => u.email?.toLowerCase() === trimmed
    );

    if (!foundUser) return { found: false };

    // Profile
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('discipline, trial_used')
        .eq('id', foundUser.id)
        .maybeSingle();

    // Active purchase
    const { data: purchase } = await supabaseAdmin
        .from('purchases')
        .select('id')
        .eq('user_id', foundUser.id)
        .eq('status', 'active')
        .maybeSingle();

    return {
        found: true,
        user: {
            id: foundUser.id,
            email: foundUser.email ?? '',
            discipline: profile?.discipline ?? 'unknown',
            trialUsed: profile?.trial_used ?? false,
            purchaseStatus: purchase ? 'active' : 'none',
        },
    };
}

/* ------------------------------------------------------------------ */
/*  grantAccess — insert a purchase for a user                        */
/* ------------------------------------------------------------------ */

export async function grantAccess(
    userId: string,
    discipline: string,
    paymentMethod: 'easypaisa' | 'bank' | 'other',
    notes: string
): Promise<{ success: boolean; error?: string }> {
    const planId = discipline === 'bba' 
        ? '4f301764-ba16-4b88-ac1f-127d581bc3e4' 
        : '9aa3b281-ecf4-43b5-9319-5eb432a62394';

    const { error } = await supabaseAdmin.from('purchases').insert({
        user_id: userId,
        plan_id: planId,
        granted_by: 'manual',
        payment_method: paymentMethod,
        notes: notes || null,
        status: 'active',
    });

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin');
    return { success: true };
}

/* ------------------------------------------------------------------ */
/*  revokePurchase — set purchase status to 'revoked'                 */
/* ------------------------------------------------------------------ */

export async function revokePurchase(
    purchaseId: string
): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabaseAdmin
        .from('purchases')
        .update({ status: 'revoked' })
        .eq('id', purchaseId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin');
    return { success: true };
}

/* ------------------------------------------------------------------ */
/*  getAdminStats — aggregate counts for the stats bar                */
/* ------------------------------------------------------------------ */

export async function getAdminStats(): Promise<AdminStats> {
    const { count: activePurchases } = await supabaseAdmin
        .from('purchases')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

    const { count: totalUsers } = await supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    return {
        totalActivePurchases: activePurchases ?? 0,
        totalUsers: totalUsers ?? 0,
    };
}

/* ------------------------------------------------------------------ */
/*  getAllPurchases — full purchase list with user email + plan name   */
/* ------------------------------------------------------------------ */

export async function getAllPurchases(): Promise<PurchaseRow[]> {
    const { data: purchases, error } = await supabaseAdmin
        .from('purchases')
        .select('id, user_id, plan_id, payment_method, granted_at, notes, status, plans(name)')
        .order('granted_at', { ascending: false });

    if (error || !purchases) return [];

    // Resolve user emails via auth admin API
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({
        perPage: 1000,
    });

    const emailMap = new Map<string, string>();
    users.forEach((u) => {
        emailMap.set(u.id, u.email ?? 'unknown');
    });

    return purchases.map((p) => {
        const plans = p.plans as unknown as { name: string } | null;
        return {
            id: p.id,
            userEmail: emailMap.get(p.user_id) ?? 'unknown',
            planName: plans?.name ?? 'Unknown Plan',
            paymentMethod: p.payment_method,
            grantedAt: p.granted_at,
            notes: p.notes,
            status: p.status,
        };
    });
}
