"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export const CheckoutButton = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        if (!user) {
            router.push("/auth/signin?next=/pricing");
            return;
        }

        setLoading(true);
        try {
            // Get current session token for API call
            const { data: { session } } = await supabase.auth.getSession();

            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.access_token}`
                },
            });

            const data = await res.json();

            if (data.url) {
                // Redirect to PayPro (Mock URL for now)
                // Since it's a mock, we might want to just simulate success for the USER to see.
                // For production, window.location.href = data.url;

                // Mocking the behavior for development demo:
                alert(`Redirecting to Payment Gateway... (Mock URL: ${data.url})`);

                // Simulate webhook callback effect for dev if needed?
                // No, let's stick to the URL redirect pattern.
                window.location.href = data.url;
            } else {
                alert(data.error || "Something went wrong");
            }
        } catch (error) {
            console.error(error);
            alert("Failed to initiate checkout");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            size="lg"
            onClick={handleCheckout}
            isLoading={loading}
            className="w-full"
        >
            Enroll Now
        </Button>
    );
};
