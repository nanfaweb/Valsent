
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ResultReview } from "@/components/exam/ResultReview";
import styles from "./page.module.css";

interface Question {
    id: string;
    question_text: string;
    choices?: string[];
    correct_answer: string;
    type: "mcq" | "text" | "math" | "eng";
    section?: string;
}

export default function ResultHistoryPage({ params }: { params: { attemptId: string } }) {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [score, setScore] = useState(0);
    const [timeTaken, setTimeTaken] = useState(0);
    const attemptId = params.attemptId;

    useEffect(() => {
        async function loadResult() {
            if (!user || !attemptId) return;

            // 1. Get the attempt
            const { data: attempt } = await supabase
                .from('attempts')
                .select('*')
                .eq('id', attemptId)
                .eq('user_id', user.id)
                .single();

            if (!attempt) {
                console.error("Attempt not found");
                router.push("/dashboard");
                return;
            }

            // 2. Get questions for this mock
            // Note: The questions table links to mock_id.
            // But wait, the existing code fetches from 'questions' table.
            // Does the question structure match?
            // "question_text" vs "text"?
            // In generate_paid_mocks_sql.ts, I see `text` in JSON. 
            // In trial/result/page.tsx, it maps `type: 'math'` to section 'Mathematics'.
            // I should assume the schema is consistent.

            const { data: questionsData } = await supabase
                .from('questions')
                .select('*')
                .eq('mock_id', attempt.mock_id)
                .order('created_at', { ascending: true });

            if (questionsData && questionsData.length > 0) {
                // Group by section logic (reuse from trial result)
                const mathQuestions = questionsData
                    .filter(q => q.type === 'math' || q.type === 'mcq') // Assuming 'mcq' might be general? 
                // Wait, paid mock JSONs have 'type': 'mcq'.
                // The trial/result page filter checked `q.type === 'math'`.
                // The new JSON has type="mcq" but topic="...".
                // How do I know the section?
                // In the JSON `paid_exams_migration.sql`, sections are in metadata JSONB.
                // But questions are ALSO inserted into `questions` table?
                // Wait. `generate_paid_mocks_sql.ts` generated INSERTs for `exams` table.
                // Does it insert into `questions` table?
                // Let's RE-READ `generate_paid_mocks_sql.ts` or `paid_exams_migration.sql`.

                // Step 69 view showed:
                // INSERT INTO public.exams ... VALUES (..., metadata)
                // It does NOT insert into `questions` table!
                // Oh.
                // The trial result page fetches from `questions` table.
                // If my new paid exams ONLY have questions in `exams.metadata`, then `ResultReview` using `questions` table will FAIL.

                // Let's check `paid_exams_migration.sql` again.
                // It only inserts into `exams`.
                // It does NOT insert into `questions`.

                // So how does `src/app/exam/[id]/page.tsx` fetch questions?
                // Let's check `src/app/exam/[id]/page.tsx` again.

            } else {
                // Fallback: Try to parse from EXAM METADATA if not in questions table?
                // Checking if questions table is empty for paid mocks.
            }
            // ...
        }

        loadResult();
    }, [user, attemptId, router]);

    return (
        // ...
        null
    );
}
