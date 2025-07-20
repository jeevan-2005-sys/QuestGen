export type QuestionFeedback = 'Got it' | 'Struggled' | 'Wrong' | null;
export type QuestionType = 'Multiple-Choice' | 'Short Answer' | 'Long Answer';
export type BloomsLevel =
  | 'Remembering'
  | 'Understanding'
  | 'Applying'
  | 'Analyzing'
  | 'Evaluating'
  | 'Creating';

export type Skill =
  | 'Analytical Ability'
  | 'Reasoning'
  | 'Problem Solving'
  | 'Critical Thinking'
  | 'Creativity';

export type Question = {
  id: string;
  question: string;
  questionType: QuestionType;
  imageDataUri?: string | null;
  explanation?: string | null;
  topic?: string;
  feedback: QuestionFeedback;
  options?: string[];
  answer?: string;
  marks?: number;
  bloomsLevel?: BloomsLevel;
  learningOutcome?: string;
  skill?: Skill;
  userAnswer?: string | null;
  answerFeedback?: string | null;
  suggestedAnswer?: string | null;
  predictedMarks?: number | null;
  requiresVisual?: boolean;
};
