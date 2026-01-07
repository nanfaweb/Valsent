import { AuthForm } from "../AuthForm";
import styles from "./page.module.css";

export default function SignUpPage() {
    return (
        <div className={styles.container}>
            <AuthForm mode="signup" />
        </div>
    );
}
