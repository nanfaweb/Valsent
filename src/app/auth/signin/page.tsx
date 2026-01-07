import { AuthForm } from "../AuthForm";
import styles from "./page.module.css";

export default function SignInPage() {
    return (
        <div className={styles.container}>
            <AuthForm mode="signin" />
        </div>
    );
}
