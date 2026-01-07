"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import styles from "./AuthForm.module.css";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, User } from "lucide-react";

type AuthMode = "signin" | "signup";

export const AuthForm = ({ mode }: { mode: AuthMode }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (mode === "signup") {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                    },
                });
                if (error) throw error;
                // Check if email confirmation is required, usually Supabase default.
                // For this demo, we assume maybe usage of "Auto confirm" is OFF, 
                // but user prompt didn't specify. We'll handle generic success.
                alert("Check your email for the confirmation link!");
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push("/dashboard");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <Card className={styles.card}>
            <div className={styles.header}>
                <h2>{mode === "signin" ? "Welcome Back" : "Create Account"}</h2>
                <p>
                    {mode === "signin"
                        ? "Enter your credentials to access your account."
                        : "Sign up to start your preparation journey."}
                </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                {error && <div className={styles.error}>{error}</div>}

                {mode === "signup" && (
                    <div className={styles.inputGroup}>
                        <label htmlFor="fullName">Full Name</label>
                        <div className={styles.inputWrapper}>
                            <User className={styles.icon} size={18} />
                            <input
                                id="fullName"
                                type="text"
                                required
                                placeholder="John Doe"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className={styles.input}
                            />
                        </div>
                    </div>
                )}

                <div className={styles.inputGroup}>
                    <label htmlFor="email">Email Address</label>
                    <div className={styles.inputWrapper}>
                        <Mail className={styles.icon} size={18} />
                        <input
                            id="email"
                            type="email"
                            required
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                        />
                    </div>
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="password">Password</label>
                    <div className={styles.inputWrapper}>
                        <Lock className={styles.icon} size={18} />
                        <input
                            id="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                        />
                    </div>
                </div>

                <Button type="submit" className={styles.submit} isLoading={loading}>
                    {mode === "signin" ? "Sign In" : "Sign Up"}
                </Button>
            </form>

            <div className={styles.divider}>
                <span>OR</span>
            </div>

            <Button
                variant="outline"
                onClick={handleGoogleLogin}
                className={styles.google}
            >
                <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    width={18}
                    height={18}
                />
                Continue with Google
            </Button>

            <div className={styles.footer}>
                {mode === "signin" ? (
                    <p>
                        Don't have an account? <Link href="/auth/signup">Sign Up</Link>
                    </p>
                ) : (
                    <p>
                        Already have an account? <Link href="/auth/signin">Sign In</Link>
                    </p>
                )}
            </div>
        </Card>
    );
};
