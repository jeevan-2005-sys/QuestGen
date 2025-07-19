'use client';

import { useState, type Dispatch, type SetStateAction } from 'react';
import Image from 'next/image';
import { Lightbulb, Sparkles } from 'lucide-react';

import type { Question, QuestionFeedback } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { handleExplainAnswer } from '@/app/actions';
import { Skeleton } from '../ui/skeleton';

type QuestionCardProps = {
  question: Question;
  questionNumber: number;
  setQuestions: Dispatch<SetStateAction<Question[]>>;
};

export default function QuestionCard({
  question,
  questionNumber,
  setQuestions,
}: QuestionCardProps) {
  const [explanation, setExplanation] = useState<string | null>(
    question.explanation || null
  );
  const [isExplanationLoading, setIsExplanationLoading] = useState(false);

  const setFeedback = (feedback: QuestionFeedback) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === question.id ? { ...q, feedback } : q))
    );
  };

  const getExplanation = async () => {
    if (explanation) {
      setExplanation(null); // Toggle off if already visible
      return;
    }
    setIsExplanationLoading(true);
    try {
      const result = await handleExplainAnswer({
        question: question.question,
        answer: 'Correct Answer', // The AI will derive from the question context
      });
      setExplanation(result.explanation);
    } catch (error) {
      console.error('Failed to get explanation:', error);
      setExplanation('Sorry, could not fetch an explanation at this time.');
    } finally {
      setIsExplanationLoading(false);
    }
  };

  const feedbackOptions: QuestionFeedback[] = ['Got it', 'Struggled', 'Wrong'];

  return (
    <Card className="shadow-md transition-shadow hover:shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-body flex items-start">
          <span className="text-primary font-bold mr-3">{questionNumber}.</span>
          <p className="flex-1 whitespace-pre-wrap">{question.question}</p>
        </CardTitle>
      </CardHeader>
      {question.imageDataUri && (
        <CardContent>
          <div className="relative w-full h-64 border rounded-md overflow-hidden">
            <Image
              src={question.imageDataUri}
              alt={`Visual for question ${questionNumber}`}
              layout="fill"
              objectFit="contain"
              data-ai-hint="diagram chart"
            />
          </div>
        </CardContent>
      )}
      <CardFooter className="flex flex-col items-start gap-4">
        <div className="flex flex-wrap gap-2">
          {feedbackOptions.map((fb) => (
            <Button
              key={fb}
              variant={question.feedback === fb ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFeedback(fb)}
              className={cn({
                'bg-green-500 hover:bg-green-600 text-white':
                  question.feedback === 'Got it' && fb === 'Got it',
                'bg-yellow-500 hover:bg-yellow-600 text-white':
                  question.feedback === 'Struggled' && fb === 'Struggled',
                'bg-red-500 hover:bg-red-600 text-white':
                  question.feedback === 'Wrong' && fb === 'Wrong',
              })}
            >
              {fb}
            </Button>
          ))}
          <Button variant="ghost" size="sm" onClick={getExplanation} disabled={isExplanationLoading}>
            <Lightbulb className="mr-2 h-4 w-4" />
            {explanation ? 'Hide' : 'Explain Answer'}
          </Button>
        </div>
        {isExplanationLoading && <Skeleton className="h-16 w-full" />}
        {explanation && !isExplanationLoading && (
          <div className="w-full p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-800">
            <p className="font-bold flex items-center mb-2 text-primary">
              <Sparkles className="h-4 w-4 mr-2" /> Explanation
            </p>
            <Separator className="mb-2" />
            <p className="whitespace-pre-wrap">{explanation}</p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
