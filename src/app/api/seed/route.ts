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
        // 3. Seed questions for the trial exam
        if (trialMockId) {
            // First, DELETE existing questions to prevent duplicates/issues
            await supabaseAdmin.from("questions").delete().eq("mock_id", trialMockId);

            // Import local JSON data (assuming it's available or we embed it)
            // For robustness in this environment, I'm embedding the read logic:
            // Since we can't easily rely on 'fs' in edge/serverless sometimes, but this is a route.
            // I will use `require` or just paste the data if tool allows.
            // Let's assume we can use `fs` to read the file relative to project root.

            /* 
               NOTE: In a real Next.js app, importing JSON is best. 
               import mathQuestions from '../../../../bba_math_1.json';
            */

            // However, to ensure it works without file path issues in this specific environment,
            // I will use a robust approach: Fetching or hardcoding the logic to read it.
            // For now, I will use 'fs' to read the file from the known path.

            const fs = require('fs');
            const path = require('path');
            const jsonPath = path.join(process.cwd(), 'bba_math_1.json');

            let mathData = [];
            try {
                const fileContents = fs.readFileSync(jsonPath, 'utf8');
                mathData = JSON.parse(fileContents);
            } catch (err) {
                console.error("Failed to read bba_math_1.json:", err);
                // Fallback or error
                throw new Error("Failed to read question data file");
            }

            const questionsToInsert = mathData.map((q: any) => ({
                mock_id: trialMockId,
                type: "mcq",
                question_text: q.question,
                choices: q.options, // Already an array of strings ["A. ...", "B. ..."]
                correct_answer: q.answer, // "B. 25"
                section: "Mathematics" // New column
            }));

            // Insert in batches if needed, but 45 is small enough for one go
            const { error: qError } = await supabaseAdmin
                .from("questions")
                .insert(questionsToInsert);

            if (qError) {
                console.error("Questions insert error:", qError);
                return NextResponse.json({ error: "Questions insert failed", details: qError }, { status: 500 });
            }
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
