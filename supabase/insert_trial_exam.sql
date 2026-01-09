-- ============================================================================
-- INSERT TRIAL EXAM DATA (Adapted for existing mocks/questions structure)
-- ============================================================================

-- Insert the trial mock exam
INSERT INTO public.mocks (title, description, duration_minutes, total_questions, difficulty, is_trial)
VALUES (
  'BBA Mathematics Mock Test 1',
  'A comprehensive mathematics test covering algebra, calculus, probability, and word problems.',
  165, -- 2 hours 45 minutes
  45,
  'medium',
  true
)
ON CONFLICT DO NOTHING
RETURNING id;

-- Note: After running the above, you'll get the mock_id
-- Use that ID to insert questions below by replacing 'YOUR_MOCK_ID_HERE'

-- Or run this dynamic version:
DO $$
DECLARE
  mock_id_var uuid;
BEGIN
  -- Get or create the trial mock
  SELECT id INTO mock_id_var
  FROM public.mocks
  WHERE title = 'BBA Mathematics Mock Test 1' AND is_trial = true
  LIMIT 1;

  IF mock_id_var IS NULL THEN
    INSERT INTO public.mocks (title, description, duration_minutes, total_questions, difficulty, is_trial)
    VALUES (
      'BBA Mathematics Mock Test 1',
      'A comprehensive mathematics test covering algebra, calculus, probability, and word problems.',
      165,
      45,
      'medium',
      true
    )
    RETURNING id INTO mock_id_var;
  END IF;

  -- Delete existing questions for this mock (in case of re-run)
  DELETE FROM public.questions WHERE mock_id = mock_id_var;

  -- Insert all 45 questions
  INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES
  (mock_id_var, 'mcq', 'A wallet contains Rs. 600 in the form of one-rupee, two-rupee, and five-rupee coins. The number of coins of each denomination is the same. What is the total number of coins in the wallet?', '["A. 75", "B. 150", "C. 225", "D. 300"]'::jsonb, 'C. 225'),
  (mock_id_var, 'mcq', 'The price of 6 notebooks is equal to that of 9 pens. If the combined price of 4 notebooks and 6 pens is Rs. 800, what is the price of 5 notebooks?', '["A. Rs. 400", "B. Rs. 500", "C. Rs. 600", "D. Rs. 750"]'::jsonb, 'B. Rs. 500'),
  (mock_id_var, 'mcq', 'Class X has two sections, A and B. If 5 students move from A to B, both sections have equal students. If 5 students move from B to A, section A has three times as many students as B. How many students are in section A?', '["A. 15", "B. 25", "C. 35", "D. 45"]'::jsonb, 'B. 25'),
  (mock_id_var, 'mcq', 'If x + 1/x = 6, what is the value of x² + 1/x²?', '["A. 34", "B. 36", "C. 38", "D. 32"]'::jsonb, 'A. 34'),
  (mock_id_var, 'mcq', 'If a + b + c = 10 and ab + bc + ca = 25, find the value of a² + b² + c².', '["A. 40", "B. 50", "C. 60", "D. 75"]'::jsonb, 'B. 50'),
  (mock_id_var, 'mcq', 'If x = 3 + √8, find the value of x² + 1/x².', '["A. 32", "B. 34", "C. 36", "D. 38"]'::jsonb, 'B. 34'),
  (mock_id_var, 'mcq', 'Which of the following values of x satisfies the inequality |2x - 5| ≤ 9?', '["A. 8", "B. -3", "C. 5", "D. All of the above"]'::jsonb, 'D. All of the above'),
  (mock_id_var, 'mcq', 'If x is an integer, how many values of x satisfy |x - 5| < 4?', '["A. 5", "B. 6", "C. 7", "D. 8"]'::jsonb, 'C. 7'),
  (mock_id_var, 'mcq', 'Solve for x: -3 < 2x - 1 < 7', '["A. -1 < x < 4", "B. -2 < x < 3", "C. -1 < x < 3", "D. 1 < x < 4"]'::jsonb, 'A. -1 < x < 4'),
  (mock_id_var, 'mcq', 'If 5^(x+1) + 5^(x-1) = 650, find the value of x.', '["A. 1", "B. 2", "C. 3", "D. 4"]'::jsonb, 'C. 3'),
  (mock_id_var, 'mcq', 'Simplify: (√7 + √5) / (√7 - √5) + (√7 - √5) / (√7 + √5)', '["A. 6", "B. 12", "C. 7", "D. 5"]'::jsonb, 'B. 12'),
  (mock_id_var, 'mcq', 'Which is larger: ∛4 or √3?', '["A. ∛4", "B. √3", "C. They are equal", "D. Cannot be determined"]'::jsonb, 'B. √3'),
  (mock_id_var, 'mcq', 'The sum of five consecutive even integers is 200. What is the smallest of these integers?', '["A. 34", "B. 36", "C. 38", "D. 40"]'::jsonb, 'B. 36'),
  (mock_id_var, 'mcq', 'If n is an odd integer, which of the following must be even?', '["A. 3n + 2", "B. 2n + 1", "C. n(n + 3)", "D. n² + 1"]'::jsonb, 'D. n² + 1'),
  (mock_id_var, 'mcq', 'What is the remainder when 3^21 is divided by 5?', '["A. 1", "B. 2", "C. 3", "D. 4"]'::jsonb, 'C. 3'),
  (mock_id_var, 'mcq', 'The average weight of a class of 20 students increases by 0.5 kg when one student weighing 40 kg is replaced by a new student. What is the weight of the new student?', '["A. 45 kg", "B. 50 kg", "C. 55 kg", "D. 60 kg"]'::jsonb, 'B. 50 kg'),
  (mock_id_var, 'mcq', 'The average of 5 numbers is 27. If one number is excluded, the average becomes 25. The excluded number is:', '["A. 25", "B. 30", "C. 35", "D. 40"]'::jsonb, 'C. 35'),
  (mock_id_var, 'mcq', 'A cricketer has an average score of 45 runs in 10 innings. How many runs must he score in the 11th inning to raise his average to 50?', '["A. 90", "B. 100", "C. 55", "D. 95"]'::jsonb, 'B. 100'),
  (mock_id_var, 'mcq', 'A tank is 3/5 full. If 20 liters are removed, it becomes 1/2 full. What is the total capacity of the tank?', '["A. 150 liters", "B. 200 liters", "C. 250 liters", "D. 300 liters"]'::jsonb, 'B. 200 liters'),
  (mock_id_var, 'mcq', 'A man spends 1/3 of his income on rent and 2/5 of the remainder on food. If he is left with Rs. 4000, what is his monthly income?', '["A. Rs. 8000", "B. Rs. 10000", "C. Rs. 12000", "D. Rs. 15000"]'::jsonb, 'B. Rs. 10000'),
  (mock_id_var, 'mcq', 'By how much is 4/5 of 60 greater than 3/4 of 40?', '["A. 15", "B. 18", "C. 20", "D. 12"]'::jsonb, 'B. 18'),
  (mock_id_var, 'mcq', 'If the length of a rectangle is increased by 20% and the width is decreased by 10%, what is the percentage change in area?', '["A. 8% increase", "B. 10% increase", "C. 8% decrease", "D. No change"]'::jsonb, 'A. 8% increase'),
  (mock_id_var, 'mcq', 'A student scored 32% marks and failed by 6 marks. Another student scored 42% marks and got 14 marks more than the passing marks. The maximum marks are:', '["A. 150", "B. 200", "C. 250", "D. 300"]'::jsonb, 'B. 200'),
  (mock_id_var, 'mcq', 'Price of petrol increased by 25%. By how much percent should a car owner reduce his consumption so that expenditure remains the same?', '["A. 20%", "B. 25%", "C. 15%", "D. 30%"]'::jsonb, 'A. 20%'),
  (mock_id_var, 'mcq', 'Two numbers are in the ratio 4:5. If 5 is subtracted from each, the ratio becomes 3:4. The numbers are:', '["A. 16, 20", "B. 20, 25", "C. 24, 30", "D. 40, 50"]'::jsonb, 'B. 20, 25'),
  (mock_id_var, 'mcq', 'A bag contains 50p, 25p, and 10p coins in the ratio 5:9:4. The total value is Rs. 206. How many 25p coins are there?', '["A. 200", "B. 360", "C. 160", "D. 180"]'::jsonb, 'B. 360'),
  (mock_id_var, 'mcq', 'If a:b = 2:3 and b:c = 4:5, what is a:b:c?', '["A. 8:12:15", "B. 2:3:5", "C. 6:9:15", "D. 8:12:20"]'::jsonb, 'A. 8:12:15'),
  (mock_id_var, 'mcq', 'A train 150m long is running at 54 km/hr. How much time will it take to cross a pole?', '["A. 8 sec", "B. 10 sec", "C. 12 sec", "D. 15 sec"]'::jsonb, 'B. 10 sec'),
  (mock_id_var, 'mcq', 'Walking at 3/4 of his usual speed, a man reaches his office 20 minutes late. What is his usual time?', '["A. 40 min", "B. 50 min", "C. 60 min", "D. 70 min"]'::jsonb, 'C. 60 min'),
  (mock_id_var, 'mcq', 'Two cars travel toward each other from points 400 km apart at speeds of 40 km/h and 60 km/h. When will they meet?', '["A. 3 hours", "B. 4 hours", "C. 5 hours", "D. 6 hours"]'::jsonb, 'B. 4 hours'),
  (mock_id_var, 'mcq', 'A can do a piece of work in 12 days and B in 15 days. They work together for 4 days and then A leaves. How long will B take to finish the remaining work?', '["A. 5 days", "B. 6 days", "C. 8 days", "D. 9 days"]'::jsonb, 'B. 6 days'),
  (mock_id_var, 'mcq', 'Pipe A can fill a tank in 10 hours and Pipe B in 15 hours. If both are opened together, how long will it take to fill the tank?', '["A. 5 hours", "B. 6 hours", "C. 7.5 hours", "D. 8 hours"]'::jsonb, 'B. 6 hours'),
  (mock_id_var, 'mcq', '12 men can complete a work in 18 days. In how many days can 9 men complete the same work?', '["A. 21 days", "B. 24 days", "C. 27 days", "D. 30 days"]'::jsonb, 'B. 24 days'),
  (mock_id_var, 'mcq', 'In a farm, there are cows and chickens. If heads are counted, there are 40. If legs are counted, there are 110. How many cows are there?', '["A. 10", "B. 15", "C. 20", "D. 25"]'::jsonb, 'B. 15'),
  (mock_id_var, 'mcq', 'Five years ago, a mother was three times as old as her daughter. Ten years hence, she will be twice as old as her daughter. What is the present age of the mother?', '["A. 45", "B. 50", "C. 55", "D. 60"]'::jsonb, 'B. 50'),
  (mock_id_var, 'mcq', 'The cost of 3 tables and 2 chairs is Rs. 1800. If a table costs Rs. 200 more than a chair, find the cost of a table.', '["A. Rs. 440", "B. Rs. 240", "C. Rs. 480", "D. Rs. 360"]'::jsonb, 'A. Rs. 440'),
  (mock_id_var, 'mcq', 'Two dice are rolled. What is the probability that the sum of the numbers is 10?', '["A. 1/12", "B. 1/9", "C. 1/6", "D. 1/4"]'::jsonb, 'A. 1/12'),
  (mock_id_var, 'mcq', 'A bag contains 4 red, 5 green, and 6 blue balls. If one ball is drawn at random, what is the probability it is green?', '["A. 1/5", "B. 1/3", "C. 4/15", "D. 1/4"]'::jsonb, 'B. 1/3'),
  (mock_id_var, 'mcq', 'Three coins are tossed simultaneously. What is the probability of getting exactly two heads?', '["A. 1/8", "B. 3/8", "C. 1/2", "D. 5/8"]'::jsonb, 'B. 3/8'),
  (mock_id_var, 'mcq', 'A two-digit number is 4 times the sum of its digits. If 18 is added to the number, the digits are reversed. The number is:', '["A. 12", "B. 24", "C. 36", "D. 48"]'::jsonb, 'B. 24'),
  (mock_id_var, 'mcq', 'The difference between a number and its square is 72. The number is:', '["A. 8", "B. 9", "C. 10", "D. -8 (if integer set considered) or 9"]'::jsonb, 'B. 9'),
  (mock_id_var, 'mcq', 'Three numbers are in the ratio 3:4:5 and their sum is 60. The largest number is:', '["A. 20", "B. 25", "C. 30", "D. 15"]'::jsonb, 'B. 25'),
  (mock_id_var, 'mcq', 'Find the median of the data set: 12, 15, 11, 18, 20, 15, 14', '["A. 14", "B. 15", "C. 16", "D. 18"]'::jsonb, 'B. 15'),
  (mock_id_var, 'mcq', 'If the mean of five numbers is 10 and the mean of three of them is 8, what is the mean of the remaining two?', '["A. 11", "B. 12", "C. 13", "D. 14"]'::jsonb, 'C. 13'),
  (mock_id_var, 'mcq', 'How many ways can a committee of 3 people be chosen from a group of 10 people?', '["A. 30", "B. 120", "C. 720", "D. 1000"]'::jsonb, 'B. 120');

  RAISE NOTICE 'Successfully inserted trial exam with % questions', 45;
END $$;
