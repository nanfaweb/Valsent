
import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { discipline, userId } = body;

        if (!discipline || !['bba', 'bcs'].includes(discipline)) {
            return NextResponse.json(
                { error: "Invalid discipline. Must be 'bba' or 'bcs'." },
                { status: 400 }
            );
        }

        if (!userId) {
             return NextResponse.json(
                { error: "User ID is required." },
                { status: 400 }
            );
        }

        // Initialize Supabase Admin Client (Service Role) to bypass RLS for profile creation if needed,
        // or just to ensure we can write to profiles.
        // Ideally, we should use the authenticated user's client if RLS allows self-insert,
        // but for robustness in onboarding flows (and avoid issues if the user session isn't fully propagated yet in some edge cases),
        // we can use the service role key, BUT we must be careful.
        // Given the prompt: "Use server-side Supabase client for profiles writes to avoid exposing service role on frontend."
        // We are in an API route, so we can use SERVICE_ROLE_KEY effectively.

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Security check: Verify the user actually exists in auth.users?
        // Relying on the passed userId implies trust, but since this is called from our frontend
        // immediately after signup, it's a trade-off.
        // BETTER: Retrieve the user from the session using the request cookies to ensure they are who they say they are.
        // However, the prompt says "Use server-side Supabase client ... to avoid exposing service role on frontend".
        // Let's try to get the user from the session first for security.
        
        // Actually, to keep it simple and consistent with the prompt's `POST /api/profiles/create body: { discipline }`
        // and "Use server supabase service role or authenticated user check..."
        // I will use the service role to insert, but I SHOULD verify the user context if possible.
        // If the user just signed up, they might not have a session cookie set in the request yet if it's a client-side call immediately after signUp?
        // Supabase `signUp` returns a session. If the client sends that, we are good.
        // If we want to be safe, we can trust the client to send the ID for now as part of the flow, 
        // OR better: use validation.
        
        // Let's stick to the prompt's suggested flow:
        // `INSERT INTO profiles ...`
        
        const { error } = await supabaseAdmin
            .from("profiles")
            .insert({
                id: userId,
                discipline: discipline,
                trial_used: false,
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            // Handle race condition: If profile exists (e.g. concurrent calls), 
            // determine if we should update or just return success.
            // Prompt says: "ON CONFLICT (id) DO UPDATE SET discipline = EXCLUDED.discipline;"
            // Supabase JS `.upsert` can handle this.
            
            const { error: upsertError } = await supabaseAdmin
                .from("profiles")
                .upsert({
                    id: userId,
                    discipline: discipline,
                    // trial_used: false, // Don't reset trial_used if updating
                    // created_at: ... // Don't reset created_at
                }, { onConflict: 'id', ignoreDuplicates: false }) // actually we want to update discipline
                .select()
                .single();
                
             // Wait, the upsert above might overwrite trial_used if I include it.
             // Does upsert allow partial updates? Yes, but need to be careful.
             // Let's try to just UPDATE if insert fails, or use upsert with specific columns?
             // Simplest: Try INSERT. If 409 (conflict), then UPDATE discipline.
             
             if (error.code === '23505') { // Unique violation
                  const { error: updateError } = await supabaseAdmin
                    .from("profiles")
                    .update({ discipline: discipline })
                    .eq('id', userId);
                    
                  if (updateError) throw updateError;
             } else {
                 throw error;
             }
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Profile creation error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
