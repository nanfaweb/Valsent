import React, { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
}

export const Button = ({
    children,
    className,
    variant = "primary",
    size = "md",
    isLoading = false,
    ...props
}: ButtonProps) => {
    return (
        <button
            className={`${styles.button} ${styles[variant]} ${styles[size]} ${className || ""}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? <span className={styles.spinner} /> : children}
        </button>
    );
};
