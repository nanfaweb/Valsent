"use client";

import { Button } from "@/components/ui/Button";
import { useState } from "react";

export default function SeedPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleSeed = async () => {
        setLoading(true);
        setResult(null);
        try {
            const res = await fetch("/api/seed", { method: "POST" });
            const data = await res.json();
            setResult(data);
        } catch (e: any) {
            setResult({ error: e.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "4rem", maxWidth: "600px", margin: "0 auto" }}>
            <h1>Admin Seeder</h1>
            <p style={{ marginBottom: "2rem" }}>
                Click below to populate the database with sample data (Plan, Mocks, Questions).
            </p>

            <Button onClick={handleSeed} isLoading={loading}>
                Run Seed Script
            </Button>

            {result && (
                <pre style={{
                    marginTop: "2rem",
                    padding: "1rem",
                    background: "#F3F4F6",
                    borderRadius: "8px",
                    overflow: "auto"
                }}>
                    {JSON.stringify(result, null, 2)}
                </pre>
            )}
        </div>
    );
}
