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
                features: ["50+ Mock Exams", "Performance Analytics", "Lifetime Access", "Priority Support"]
            }, { onConflict: "name" })
            .select()
            .single();

        if (planError && planError.code !== '23505') throw planError;

        // 2. Seed Mock Exams (mix of trial and paid)
        const mockExams = [
            {
                title: "Engineering Entry Test - Free Trial",
                description: "A comprehensive trial covering Physics, Chemistry, Math, and English. Perfect for getting familiar with the exam format.",
                duration_minutes: 60,
                total_questions: 50,
                difficulty: "medium",
                is_trial: true
            },
            {
                title: "Full Engineering Mock Exam #1",
                description: "Complete simulation of the engineering university entry test with all subjects.",
                duration_minutes: 120,
                total_questions: 100,
                difficulty: "medium",
                is_trial: false
            },
            {
                title: "Advanced Mathematics Mock Test",
                description: "Focused on advanced calculus, algebra, and geometry for top-tier universities.",
                duration_minutes: 90,
                total_questions: 80,
                difficulty: "hard",
                is_trial: false
            },
            {
                title: "Physics Fundamentals Practice",
                description: "Essential physics concepts and problem-solving for entry tests.",
                duration_minutes: 75,
                total_questions: 60,
                difficulty: "easy",
                is_trial: false
            },
            {
                title: "Chemistry Complete Mock Exam",
                description: "Comprehensive chemistry test covering organic, inorganic, and physical chemistry.",
                duration_minutes: 90,
                total_questions: 75,
                difficulty: "medium",
                is_trial: false
            },
            {
                title: "Medical Entry Test Prep",
                description: "Specially designed for MDCAT and medical school entry preparation.",
                duration_minutes: 150,
                total_questions: 120,
                difficulty: "hard",
                is_trial: false
            },
        ];

        const insertedMocks = [];
        for (const mock of mockExams) {
            const { data, error } = await supabaseAdmin
                .from("mocks")
                .insert(mock)
                .select()
                .single();

            if (error && error.code !== '23505') {
                console.error("Mock insert error:", error);
                continue;
            }
            if (data) insertedMocks.push(data);
        }

        // 3. Seed sample questions for the trial exam
        const trialMock = insertedMocks.find(m => m.is_trial);
        if (trialMock) {
            const sampleQuestions = [
                {
                    mock_id: trialMock.id,
                    type: "mcq",
                    question_text: "What is the SI unit of Force?",
                    choices: ["Newton", "Joule", "Watt", "Pascal"],
                    correct_answer: "Newton"
                },
                {
                    mock_id: trialMock.id,
                    type: "mcq",
                    question_text: "Calculate the derivative of x².",
                    choices: ["x", "2x", "x²", "2"],
                    correct_answer: "2x"
                },
                {
                    mock_id: trialMock.id,
                    type: "mcq",
                    question_text: "Which of the following is an inert gas?",
                    choices: ["Oxygen", "Nitrogen", "Neon", "Hydrogen"],
                    correct_answer: "Neon"
                },
                {
                    mock_id: trialMock.id,
                    type: "mcq",
                    question_text: "What is the chemical formula for water?",
                    choices: ["H2O", "CO2", "O2", "H2O2"],
                    correct_answer: "H2O"
                },
                {
                    mock_id: trialMock.id,
                    type: "mcq",
                    question_text: "Solve: 2x + 5 = 15",
                    choices: ["x = 5", "x = 10", "x = 7.5", "x = 20"],
                    correct_answer: "x = 5"
                }
            ];

            const { error: qError } = await supabaseAdmin
                .from("questions")
                .insert(sampleQuestions);

            if (qError) console.error("Questions insert error:", qError);
        }

        // 4. Seed testimonials
        const testimonials = [
            {
                name: "Ali Khan",
                text: "Valsent helped me score 95% on my ECAT. The mock exams were incredibly realistic!",
                avatar_url: null
            },
            {
                name: "Sara Ahmed",
                text: "The performance analytics showed me exactly where I needed to improve. Highly recommended!",
                avatar_url: null
            },
            {
                name: "Hassan Raza",
                text: "Thanks to Valsent, I got into my dream university. The practice made perfect!",
                avatar_url: null
            }
        ];

        await supabaseAdmin.from("testimonials").upsert(testimonials, { onConflict: "name" });

        return NextResponse.json({
            success: true,
            message: "Database seeded successfully",
            data: {
                mocksCreated: insertedMocks.length,
                trialMockId: trialMock?.id
            }
        });

    } catch (error: any) {
        console.error("Seed error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
