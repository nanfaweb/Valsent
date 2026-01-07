import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const signature = req.headers.get("x-paypro-signature");

        // 1. Verify Signature
        // const calculatedSignature = crypto.createHmac...
        // if (signature !== calculatedSignature) return NextResponse.json({error: "Invalid signature"}, {status: 403});

        // 2. Process Payment Status
        const { order_id, status } = body;
        // Assuming 'order_id' matches our 'purchases.id' or we stored PayPro ID.

        if (status === "00" || status === "success") { // PayPro success codes vary
            const { error } = await supabaseAdmin
                .from("purchases")
                .update({ status: "active" })
                .eq("id", order_id);

            if (error) throw error;
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error("Webhook error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
