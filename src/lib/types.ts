export type QuestionFeedback = 'Got it' | 'Struggled' | 'Wrong' | null;

export type Question = {
  id: string;
  question: string;
  imageDataUri?: string | null;
  explanation?: string | null;
  topic?: string;
  feedback: QuestionFeedback;
};
