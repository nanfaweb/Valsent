"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "../ui/Button";
import styles from "./Header.module.css";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export const Header = () => {
    const { user, loading, signOut } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Don't show header content while auth state is loading to avoid flicker
    // OR show a loading skeleton. For now, simple return or minimal state.

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <div className={styles.logo}>
                    <Link href="/">
                        Valsent
                    </Link>
                </div>

                {/* Desktop Nav */}
                <nav className={`${styles.nav} ${styles.desktopNav}`}>
                    <Link href="/#features" className={styles.link}>Features</Link>
                    <Link href="/pricing" className={styles.link}>Pricing</Link>
                    <Link href="/#faq" className={styles.link}>FAQ</Link>
                </nav>

                <div className={`${styles.authActions} ${styles.desktopAuth}`}>
                    {loading ? (
                        <span className={styles.loading}>Loading...</span>
                    ) : user ? (
                        <>
                            <Link href="/dashboard">
                                <Button variant="ghost">Dashboard</Button>
                            </Link>
                            <Link href="/account">
                                <Button variant="ghost">Account</Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/auth/signin">
                                <Button variant="ghost">Sign In</Button>
                            </Link>
                            <Link href="/auth/signup">
                                <Button variant="primary">Get Started</Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button className={styles.menuToggle} onClick={toggleMenu}>
                    {isMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Nav */}
            {isMenuOpen && (
                <div className={styles.mobileMenu}>
                    <nav className={styles.mobileNav}>
                        <Link href="/#features" onClick={toggleMenu}>Features</Link>
                        <Link href="/pricing" onClick={toggleMenu}>Pricing</Link>
                        <Link href="/#faq" onClick={toggleMenu}>FAQ</Link>
                    </nav>
                    <div className={styles.mobileAuth}>
                        {user ? (
                            <>
                                <Link href="/dashboard" onClick={toggleMenu}>
                                    <Button className={styles.fullWidth}>Dashboard</Button>
                                </Link>
                                <Link href="/account" onClick={toggleMenu}>
                                    <Button variant="outline" className={styles.fullWidth}>Account</Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/signin" onClick={toggleMenu}>
                                    <Button variant="outline" className={styles.fullWidth}>Sign In</Button>
                                </Link>
                                <Link href="/auth/signup" onClick={toggleMenu}>
                                    <Button variant="primary" className={styles.fullWidth}>Get Started</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};
