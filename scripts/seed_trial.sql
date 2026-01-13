-- VALSENT TRIAL MOCK EXAM SEED DATA
-- Mock ID: 11111111-1111-1111-1111-111111111111

-- 0. Update Schema Constraints
-- Allow 'math' and 'eng' types in questions table
ALTER TABLE public.questions DROP CONSTRAINT IF EXISTS questions_type_check;
ALTER TABLE public.questions ADD CONSTRAINT questions_type_check CHECK (type IN ('mcq', 'text', 'math', 'eng'));

-- 1. Cleanup & Insert Mock
DELETE FROM public.questions WHERE mock_id = '11111111-1111-1111-1111-111111111111';
INSERT INTO public.mocks (id, title, description, duration_minutes, total_questions, difficulty, is_trial)
VALUES ('11111111-1111-1111-1111-111111111111', 'BBA Trial Mock Exam', 'A comprehensive trial mock exam for BBA preparation.', 165, 90, 'medium', true)
ON CONFLICT (id) DO UPDATE SET total_questions = 90, title = 'BBA Trial Mock Exam';

-- 2. Insert Questions (Math)
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'A wallet contains Rs. 600 in the form of one-rupee, two-rupee, and five-rupee coins. The number of coins of each denomination is the same. What is the total number of coins in the wallet?', '["A. 75","B. 150","C. 225","D. 300"]'::jsonb, 'C. 225');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'The price of 6 notebooks is equal to that of 9 pens. If the combined price of 4 notebooks and 6 pens is Rs. 800, what is the price of 5 notebooks?', '["A. Rs. 400","B. Rs. 500","C. Rs. 600","D. Rs. 750"]'::jsonb, 'B. Rs. 500');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'Class X has two sections, A and B. If 5 students move from A to B, both sections have equal students. If 5 students move from B to A, section A has three times as many students as B. How many students are in section A?', '["A. 15","B. 25","C. 35","D. 45"]'::jsonb, 'B. 25');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'If x + 1/x = 6, what is the value of x² + 1/x²?', '["A. 34","B. 36","C. 38","D. 32"]'::jsonb, 'A. 34');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'If a + b + c = 10 and ab + bc + ca = 25, find the value of a² + b² + c².', '["A. 40","B. 50","C. 60","D. 75"]'::jsonb, 'B. 50');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'If x = 3 + √8, find the value of x² + 1/x².', '["A. 32","B. 34","C. 36","D. 38"]'::jsonb, 'B. 34');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'Which of the following values of x satisfies the inequality |2x - 5| ≤ 9?', '["A. 8","B. -3","C. 5","D. All of the above"]'::jsonb, 'D. All of the above');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'If x is an integer, how many values of x satisfy |x - 5| < 4?', '["A. 5","B. 6","C. 7","D. 8"]'::jsonb, 'C. 7');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'Solve for x: -3 < 2x - 1 < 7', '["A. -1 < x < 4","B. -2 < x < 3","C. -1 < x < 3","D. 1 < x < 4"]'::jsonb, 'A. -1 < x < 4');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'If 5^(x+1) + 5^(x-1) = 650, find the value of x.', '["A. 1","B. 2","C. 3","D. 4"]'::jsonb, 'C. 3');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'Simplify: (√7 + √5) / (√7 - √5) + (√7 - √5) / (√7 + √5)', '["A. 6","B. 12","C. 7","D. 5"]'::jsonb, 'B. 12');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'Which is larger: ∛4 or √3?', '["A. ∛4","B. √3","C. They are equal","D. Cannot be determined"]'::jsonb, 'B. √3');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'The sum of five consecutive even integers is 200. What is the smallest of these integers?', '["A. 34","B. 36","C. 38","D. 40"]'::jsonb, 'B. 36');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'If n is an odd integer, which of the following must be even?', '["A. 3n + 2","B. 2n + 1","C. n(n + 3)","D. n² + 1"]'::jsonb, 'D. n² + 1');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'What is the remainder when 3^21 is divided by 5?', '["A. 1","B. 2","C. 3","D. 4"]'::jsonb, 'C. 3');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'The average weight of a class of 20 students increases by 0.5 kg when one student weighing 40 kg is replaced by a new student. What is the weight of the new student?', '["A. 45 kg","B. 50 kg","C. 55 kg","D. 60 kg"]'::jsonb, 'B. 50 kg');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'The average of 5 numbers is 27. If one number is excluded, the average becomes 25. The excluded number is:', '["A. 25","B. 30","C. 35","D. 40"]'::jsonb, 'C. 35');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'A cricketer has an average score of 45 runs in 10 innings. How many runs must he score in the 11th inning to raise his average to 50?', '["A. 90","B. 100","C. 55","D. 95"]'::jsonb, 'B. 100');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'A tank is 3/5 full. If 20 liters are removed, it becomes 1/2 full. What is the total capacity of the tank?', '["A. 150 liters","B. 200 liters","C. 250 liters","D. 300 liters"]'::jsonb, 'B. 200 liters');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'A man spends 1/3 of his income on rent and 2/5 of the remainder on food. If he is left with Rs. 4000, what is his monthly income?', '["A. Rs. 8000","B. Rs. 10000","C. Rs. 12000","D. Rs. 15000"]'::jsonb, 'B. Rs. 10000');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'By how much is 4/5 of 60 greater than 3/4 of 40?', '["A. 15","B. 18","C. 20","D. 12"]'::jsonb, 'B. 18');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'If the length of a rectangle is increased by 20% and the width is decreased by 10%, what is the percentage change in area?', '["A. 8% increase","B. 10% increase","C. 8% decrease","D. No change"]'::jsonb, 'A. 8% increase');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'A student scored 32% marks and failed by 6 marks. Another student scored 42% marks and got 14 marks more than the passing marks. The maximum marks are:', '["A. 150","B. 200","C. 250","D. 300"]'::jsonb, 'B. 200');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'Price of petrol increased by 25%. By how much percent should a car owner reduce his consumption so that expenditure remains the same?', '["A. 20%","B. 25%","C. 15%","D. 30%"]'::jsonb, 'A. 20%');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'Two numbers are in the ratio 4:5. If 5 is subtracted from each, the ratio becomes 3:4. The numbers are:', '["A. 16, 20","B. 20, 25","C. 24, 30","D. 40, 50"]'::jsonb, 'B. 20, 25');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'A bag contains 50p, 25p, and 10p coins in the ratio 5:9:4. The total value is Rs. 206. How many 25p coins are there?', '["A. 200","B. 360","C. 160","D. 180"]'::jsonb, 'B. 360');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'If a:b = 2:3 and b:c = 4:5, what is a:b:c?', '["A. 8:12:15","B. 2:3:5","C. 6:9:15","D. 8:12:20"]'::jsonb, 'A. 8:12:15');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'A train 150m long is running at 54 km/hr. How much time will it take to cross a pole?', '["A. 8 sec","B. 10 sec","C. 12 sec","D. 15 sec"]'::jsonb, 'B. 10 sec');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'Walking at 3/4 of his usual speed, a man reaches his office 20 minutes late. What is his usual time?', '["A. 40 min","B. 50 min","C. 60 min","D. 70 min"]'::jsonb, 'C. 60 min');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'Two cars travel toward each other from points 400 km apart at speeds of 40 km/h and 60 km/h. When will they meet?', '["A. 3 hours","B. 4 hours","C. 5 hours","D. 6 hours"]'::jsonb, 'B. 4 hours');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'A can do a piece of work in 12 days and B in 15 days. They work together for 4 days and then A leaves. How long will B take to finish the remaining work?', '["A. 5 days","B. 6 days","C. 8 days","D. 9 days"]'::jsonb, 'B. 6 days');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'Pipe A can fill a tank in 10 hours and Pipe B in 15 hours. If both are opened together, how long will it take to fill the tank?', '["A. 5 hours","B. 6 hours","C. 7.5 hours","D. 8 hours"]'::jsonb, 'B. 6 hours');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', '12 men can complete a work in 18 days. In how many days can 9 men complete the same work?', '["A. 21 days","B. 24 days","C. 27 days","D. 30 days"]'::jsonb, 'B. 24 days');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'In a farm, there are cows and chickens. If heads are counted, there are 40. If legs are counted, there are 110. How many cows are there?', '["A. 10","B. 15","C. 20","D. 25"]'::jsonb, 'B. 15');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'Five years ago, a mother was three times as old as her daughter. Ten years hence, she will be twice as old as her daughter. What is the mother''s present age?', '["A. 45","B. 50","C. 55","D. 60"]'::jsonb, 'B. 50');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'The cost of 3 tables and 2 chairs is Rs. 1800. If a table costs Rs. 200 more than a chair, find the cost of a table.', '["A. Rs. 440","B. Rs. 240","C. Rs. 480","D. Rs. 360"]'::jsonb, 'A. Rs. 440');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'Two dice are rolled. What is the probability that the sum of the numbers is 10?', '["A. 1/12","B. 1/9","C. 1/6","D. 1/4"]'::jsonb, 'A. 1/12');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'A bag contains 4 red, 5 green, and 6 blue balls. If one ball is drawn at random, what is the probability it is green?', '["A. 1/5","B. 1/3","C. 4/15","D. 1/4"]'::jsonb, 'B. 1/3');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'Three coins are tossed simultaneously. What is the probability of getting exactly two heads?', '["A. 1/8","B. 3/8","C. 1/2","D. 5/8"]'::jsonb, 'B. 3/8');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'A two-digit number is 4 times the sum of its digits. If 18 is added to the number, the digits are reversed. The number is:', '["A. 12","B. 24","C. 36","D. 48"]'::jsonb, 'B. 24');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'The difference between a number and its square is 72. The number is:', '["A. 8","B. 9","C. 10","D. -8 (if integer set considered) or 9"]'::jsonb, 'B. 9');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'Three numbers are in the ratio 3:4:5 and their sum is 60. The largest number is:', '["A. 20","B. 25","C. 30","D. 15"]'::jsonb, 'B. 25');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'Find the median of the data set: 12, 15, 11, 18, 20, 15, 14', '["A. 14","B. 15","C. 16","D. 18"]'::jsonb, 'B. 15');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'If the mean of five numbers is 10 and the mean of three of them is 8, what is the mean of the remaining two?', '["A. 11","B. 12","C. 13","D. 14"]'::jsonb, 'C. 13');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'math', 'How many ways can a committee of 3 people be chosen from a group of 10 people?', '["A. 30","B. 120","C. 720","D. 1000"]'::jsonb, 'B. 120');

-- 3. Insert Questions (English)
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'The professor’s lecture was so __________ that many students struggled to grasp the core concepts, leaving the hall more confused than when they entered.', '["A. lucid","B. esoteric","C. pragmatic","D. jovial"]'::jsonb, 'B. esoteric');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'Although the CEO’s speech was brief, it was __________; she managed to inspire the entire company in just three minutes.', '["A. trenchant","B. redundant","C. verbose","D. tedious"]'::jsonb, 'A. trenchant');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'The diplomat was known for his __________ nature; he could calm even the most hostile negotiations with his gentle demeanor.', '["A. belligerent","B. placid","C. erratic","D. mercenary"]'::jsonb, 'B. placid');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'The evidence presented by the defense was __________, effectively disproving the prosecution''s entire theory of the crime.', '["A. irrefutable","B. ambiguous","C. tentative","D. hypothetical"]'::jsonb, 'A. irrefutable');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'Historically, the island has been __________ to hurricanes, suffering major damage at least once a decade.', '["A. immune","B. indifferent","C. susceptible","D. hostile"]'::jsonb, 'C. susceptible');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'The software engineer found the code to be __________, filled with unnecessary lines that slowed down the processing speed.', '["A. efficient","B. extraneous","C. vital","D. intrinsic"]'::jsonb, 'B. extraneous');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'Despite his reputation for being __________, the billionaire secretly donated millions to charity every year.', '["A. munificent","B. miserly","C. altruistic","D. gregarious"]'::jsonb, 'B. miserly');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'The critic’s review was entirely __________; he attacked the author’s personal life rather than the quality of the book.', '["A. objective","B. ad hominem","C. analytical","D. laudatory"]'::jsonb, 'B. ad hominem');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'The atmosphere in the meeting room was __________; everyone was shouting, and no agreement could be reached.', '["A. harmonious","B. chaotic","C. serene","D. collaborative"]'::jsonb, 'B. chaotic');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'To __________ the effects of the drought, the city council implemented strict water conservation measures.', '["A. exacerbate","B. mitigate","C. ignore","D. provoke"]'::jsonb, 'B. mitigate');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'Identify the error: (A) Between you and I, (B) the decision to hire the new manager (C) was made rather hastily. (D) No error.', '["A. Between","B. the","C. was","D. No error"]'::jsonb, 'A. Between');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'Identify the error: The team of researchers (A) have discovered a new species of (B) frog that (C) glows in the dark. (D) No error.', '["A. have","B. frog","C. glows","D. No error"]'::jsonb, 'A. have');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'Identify the error: (A) Having finished his homework, (B) the TV was turned on (C) by Mark. (D) No error.', '["A. Having finished","B. the TV","C. by","D. No error"]'::jsonb, 'B. the TV');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'Identify the error: The novel, (A) which was published in 1920, (B) depict the struggles of (C) the working class. (D) No error.', '["A. which","B. depict","C. the","D. No error"]'::jsonb, 'B. depict');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'Identify the error: Neither the players (A) nor the coach (B) were aware that the game (C) had been canceled. (D) No error.', '["A. nor","B. were","C. had been","D. No error"]'::jsonb, 'B. were');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'Identify the error: She is one of the (A) few people who (B) knows how to (C) operate this machine. (D) No error.', '["A. few","B. knows","C. operate","D. No error"]'::jsonb, 'B. knows');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'Identify the error: (A) Despite he studied hard, he (B) failed to score (C) well on the exam. (D) No error.', '["A. Despite","B. failed","C. well","D. No error"]'::jsonb, 'A. Despite');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'Identify the error: The scenery in Switzerland is (A) more beautiful than (B) any country (C) in Europe. (D) No error.', '["A. more beautiful","B. any","C. in","D. No error"]'::jsonb, 'B. any');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'Identify the error: (A) Hardly had I reached the station (B) than the train (C) left. (D) No error.', '["A. Hardly had","B. than","C. left","D. No error"]'::jsonb, 'B. than');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'Identify the error: If I (A) was you, I (B) would accept the offer (C) immediately. (D) No error.', '["A. was","B. would","C. immediately","D. No error"]'::jsonb, 'A. was');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'Passage: The rise of the ''gig economy''—a labor market characterized by the prevalence of short-term contracts or freelance work as opposed to permanent jobs—has fundamentally shifted the traditional understanding of employment. Proponents argue that this shift empowers workers, offering them the flexibility to choose their hours and the autonomy to be their own bosses. Platforms like Uber, Upwork, and TaskRabbit are cited as liberators that break the shackles of the 9-to-5 grind.

However, critics paint a starkly different picture. They contend that the gig economy is a euphemism for the erosion of worker rights. Without the safety net of health insurance, paid leave, and retirement benefits, gig workers are often left vulnerable to economic downturns. Furthermore, the algorithm-driven management of these platforms can be just as demanding, if not more so, than a human supervisor, often penalizing workers for taking breaks or refusing low-paying tasks. As this sector grows, the debate intensifies: is this the future of freedom, or a regression to a precariat class where financial stability is a luxury?

Question: The primary purpose of the passage is to:', '["A. Advocate for stricter regulations on gig economy platforms.","B. Describe the history of freelance work in the 21st century.","C. Present opposing views on the impact of the gig economy.","D. Explain how to become a successful gig worker."]'::jsonb, 'C. Present opposing views on the impact of the gig economy.');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'Passage: The rise of the ''gig economy''—a labor market characterized by the prevalence of short-term contracts or freelance work as opposed to permanent jobs—has fundamentally shifted the traditional understanding of employment. Proponents argue that this shift empowers workers, offering them the flexibility to choose their hours and the autonomy to be their own bosses. Platforms like Uber, Upwork, and TaskRabbit are cited as liberators that break the shackles of the 9-to-5 grind.

However, critics paint a starkly different picture. They contend that the gig economy is a euphemism for the erosion of worker rights. Without the safety net of health insurance, paid leave, and retirement benefits, gig workers are often left vulnerable to economic downturns. Furthermore, the algorithm-driven management of these platforms can be just as demanding, if not more so, than a human supervisor, often penalizing workers for taking breaks or refusing low-paying tasks. As this sector grows, the debate intensifies: is this the future of freedom, or a regression to a precariat class where financial stability is a luxury?

Question: The author implies that the ''freedom'' mentioned by proponents might be:', '["A. Absolute and beneficial for all workers.","B. A direct result of government intervention.","C. Illusory or accompanied by significant risks.","D. Only available to those with high-level technical skills."]'::jsonb, 'C. Illusory or accompanied by significant risks.');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'Passage: The rise of the ''gig economy''—a labor market characterized by the prevalence of short-term contracts or freelance work as opposed to permanent jobs—has fundamentally shifted the traditional understanding of employment. Proponents argue that this shift empowers workers, offering them the flexibility to choose their hours and the autonomy to be their own bosses. Platforms like Uber, Upwork, and TaskRabbit are cited as liberators that break the shackles of the 9-to-5 grind.

However, critics paint a starkly different picture. They contend that the gig economy is a euphemism for the erosion of worker rights. Without the safety net of health insurance, paid leave, and retirement benefits, gig workers are often left vulnerable to economic downturns. Furthermore, the algorithm-driven management of these platforms can be just as demanding, if not more so, than a human supervisor, often penalizing workers for taking breaks or refusing low-paying tasks. As this sector grows, the debate intensifies: is this the future of freedom, or a regression to a precariat class where financial stability is a luxury?

Question: As used in the passage, the word ''prevalence'' most nearly means:', '["A. Widespread presence","B. Rare occurrence","C. Legal requirement","D. Temporary nature"]'::jsonb, 'A. Widespread presence');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'Passage: The rise of the ''gig economy''—a labor market characterized by the prevalence of short-term contracts or freelance work as opposed to permanent jobs—has fundamentally shifted the traditional understanding of employment. Proponents argue that this shift empowers workers, offering them the flexibility to choose their hours and the autonomy to be their own bosses. Platforms like Uber, Upwork, and TaskRabbit are cited as liberators that break the shackles of the 9-to-5 grind.

However, critics paint a starkly different picture. They contend that the gig economy is a euphemism for the erosion of worker rights. Without the safety net of health insurance, paid leave, and retirement benefits, gig workers are often left vulnerable to economic downturns. Furthermore, the algorithm-driven management of these platforms can be just as demanding, if not more so, than a human supervisor, often penalizing workers for taking breaks or refusing low-paying tasks. As this sector grows, the debate intensifies: is this the future of freedom, or a regression to a precariat class where financial stability is a luxury?

Question: According to the critics mentioned in the passage, what is a major downside of the gig economy?', '["A. It requires workers to work 9-to-5 schedules.","B. It lacks traditional employment benefits like health insurance.","C. It prevents workers from using technology.","D. It offers too much money, causing inflation."]'::jsonb, 'B. It lacks traditional employment benefits like health insurance.');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'Passage: The rise of the ''gig economy''—a labor market characterized by the prevalence of short-term contracts or freelance work as opposed to permanent jobs—has fundamentally shifted the traditional understanding of employment. Proponents argue that this shift empowers workers, offering them the flexibility to choose their hours and the autonomy to be their own bosses. Platforms like Uber, Upwork, and TaskRabbit are cited as liberators that break the shackles of the 9-to-5 grind.

However, critics paint a starkly different picture. They contend that the gig economy is a euphemism for the erosion of worker rights. Without the safety net of health insurance, paid leave, and retirement benefits, gig workers are often left vulnerable to economic downturns. Furthermore, the algorithm-driven management of these platforms can be just as demanding, if not more so, than a human supervisor, often penalizing workers for taking breaks or refusing low-paying tasks. As this sector grows, the debate intensifies: is this the future of freedom, or a regression to a precariat class where financial stability is a luxury?

Question: The ''precariat class'' mentioned in the final sentence refers to:', '["A. Wealthy business owners.","B. Government officials who regulate labor.","C. Workers living in a state of financial insecurity.","D. The developers of gig economy apps."]'::jsonb, 'C. Workers living in a state of financial insecurity.');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'Passage: The rise of the ''gig economy''—a labor market characterized by the prevalence of short-term contracts or freelance work as opposed to permanent jobs—has fundamentally shifted the traditional understanding of employment. Proponents argue that this shift empowers workers, offering them the flexibility to choose their hours and the autonomy to be their own bosses. Platforms like Uber, Upwork, and TaskRabbit are cited as liberators that break the shackles of the 9-to-5 grind.

However, critics paint a starkly different picture. They contend that the gig economy is a euphemism for the erosion of worker rights. Without the safety net of health insurance, paid leave, and retirement benefits, gig workers are often left vulnerable to economic downturns. Furthermore, the algorithm-driven management of these platforms can be just as demanding, if not more so, than a human supervisor, often penalizing workers for taking breaks or refusing low-paying tasks. As this sector grows, the debate intensifies: is this the future of freedom, or a regression to a precariat class where financial stability is a luxury?

Question: The author’s attitude toward the gig economy can best be described as:', '["A. Unreservedly enthusiastic.","B. Deeply cynical and dismissive.","C. Balanced and objective.","D. Confused and indifferent."]'::jsonb, 'C. Balanced and objective.');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'Passage: The rise of the ''gig economy''—a labor market characterized by the prevalence of short-term contracts or freelance work as opposed to permanent jobs—has fundamentally shifted the traditional understanding of employment. Proponents argue that this shift empowers workers, offering them the flexibility to choose their hours and the autonomy to be their own bosses. Platforms like Uber, Upwork, and TaskRabbit are cited as liberators that break the shackles of the 9-to-5 grind.

However, critics paint a starkly different picture. They contend that the gig economy is a euphemism for the erosion of worker rights. Without the safety net of health insurance, paid leave, and retirement benefits, gig workers are often left vulnerable to economic downturns. Furthermore, the algorithm-driven management of these platforms can be just as demanding, if not more so, than a human supervisor, often penalizing workers for taking breaks or refusing low-paying tasks. As this sector grows, the debate intensifies: is this the future of freedom, or a regression to a precariat class where financial stability is a luxury?

Question: Which choice provides the best evidence for the claim that gig work is not truly autonomous?', '["A. Proponents argue that this shift empowers workers.","B. Platforms like Uber... are cited as liberators.","C. The algorithm-driven management... can be just as demanding.","D. Is this the future of freedom?"]'::jsonb, 'C. The algorithm-driven management... can be just as demanding.');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'Passage: In economics and business decision-making, a sunk cost is a cost that has already been incurred and cannot be recovered. The ''sunk cost fallacy'' occurs when individuals continue a behavior or endeavor as a result of previously invested resources (time, money, or effort) rather than based on the current optimal choice.

Imagine a company that has spent $5 million developing a new software product. Just before launch, a competitor releases a superior product for free. A rational actor would abandon the project to avoid further losses. However, the sunk cost fallacy drives the company to spend another $1 million to launch the inferior product, simply to ''justify'' the initial $5 million. This psychological trap often leads to ''throwing good money after bad.'' Recognizing this bias is crucial for effective leadership.

Question: The ''sunk cost fallacy'' is best defined as:', '["A. A strategy to recover lost money by investing more.","B. An irrational decision based on past unrecoverable investments.","C. A calculation method for future profits.","D. A legal term for bankruptcy proceedings."]'::jsonb, 'B. An irrational decision based on past unrecoverable investments.');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'Passage: In economics and business decision-making, a sunk cost is a cost that has already been incurred and cannot be recovered. The ''sunk cost fallacy'' occurs when individuals continue a behavior or endeavor as a result of previously invested resources (time, money, or effort) rather than based on the current optimal choice.

Imagine a company that has spent $5 million developing a new software product. Just before launch, a competitor releases a superior product for free. A rational actor would abandon the project to avoid further losses. However, the sunk cost fallacy drives the company to spend another $1 million to launch the inferior product, simply to ''justify'' the initial $5 million. This psychological trap often leads to ''throwing good money after bad.'' Recognizing this bias is crucial for effective leadership.

Question: In the example provided, a ''rational actor'' would:', '["A. Spend the additional $1 million to save face.","B. Sue the competitor for releasing a free product.","C. Stop the project to prevent further loss.","D. Launch the product and hope for the best."]'::jsonb, 'C. Stop the project to prevent further loss.');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'Passage: In economics and business decision-making, a sunk cost is a cost that has already been incurred and cannot be recovered. The ''sunk cost fallacy'' occurs when individuals continue a behavior or endeavor as a result of previously invested resources (time, money, or effort) rather than based on the current optimal choice.

Imagine a company that has spent $5 million developing a new software product. Just before launch, a competitor releases a superior product for free. A rational actor would abandon the project to avoid further losses. However, the sunk cost fallacy drives the company to spend another $1 million to launch the inferior product, simply to ''justify'' the initial $5 million. This psychological trap often leads to ''throwing good money after bad.'' Recognizing this bias is crucial for effective leadership.

Question: The phrase ''throwing good money after bad'' implies:', '["A. Investing wisely in a failing project to turn it around.","B. Wasting new resources on a project that has already failed.","C. Using counterfeit currency to pay debts.","D. Donating profits to charity."]'::jsonb, 'B. Wasting new resources on a project that has already failed.');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'Passage: In economics and business decision-making, a sunk cost is a cost that has already been incurred and cannot be recovered. The ''sunk cost fallacy'' occurs when individuals continue a behavior or endeavor as a result of previously invested resources (time, money, or effort) rather than based on the current optimal choice.

Imagine a company that has spent $5 million developing a new software product. Just before launch, a competitor releases a superior product for free. A rational actor would abandon the project to avoid further losses. However, the sunk cost fallacy drives the company to spend another $1 million to launch the inferior product, simply to ''justify'' the initial $5 million. This psychological trap often leads to ''throwing good money after bad.'' Recognizing this bias is crucial for effective leadership.

Question: The passage suggests that effective leadership requires:', '["A. Ignoring psychological biases.","B. The ability to ignore past costs when making future decisions.","C. A willingness to spend unlimited funds on development.","D. Persistence regardless of market conditions."]'::jsonb, 'B. The ability to ignore past costs when making future decisions.');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'Passage: In economics and business decision-making, a sunk cost is a cost that has already been incurred and cannot be recovered. The ''sunk cost fallacy'' occurs when individuals continue a behavior or endeavor as a result of previously invested resources (time, money, or effort) rather than based on the current optimal choice.

Imagine a company that has spent $5 million developing a new software product. Just before launch, a competitor releases a superior product for free. A rational actor would abandon the project to avoid further losses. However, the sunk cost fallacy drives the company to spend another $1 million to launch the inferior product, simply to ''justify'' the initial $5 million. This psychological trap often leads to ''throwing good money after bad.'' Recognizing this bias is crucial for effective leadership.

Question: The main structure of the passage is:', '["A. Definition followed by an illustrative example.","B. Chronological history of a concept.","C. A personal anecdote followed by statistical analysis.","D. A list of unrelated business terms."]'::jsonb, 'A. Definition followed by an illustrative example.');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'Passage:
Two roads diverged in a yellow wood,
And sorry I could not travel both
And be one traveler, long I stood
And looked down one as far as I could
To where it bent in the undergrowth;

Then took the other, as just as fair,
And having perhaps the better claim,
Because it was grassy and wanted wear;
Though as for that the passing there
Had worn them really about the same,

And both that morning equally lay
In leaves no step had trodden black.
Oh, I kept the first for another day!
Yet knowing how way leads on to way,
I doubted if I should ever come back.

Question: The speaker’s tone in the first stanza is primarily one of:', '["A. Regret and hesitation","B. Joy and excitement","C. Anger and frustration","D. Indifference and boredom"]'::jsonb, 'A. Regret and hesitation');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'Passage:
Two roads diverged in a yellow wood,
And sorry I could not travel both
And be one traveler, long I stood
And looked down one as far as I could
To where it bent in the undergrowth;

Then took the other, as just as fair,
And having perhaps the better claim,
Because it was grassy and wanted wear;
Though as for that the passing there
Had worn them really about the same,

And both that morning equally lay
In leaves no step had trodden black.
Oh, I kept the first for another day!
Yet knowing how way leads on to way,
I doubted if I should ever come back.

Question: The phrase ''wanted wear'' in the second stanza means the road:', '["A. Was in need of repair.","B. Was frequently traveled.","C. Had been traveled less than the other.","D. Desired to be paved."]'::jsonb, 'C. Had been traveled less than the other.');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'Passage:
Two roads diverged in a yellow wood,
And sorry I could not travel both
And be one traveler, long I stood
And looked down one as far as I could
To where it bent in the undergrowth;

Then took the other, as just as fair,
And having perhaps the better claim,
Because it was grassy and wanted wear;
Though as for that the passing there
Had worn them really about the same,

And both that morning equally lay
In leaves no step had trodden black.
Oh, I kept the first for another day!
Yet knowing how way leads on to way,
I doubted if I should ever come back.

Question: By saying ''I doubted if I should ever come back,'' the speaker acknowledges that:', '["A. He has a poor sense of direction.","B. Life’s choices are often irreversible.","C. He plans to return the very next day.","D. The woods are too dangerous to visit again."]'::jsonb, 'B. Life’s choices are often irreversible.');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'Passage:
Two roads diverged in a yellow wood,
And sorry I could not travel both
And be one traveler, long I stood
And looked down one as far as I could
To where it bent in the undergrowth;

Then took the other, as just as fair,
And having perhaps the better claim,
Because it was grassy and wanted wear;
Though as for that the passing there
Had worn them really about the same,

And both that morning equally lay
In leaves no step had trodden black.
Oh, I kept the first for another day!
Yet knowing how way leads on to way,
I doubted if I should ever come back.

Question: The central theme of the poem represents:', '["A. The beauty of autumn landscapes.","B. The importance of hiking alone.","C. The complexity and permanence of making choices.","D. The necessity of following the crowd."]'::jsonb, 'C. The complexity and permanence of making choices.');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'Passage:
Two roads diverged in a yellow wood,
And sorry I could not travel both
And be one traveler, long I stood
And looked down one as far as I could
To where it bent in the undergrowth;

Then took the other, as just as fair,
And having perhaps the better claim,
Because it was grassy and wanted wear;
Though as for that the passing there
Had worn them really about the same,

And both that morning equally lay
In leaves no step had trodden black.
Oh, I kept the first for another day!
Yet knowing how way leads on to way,
I doubted if I should ever come back.

Question: In the context of the poem, the ''yellow wood'' likely symbolizes:', '["A. A specific season (Autumn) representing change/transition.","B. A forest fire.","C. A cowardly decision.","D. A sunny, happy disposition."]'::jsonb, 'A. A specific season (Autumn) representing change/transition.');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'Passage:
Two roads diverged in a yellow wood,
And sorry I could not travel both
And be one traveler, long I stood
And looked down one as far as I could
To where it bent in the undergrowth;

Then took the other, as just as fair,
And having perhaps the better claim,
Because it was grassy and wanted wear;
Though as for that the passing there
Had worn them really about the same,

And both that morning equally lay
In leaves no step had trodden black.
Oh, I kept the first for another day!
Yet knowing how way leads on to way,
I doubted if I should ever come back.

Question: The speaker claims the second road had ''the better claim'' because:', '["A. It was a shorter route.","B. It seemed less traveled (grassy).","C. It was paved and smooth.","D. It led to a house."]'::jsonb, 'B. It seemed less traveled (grassy).');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'Passage: The origins of coffee are shrouded in legend. One story involves a goat herder named Kaldi in Ethiopia, who noticed that his goats became [39] after eating berries from a certain tree. Kaldi reported his findings to the abbot of the local monastery, who made a drink with the berries and found that it kept him [40] during the long hours of evening prayer. The knowledge of the ''energizing berries'' began to [41]. As word moved east and reached the Arabian peninsula, it began a journey which would [42] bring these beans across the globe. Today, coffee is one of the most [43] consumed beverages in the world.

Question: Select the best word for blank [39]:', '["A. lethargic","B. energetic","C. sick","D. invisible"]'::jsonb, 'B. energetic');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'Passage: The origins of coffee are shrouded in legend. One story involves a goat herder named Kaldi in Ethiopia, who noticed that his goats became [39] after eating berries from a certain tree. Kaldi reported his findings to the abbot of the local monastery, who made a drink with the berries and found that it kept him [40] during the long hours of evening prayer. The knowledge of the ''energizing berries'' began to [41]. As word moved east and reached the Arabian peninsula, it began a journey which would [42] bring these beans across the globe. Today, coffee is one of the most [43] consumed beverages in the world.

Question: Select the best word for blank [40]:', '["A. asleep","B. silent","C. alert","D. absent"]'::jsonb, 'C. alert');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'Passage: The origins of coffee are shrouded in legend. One story involves a goat herder named Kaldi in Ethiopia, who noticed that his goats became [39] after eating berries from a certain tree. Kaldi reported his findings to the abbot of the local monastery, who made a drink with the berries and found that it kept him [40] during the long hours of evening prayer. The knowledge of the ''energizing berries'' began to [41]. As word moved east and reached the Arabian peninsula, it began a journey which would [42] bring these beans across the globe. Today, coffee is one of the most [43] consumed beverages in the world.

Question: Select the best word for blank [41]:', '["A. spread","B. diminish","C. stagnation","D. revert"]'::jsonb, 'A. spread');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'Passage: The origins of coffee are shrouded in legend. One story involves a goat herder named Kaldi in Ethiopia, who noticed that his goats became [39] after eating berries from a certain tree. Kaldi reported his findings to the abbot of the local monastery, who made a drink with the berries and found that it kept him [40] during the long hours of evening prayer. The knowledge of the ''energizing berries'' began to [41]. As word moved east and reached the Arabian peninsula, it began a journey which would [42] bring these beans across the globe. Today, coffee is one of the most [43] consumed beverages in the world.

Question: Select the best word for blank [42]:', '["A. rarely","B. never","C. eventually","D. suddenly"]'::jsonb, 'C. eventually');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'Passage: The origins of coffee are shrouded in legend. One story involves a goat herder named Kaldi in Ethiopia, who noticed that his goats became [39] after eating berries from a certain tree. Kaldi reported his findings to the abbot of the local monastery, who made a drink with the berries and found that it kept him [40] during the long hours of evening prayer. The knowledge of the ''energizing berries'' began to [41]. As word moved east and reached the Arabian peninsula, it began a journey which would [42] bring these beans across the globe. Today, coffee is one of the most [43] consumed beverages in the world.

Question: Select the best word for blank [43]:', '["A. scarcely","B. widely","C. illegally","D. quietly"]'::jsonb, 'B. widely');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'Choose the best version of the bold portion: **Because the data was incomplete**, the committee decided to delay the vote until next month.', '["A. Because the data was incomplete","B. Being that the data was incomplete","C. Due to the fact that the data was incomplete","D. The data being incomplete"]'::jsonb, 'A. Because the data was incomplete');
INSERT INTO public.questions (mock_id, type, question_text, choices, correct_answer) VALUES ('11111111-1111-1111-1111-111111111111', 'eng', 'Choose the best version of the bold portion: The manager not only requires punctuality **but also he demands** absolute silence in the office.', '["A. but also he demands","B. but he also demands","C. but also demands","D. and also demanding"]'::jsonb, 'C. but also demands');