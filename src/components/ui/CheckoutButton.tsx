"use client";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export const CheckoutButton = () => {
    const { user } = useAuth();
    const router = useRouter();

    const handleCheckout = async () => {
        if (!user) {
            router.push("/auth/signup");
            return;
        }

        // Redirect logged-in users directly to dashboard
        router.push("/dashboard");
    };

    return (
        <Button
            size="lg"
            onClick={handleCheckout}
            className="w-full"
        >
            Enroll Now
        </Button>
    );
};
