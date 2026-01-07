"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        // The Supabase client SDK handles the hash fragment automatically 
        // when it initializes on this page if the URL contains auth params.
        // We just need to wait for the session to be established.

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_IN" || session) {
                // Successful login
                router.push("/dashboard");
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [router]);

    return (
        <div style={{
            display: "flex",
            height: "100vh",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "1rem"
        }}>
            <h2>Authenticating...</h2>
            <p>Please wait while we redirect you.</p>
        </div>
    );
}
