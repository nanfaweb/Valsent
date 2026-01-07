import styles from "./Footer.module.css";
import Link from "next/link";

export const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.top}>
                    <div className={styles.brand}>
                        <h3>Valsent</h3>
                        <p>Ace your university entry tests with confidence.</p>
                    </div>

                    <div className={styles.links}>
                        <div className={styles.column}>
                            <h4>Product</h4>
                            <Link href="/pricing">Pricing</Link>
                            <Link href="/#features">Features</Link>
                            <Link href="/#faq">FAQ</Link>
                        </div>

                        <div className={styles.column}>
                            <h4>Company</h4>
                            <Link href="/about">About</Link>
                            <Link href="/contact">Contact</Link>
                            <Link href="/privacy">Privacy Policy</Link>
                            <Link href="/terms">Terms of Service</Link>
                        </div>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p>&copy; {new Date().getFullYear()} Valsent. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};
