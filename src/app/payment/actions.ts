'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const METHODS = ['easypaisa', 'jazzcash', 'bank'] as const;
type PaymentMethod = (typeof METHODS)[number];

const MAX_PENDING_PER_USER = 3;

export interface SubmitPaymentInput {
    method: string;
    txnId: string;
    senderNumber: string;
}

export interface SubmitPaymentResult {
    success: boolean;
    error?: string;
}

/**
 * Records a manual payment claim from the signed-in student.
 *
 * The user is taken from the verified session cookie, never from the client.
 * Submitting a transaction ID does NOT unlock anything — an admin has to check
 * it against the wallet's transaction history and approve it in /admin.
 */
export async function submitPaymentRequest(
    input: SubmitPaymentInput
): Promise<SubmitPaymentResult> {
    const supabase = await createServerSupabaseClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Please sign in again and retry.' };

    // --- validate input -------------------------------------------------
    const method = input.method as PaymentMethod;
    if (!METHODS.includes(method)) {
        return { success: false, error: 'Choose how you paid.' };
    }

    const txnId = input.txnId.trim().toUpperCase();
    if (!/^[A-Z0-9]{6,30}$/.test(txnId)) {
        return {
            success: false,
            error: 'Enter the transaction ID exactly as shown in your payment confirmation (letters and digits only).',
        };
    }

    const senderNumber = input.senderNumber.replace(/[\s-]/g, '');
    if (!/^(03\d{9}|\+923\d{9})$/.test(senderNumber)) {
        return {
            success: false,
            error: 'Enter the mobile number you paid from, e.g. 03001234567.',
        };
    }

    // --- already has access? -------------------------------------------
    const { data: active } = await supabase
        .from('purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle();

    if (active) return { success: false, error: 'Your account already has full access.' };

    // --- price comes from the database, not from the client ------------
    const { data: profile } = await supabase
        .from('profiles')
        .select('discipline')
        .eq('id', user.id)
        .single();

    if (!profile?.discipline) {
        return { success: false, error: 'Please finish choosing your discipline first.' };
    }

    const discipline = profile.discipline as 'bba' | 'bcs';
    const planName = `${discipline === 'bba' ? 'BBA' : 'BCS'} Access Pass`;

    const { data: plan } = await supabase
        .from('plans')
        .select('price_pkr')
        .eq('name', planName)
        .single();

    const amount = plan?.price_pkr ?? 2999; // same fallback as the /payment page

    // --- stop spam -------------------------------------------------------
    const { count } = await supabaseAdmin
        .from('payment_requests')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'pending');

    if ((count ?? 0) >= MAX_PENDING_PER_USER) {
        return {
            success: false,
            error: 'You already have requests waiting for verification. Please message us on WhatsApp instead.',
        };
    }

    // --- save ------------------------------------------------------------
    const { error } = await supabaseAdmin.from('payment_requests').insert({
        user_id: user.id,
        discipline,
        method,
        txn_id: txnId,
        sender_number: senderNumber,
        amount_pkr: amount,
    });

    if (error) {
        if (error.code === '23505') {
            return {
                success: false,
                error: 'This transaction ID has already been submitted. If that was you, we are verifying it.',
            };
        }
        console.error('submitPaymentRequest failed:', error);
        return { success: false, error: 'Could not save your request. Please try again.' };
    }

    revalidatePath('/payment');
    return { success: true };
}
