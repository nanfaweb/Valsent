import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// We need a specific server-side client or just use the SDK with service key if needed,
// but for checking the USER session, we need to pass the access token or use cookies.
// Since we are using client-side auth primarily, we should expect an Authorization header
// or just trust the client to pass the user ID (NOT SECURE).
// secure way: verify JWT. 
// For this implementation, we will try to get the user from the supabase client 
// initialized with the request headers or cookies if possible.
// SIMPLIFICATION: We will expect the client to send the user_id for now, 
// but in production, we MUST verify the session token.

// Since I configured `lib/supabase.ts` with anon key, I can't verify tokens easily without `supabase-ssr` or admin key.
// I will use `SUPABASE_SERVICE_ROLE_KEY` to perform admin actions (inserting purchase).
// And I will try to verify the user via the `Authorization` header which should contain the Bearer token.

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        // Check if user already has an active plan
        const { data: existing } = await supabaseAdmin
            .from("purchases")
            .select("*")
            .eq("user_id", user.id)
            .eq("status", "active")
            .single();

        if (existing) {
            return NextResponse.json({ error: "Plan already active" }, { status: 400 });
        }

        // 1. Create Purchase Record (Pending)
        // We assume a single Plan ID for now or fetch it.
        // Let's first get the Plan ID (we created a 'plans' table).
        const { data: plan } = await supabaseAdmin
            .from("plans")
            .select("id, price_pkr")
            .single();
        // Assuming only one plan exists or we pick the first. 
        // Ideally client sends plan_id.

        if (!plan) {
            // fallback if no plan seeded
            return NextResponse.json({ error: "No plan found" }, { status: 500 });
        }

        const { data: purchase, error: purchaseError } = await supabaseAdmin
            .from("purchases")
            .insert({
                user_id: user.id,
                plan_id: plan.id,
                status: "pending",
                price_amount: plan.price_pkr // Ensure this column exists or relying on plan link
            })
            .select()
            .single();

        if (purchaseError) throw purchaseError;

        // 2. Call PayPro API
        // Doc placeholder: PayPro usually takes Merchant ID, Amount, Order ID, etc.
        const payproPayload = {
            merchant_id: "VALSENT", // Placeholder
            order_id: purchase.id,
            amount: plan.price_pkr,
            currency: "PKR",
            customer_email: user.email,
            description: "University Entry Test Full Access",
            return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?payment=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?payment=cancel`,
        };

        // MOCKING THE EXTERNAL CALL for now as I don't have real PayPro endpoints.
        // In production: const response = await fetch("https://api.paypro.com/v2/create", ...);

        // Simulating a returned URL (Hosted Checkout)
        const checkoutUrl = `https://paypro.com/mock-checkout/${purchase.id}`;

        // Updating DB with PayPro Order ID if returned (skipping for mock)

        return NextResponse.json({ url: checkoutUrl });

    } catch (error: any) {
        console.error("Checkout error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
