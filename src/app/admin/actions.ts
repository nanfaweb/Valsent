'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createServerSupabaseClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Server actions are public HTTP endpoints, so every admin action must verify
 * the caller itself — checking only on the /admin page is not enough.
 */
async function requireAdmin(): Promise<void> {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!user || !adminEmail || user.email !== adminEmail) {
        throw new Error('Not authorized');
    }
}

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

export interface PaymentRequestRow {
    id: string;
    userId: string;
    userEmail: string;
    discipline: 'bba' | 'bcs';
    method: 'easypaisa' | 'jazzcash' | 'bank';
    txnId: string;
    senderNumber: string;
    amountPkr: number;
    status: 'pending' | 'approved' | 'rejected';
    adminNote: string | null;
    createdAt: string;
    referenceCode: string;
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
    await requireAdmin();
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
    await requireAdmin();
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
    await requireAdmin();
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
    await requireAdmin();
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
    await requireAdmin();
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

/* ------------------------------------------------------------------ */
/*  Payment requests (manual EasyPaisa / JazzCash / bank)              */
/* ------------------------------------------------------------------ */

export async function getPaymentRequests(): Promise<PaymentRequestRow[]> {
    await requireAdmin();

    const { data, error } = await supabaseAdmin
        .from('payment_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

    if (error || !data) return [];

    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const emailMap = new Map<string, string>();
    users.forEach((u) => emailMap.set(u.id, u.email ?? 'unknown'));

    return data.map((r) => ({
        id: r.id,
        userId: r.user_id,
        userEmail: emailMap.get(r.user_id) ?? 'unknown',
        discipline: r.discipline,
        method: r.method,
        txnId: r.txn_id,
        senderNumber: r.sender_number,
        amountPkr: r.amount_pkr,
        status: r.status,
        adminNote: r.admin_note,
        createdAt: r.created_at,
        referenceCode: `VAL-${String(r.user_id).slice(0, 6).toUpperCase()}`,
    }));
}

/**
 * Approve a pending request: grants access (same insert as grantAccess) and
 * marks the request approved. Only call this after you have matched the
 * transaction ID and amount in the EasyPaisa / JazzCash / bank history.
 */
export async function approvePaymentRequest(
    requestId: string
): Promise<{ success: boolean; error?: string }> {
    await requireAdmin();

    const { data: req } = await supabaseAdmin
        .from('payment_requests')
        .select('*')
        .eq('id', requestId)
        .single();

    if (!req) return { success: false, error: 'Request not found.' };
    if (req.status !== 'pending') {
        return { success: false, error: `Already ${req.status}.` };
    }

    // Don't double-grant if the user already has an active purchase
    const { data: existing } = await supabaseAdmin
        .from('purchases')
        .select('id')
        .eq('user_id', req.user_id)
        .eq('status', 'active')
        .maybeSingle();

    if (!existing) {
        // 'jazzcash' is stored as 'other' in case purchases.payment_method is constrained
        const paymentMethod = req.method === 'jazzcash' ? 'other' : req.method;
        const grant = await grantAccess(
            req.user_id,
            req.discipline,
            paymentMethod,
            `${req.method} TID ${req.txn_id} from ${req.sender_number} (PKR ${req.amount_pkr})`
        );
        if (!grant.success) return grant;
    }

    const { error } = await supabaseAdmin
        .from('payment_requests')
        .update({ status: 'approved', reviewed_at: new Date().toISOString() })
        .eq('id', requestId);

    if (error) return { success: false, error: error.message };

    revalidatePath('/admin');
    return { success: true };
}

export async function rejectPaymentRequest(
    requestId: string,
    note: string
): Promise<{ success: boolean; error?: string }> {
    await requireAdmin();

    const { error } = await supabaseAdmin
        .from('payment_requests')
        .update({
            status: 'rejected',
            admin_note: note.trim() || null,
            reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .eq('status', 'pending');

    if (error) return { success: false, error: error.message };

    revalidatePath('/admin');
    return { success: true };
}
