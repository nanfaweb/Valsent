-- ============================================================================
-- EXAM DATA INSERT - BBA Mathematics Mock Test
-- ============================================================================

INSERT INTO public.exams (external_id, title, duration_seconds, metadata)
VALUES (
  'trial-001',
  'BBA Mathematics Mock Test 1',
  9900, -- 2 hours 45 minutes (165 minutes)
  '{
    "totalQuestions": 45,
    "totalMarks": 45,
    "passingMarks": 27,
    "sections": [
      {
        "id": "mathematics",
        "title": "Mathematics",
        "questions": [
          {"id": "q1", "topic": "Simplification", "text": "A wallet contains Rs. 600 in the form of one-rupee, two-rupee, and five-rupee coins. The number of coins of each denomination is the same. What is the total number of coins in the wallet?", "options": ["A. 75", "B. 150", "C. 225", "D. 300"], "correctAnswer": 2, "marks": 1},
          {"id": "q2", "topic": "Simplification", "text": "The price of 6 notebooks is equal to that of 9 pens. If the combined price of 4 notebooks and 6 pens is Rs. 800, what is the price of 5 notebooks?", "options": ["A. Rs. 400", "B. Rs. 500", "C. Rs. 600", "D. Rs. 750"], "correctAnswer": 1, "marks": 1},
          {"id": "q3", "topic": "Simplification", "text": "Class X has two sections, A and B. If 5 students move from A to B, both sections have equal students. If 5 students move from B to A, section A has three times as many students as B. How many students are in section A?", "options": ["A. 15", "B. 25", "C. 35", "D. 45"], "correctAnswer": 1, "marks": 1},
          {"id": "q4", "topic": "Algebraic Identities", "text": "If x + 1/x = 6, what is the value of x² + 1/x²?", "options": ["A. 34", "B. 36", "C. 38", "D. 32"], "correctAnswer": 0, "marks": 1},
          {"id": "q5", "topic": "Algebraic Identities", "text": "If a + b + c = 10 and ab + bc + ca = 25, find the value of a² + b² + c².", "options": ["A. 40", "B. 50", "C. 60", "D. 75"], "correctAnswer": 1, "marks": 1},
          {"id": "q6", "topic": "Algebraic Identities", "text": "If x = 3 + √8, find the value of x² + 1/x².", "options": ["A. 32", "B. 34", "C. 36", "D. 38"], "correctAnswer": 1, "marks": 1},
          {"id": "q7", "topic": "Inequality and Modulus", "text": "Which of the following values of x satisfies the inequality |2x - 5| ≤ 9?", "options": ["A. 8", "B. -3", "C. 5", "D. All of the above"], "correctAnswer": 3, "marks": 1},
          {"id": "q8", "topic": "Inequality and Modulus", "text": "If x is an integer, how many values of x satisfy |x - 5| < 4?", "options": ["A. 5", "B. 6", "C. 7", "D. 8"], "correctAnswer": 2, "marks": 1},
          {"id": "q9", "topic": "Inequality and Modulus", "text": "Solve for x: -3 < 2x - 1 < 7", "options": ["A. -1 < x < 4", "B. -2 < x < 3", "C. -1 < x < 3", "D. 1 < x < 4"], "correctAnswer": 0, "marks": 1},
          {"id": "q10", "topic": "Surd and Indices", "text": "If 5^(x+1) + 5^(x-1) = 650, find the value of x.", "options": ["A. 1", "B. 2", "C. 3", "D. 4"], "correctAnswer": 2, "marks": 1},
          {"id": "q11", "topic": "Surd and Indices", "text": "Simplify: (√7 + √5) / (√7 - √5) + (√7 - √5) / (√7 + √5)", "options": ["A. 6", "B. 12", "C. 7", "D. 5"], "correctAnswer": 1, "marks": 1},
          {"id": "q12", "topic": "Surd and Indices", "text": "Which is larger: ∛4 or √3?", "options": ["A. ∛4", "B. √3", "C. They are equal", "D. Cannot be determined"], "correctAnswer": 1, "marks": 1},
          {"id": "q13", "topic": "Integers and Numbers", "text": "The sum of five consecutive even integers is 200. What is the smallest of these integers?", "options": ["A. 34", "B. 36", "C. 38", "D. 40"], "correctAnswer": 1, "marks": 1},
          {"id": "q14", "topic": "Integers and Numbers", "text": "If n is an odd integer, which of the following must be even?", "options": ["A. 3n + 2", "B. 2n + 1", "C. n(n + 3)", "D. n² + 1"], "correctAnswer": 3, "marks": 1},
          {"id": "q15", "topic": "Integers and Numbers", "text": "What is the remainder when 3^21 is divided by 5?", "options": ["A. 1", "B. 2", "C. 3", "D. 4"], "correctAnswer": 2, "marks": 1},
          {"id": "q16", "topic": "Averages", "text": "The average weight of a class of 20 students increases by 0.5 kg when one student weighing 40 kg is replaced by a new student. What is the weight of the new student?", "options": ["A. 45 kg", "B. 50 kg", "C. 55 kg", "D. 60 kg"], "correctAnswer": 1, "marks": 1},
          {"id": "q17", "topic": "Averages", "text": "The average of 5 numbers is 27. If one number is excluded, the average becomes 25. The excluded number is:", "options": ["A. 25", "B. 30", "C. 35", "D. 40"], "correctAnswer": 2, "marks": 1},
          {"id": "q18", "topic": "Averages", "text": "A cricketer has an average score of 45 runs in 10 innings. How many runs must he score in the 11th inning to raise his average to 50?", "options": ["A. 90", "B. 100", "C. 55", "D. 95"], "correctAnswer": 1, "marks": 1},
          {"id": "q19", "topic": "Fraction", "text": "A tank is 3/5 full. If 20 liters are removed, it becomes 1/2 full. What is the total capacity of the tank?", "options": ["A. 150 liters", "B. 200 liters", "C. 250 liters", "D. 300 liters"], "correctAnswer": 1, "marks": 1},
          {"id": "q20", "topic": "Fraction", "text": "A man spends 1/3 of his income on rent and 2/5 of the remainder on food. If he is left with Rs. 4000, what is his monthly income?", "options": ["A. Rs. 8000", "B. Rs. 10000", "C. Rs. 12000", "D. Rs. 15000"], "correctAnswer": 1, "marks": 1},
          {"id": "q21", "topic": "Fraction", "text": "By how much is 4/5 of 60 greater than 3/4 of 40?", "options": ["A. 15", "B. 18", "C. 20", "D. 12"], "correctAnswer": 1, "marks": 1},
          {"id": "q22", "topic": "Percentage", "text": "If the length of a rectangle is increased by 20% and the width is decreased by 10%, what is the percentage change in area?", "options": ["A. 8% increase", "B. 10% increase", "C. 8% decrease", "D. No change"], "correctAnswer": 0, "marks": 1},
          {"id": "q23", "topic": "Percentage", "text": "A student scored 32% marks and failed by 6 marks. Another student scored 42% marks and got 14 marks more than the passing marks. The maximum marks are:", "options": ["A. 150", "B. 200", "C. 250", "D. 300"], "correctAnswer": 1, "marks": 1},
          {"id": "q24", "topic": "Percentage", "text": "Price of petrol increased by 25%. By how much percent should a car owner reduce his consumption so that expenditure remains the same?", "options": ["A. 20%", "B. 25%", "C. 15%", "D. 30%"], "correctAnswer": 0, "marks": 1},
          {"id": "q25", "topic": "Ratio and Proportion", "text": "Two numbers are in the ratio 4:5. If 5 is subtracted from each, the ratio becomes 3:4. The numbers are:", "options": ["A. 16, 20", "B. 20, 25", "C. 24, 30", "D. 40, 50"], "correctAnswer": 1, "marks": 1},
          {"id": "q26", "topic": "Ratio and Proportion", "text": "A bag contains 50p, 25p, and 10p coins in the ratio 5:9:4. The total value is Rs. 206. How many 25p coins are there?", "options": ["A. 200", "B. 360", "C. 160", "D. 180"], "correctAnswer": 1, "marks": 1},
          {"id": "q27", "topic": "Ratio and Proportion", "text": "If a:b = 2:3 and b:c = 4:5, what is a:b:c?", "options": ["A. 8:12:15", "B. 2:3:5", "C. 6:9:15", "D. 8:12:20"], "correctAnswer": 0, "marks": 1},
          {"id": "q28", "topic": "Time, Speed and Distance", "text": "A train 150m long is running at 54 km/hr. How much time will it take to cross a pole?", "options": ["A. 8 sec", "B. 10 sec", "C. 12 sec", "D. 15 sec"], "correctAnswer": 1, "marks": 1},
          {"id": "q29", "topic": "Time, Speed and Distance", "text": "Walking at 3/4 of his usual speed, a man reaches his office 20 minutes late. What is his usual time?", "options": ["A. 40 min", "B. 50 min", "C. 60 min", "D. 70 min"], "correctAnswer": 2, "marks": 1},
          {"id": "q30", "topic": "Time, Speed and Distance", "text": "Two cars travel toward each other from points 400 km apart at speeds of 40 km/h and 60 km/h. When will they meet?", "options": ["A. 3 hours", "B. 4 hours", "C. 5 hours", "D. 6 hours"], "correctAnswer": 1, "marks": 1},
          {"id": "q31", "topic": "Work and Time", "text": "A can do a piece of work in 12 days and B in 15 days. They work together for 4 days and then A leaves. How long will B take to finish the remaining work?", "options": ["A. 5 days", "B. 6 days", "C. 8 days", "D. 9 days"], "correctAnswer": 1, "marks": 1},
          {"id": "q32", "topic": "Work and Time", "text": "Pipe A can fill a tank in 10 hours and Pipe B in 15 hours. If both are opened together, how long will it take to fill the tank?", "options": ["A. 5 hours", "B. 6 hours", "C. 7.5 hours", "D. 8 hours"], "correctAnswer": 1, "marks": 1},
          {"id": "q33", "topic": "Work and Time", "text": "12 men can complete a work in 18 days. In how many days can 9 men complete the same work?", "options": ["A. 21 days", "B. 24 days", "C. 27 days", "D. 30 days"], "correctAnswer": 1, "marks": 1},
          {"id": "q34", "topic": "Word Problem (Algebraic)", "text": "In a farm, there are cows and chickens. If heads are counted, there are 40. If legs are counted, there are 110. How many cows are there?", "options": ["A. 10", "B. 15", "C. 20", "D. 25"], "correctAnswer": 1, "marks": 1},
          {"id": "q35", "topic": "Word Problem", "text": "Five years ago, a mother was three times as old as her daughter. Ten years hence, she will be twice as old as her daughter. What is the present age of the mother?", "options": ["A. 45", "B. 50", "C. 55", "D. 60"], "correctAnswer": 1, "marks": 1},
          {"id": "q36", "topic": "Word Problem", "text": "The cost of 3 tables and 2 chairs is Rs. 1800. If a table costs Rs. 200 more than a chair, find the cost of a table.", "options": ["A. Rs. 440", "B. Rs. 240", "C. Rs. 480", "D. Rs. 360"], "correctAnswer": 0, "marks": 1},
          {"id": "q37", "topic": "Probability", "text": "Two dice are rolled. What is the probability that the sum of the numbers is 10?", "options": ["A. 1/12", "B. 1/9", "C. 1/6", "D. 1/4"], "correctAnswer": 0, "marks": 1},
          {"id": "q38", "topic": "Probability", "text": "A bag contains 4 red, 5 green, and 6 blue balls. If one ball is drawn at random, what is the probability it is green?", "options": ["A. 1/5", "B. 1/3", "C. 4/15", "D. 1/4"], "correctAnswer": 1, "marks": 1},
          {"id": "q39", "topic": "Probability", "text": "Three coins are tossed simultaneously. What is the probability of getting exactly two heads?", "options": ["A. 1/8", "B. 3/8", "C. 1/2", "D. 5/8"], "correctAnswer": 1, "marks": 1},
          {"id": "q40", "topic": "Problem on Numbers", "text": "A two-digit number is 4 times the sum of its digits. If 18 is added to the number, the digits are reversed. The number is:", "options": ["A. 12", "B. 24", "C. 36", "D. 48"], "correctAnswer": 1, "marks": 1},
          {"id": "q41", "topic": "Problem on Numbers", "text": "The difference between a number and its square is 72. The number is:", "options": ["A. 8", "B. 9", "C. 10", "D. -8 (if integer set considered) or 9"], "correctAnswer": 1, "marks": 1},
          {"id": "q42", "topic": "Problem on Numbers", "text": "Three numbers are in the ratio 3:4:5 and their sum is 60. The largest number is:", "options": ["A. 20", "B. 25", "C. 30", "D. 15"], "correctAnswer": 1, "marks": 1},
          {"id": "q43", "topic": "Mean, Median, and Mode", "text": "Find the median of the data set: 12, 15, 11, 18, 20, 15, 14", "options": ["A. 14", "B. 15", "C. 16", "D. 18"], "correctAnswer": 1, "marks": 1},
          {"id": "q44", "topic": "Mean, Median, and Mode", "text": "If the mean of five numbers is 10 and the mean of three of them is 8, what is the mean of the remaining two?", "options": ["A. 11", "B. 12", "C. 13", "D. 14"], "correctAnswer": 2, "marks": 1},
          {"id": "q45", "topic": "Combination", "text": "How many ways can a committee of 3 people be chosen from a group of 10 people?", "options": ["A. 30", "B. 120", "C. 720", "D. 1000"], "correctAnswer": 1, "marks": 1}
        ]
      }
    ]
  }'::jsonb
)
ON CONFLICT (external_id) DO UPDATE
SET 
  metadata = EXCLUDED.metadata,
  title = EXCLUDED.title,
  duration_seconds = EXCLUDED.duration_seconds,
  updated_at = now();
