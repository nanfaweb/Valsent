import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
    try {
        // 1. Seed Plan
        const { data: plan, error: planError } = await supabaseAdmin
            .from("plans")
            .upsert({
                name: "Full Access Pass",
                price_pkr: 2999,
                original_price_pkr: 3499,
                features: ["Unlimited Mock Exams", "Analytics", "Priority Support"]
            }, { onConflict: "name" }) // Assuming unique name or we just want to ensure one exists
            .select()
            .single();

        if (planError) throw planError;

        // 2. Seed Mocks (if not exists)
        const { data: mock, error: mockError } = await supabaseAdmin
            .from("mocks")
            .insert({
                title: "Engineering Entry Test - Full Mock 1",
                description: "A complete simulation of the engineering university entry test covering Physics, Chemistry, Math, and English.",
                duration_minutes: 120
            })
            .select()
            .single();

        if (mockError) throw mockError;

        // 3. Seed Questions
        const questions = [
            {
                mock_id: mock.id,
                type: "mcq",
                question_text: "What is the SI unit of Force?",
                choices: ["Newton", "Joule", "Watt", "Pascal"],
                correct_answer: "Newton"
            },
            {
                mock_id: mock.id,
                type: "mcq",
                question_text: "Calculate the derivative of x^2.",
                choices: ["x", "2x", "x^2", "2"],
                correct_answer: "2x"
            },
            {
                mock_id: mock.id,
                type: "mcq",
                question_text: "Which of the following is an inert gas?",
                choices: ["Oxygen", "Nitrogen", "Neon", "Hydrogen"],
                correct_answer: "Neon"
            }
        ];

        const { error: qError } = await supabaseAdmin
            .from("questions")
            .insert(questions);

        if (qError) throw qError;

        return NextResponse.json({ success: true, message: "Seeded successfully", mockId: mock.id });

    } catch (error: any) {
        console.error("Seed error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
