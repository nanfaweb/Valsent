"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import styles from "@/app/page.module.css";

export const HeroActions = () => {
    const { user } = useAuth();

    return (
        <div className={styles.heroActions}>
            <Link href={user ? "/dashboard" : "/auth/signup"}>
                <Button size="lg" variant="primary">Start Practicing Now</Button>
            </Link>
            <Link href="/pricing">
                <Button size="lg" variant="outline">Learn More</Button>
            </Link>
        </div>
    );
};
