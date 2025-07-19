export type QuestionFeedback = 'Got it' | 'Struggled' | 'Wrong' | null;
export type QuestionType = 'Multiple-Choice' | 'Short Answer' | 'Long Answer';

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
};
