export type QuestionFeedback = 'Got it' | 'Struggled' | 'Wrong' | null;
export type QuestionType = 'Multiple-Choice' | 'Short Answer' | 'Long Answer';
export type BloomsLevel = 'Remembering' | 'Understanding' | 'Applying' | 'Analyzing' | 'Evaluating' | 'Creating';

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
};
