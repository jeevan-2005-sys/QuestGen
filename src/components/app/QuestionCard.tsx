
'use client';

import { useState, type Dispatch, type SetStateAction } from 'react';
import Image from 'next/image';
import { Lightbulb, Sparkles, Target, Send, Loader2, BookCopy } from 'lucide-react';

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
import { handleExplainAnswer, handleGetAnswerFeedback } from '@/app/actions';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

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
  const [userAnswer, setUserAnswer] = useState(question.userAnswer || '');
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  
  const setQuestionProperty = (key: keyof Question, value: any) => {
    setQuestions((prev) => 
      prev.map((q) => (q.id === question.id ? { ...q, [key]: value } : q))
    );
  };

  const setFeedback = (feedback: QuestionFeedback) => {
    setQuestionProperty('feedback', feedback);
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
        answer: question.answer || 'The provided answer',
      });
      setExplanation(result.explanation);
    } catch (error)
      {
      console.error('Failed to get explanation:', error);
      setExplanation('Sorry, could not fetch an explanation at this time.');
    } finally {
      setIsExplanationLoading(false);
    }
  };

  const onGetFeedback = async () => {
    if (!userAnswer || !question.answer) return;
    setIsFeedbackLoading(true);
    try {
      const result = await handleGetAnswerFeedback({
        question: question.question,
        correctAnswer: question.answer,
        userAnswer: userAnswer,
        marks: question.marks || 0,
      });
      setQuestions(prev => prev.map(q => q.id === question.id ? {
        ...q,
        answerFeedback: result.feedback,
        suggestedAnswer: result.suggestedAnswer,
      } : q));
    } catch (error) {
      console.error('Failed to get feedback:', error);
      setQuestionProperty('answerFeedback', 'Sorry, could not get feedback at this time.');
    } finally {
      setIsFeedbackLoading(false);
    }
  }

  const feedbackOptions: QuestionFeedback[] = ['Got it', 'Struggled', 'Wrong'];
  const showAnswerInput = ['Short Answer', 'Long Answer'].includes(question.questionType);

  return (
    <Card className="shadow-md transition-shadow hover:shadow-lg mb-4">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
            <div className="flex gap-2 flex-wrap">
                 {question.questionType && (
                    <Badge variant="outline" className="border-primary text-primary">{question.questionType}</Badge>
                )}
                 {question.skill && (
                    <Badge variant="secondary">{question.skill}</Badge>
                )}
                 {question.bloomsLevel && (
                    <Badge variant="outline">{question.bloomsLevel}</Badge>
                )}
                 {question.marks && (
                    <Badge variant="secondary">{question.marks} Mark{question.marks > 1 ? 's' : ''}</Badge>
                )}
            </div>
        </div>
        <CardTitle className="text-lg font-body flex items-start justify-between">
            <div className='flex items-start'>
                <span className="text-primary font-bold mr-3">{questionNumber}.</span>
                <p className="flex-1 whitespace-pre-wrap">{question.question}</p>
            </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {question.imageDataUri && (
          <div className="relative w-full h-64 border rounded-md overflow-hidden mb-4">
            <Image
              src={question.imageDataUri}
              alt={`Visual for question ${questionNumber}`}
              layout="fill"
              objectFit="contain"
              data-ai-hint="diagram chart"
            />
          </div>
        )}
        {question.questionType === 'Multiple-Choice' && question.options && (
            <RadioGroup className="space-y-2 ml-8">
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${question.id}-option-${index}`} />
                  <Label htmlFor={`${question.id}-option-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
        )}
        {showAnswerInput && (
          <div className="ml-8 mt-4 space-y-4">
            <div>
              <Label htmlFor={`${question.id}-user-answer`}>Your Answer</Label>
              <Textarea
                id={`${question.id}-user-answer`}
                value={userAnswer}
                onChange={(e) => {
                  setUserAnswer(e.target.value)
                  setQuestionProperty('userAnswer', e.target.value)
                }}
                placeholder="Type your answer here..."
                className="resize-y mt-2"
              />
            </div>
             <Button onClick={onGetFeedback} disabled={isFeedbackLoading || !userAnswer}>
              {isFeedbackLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Get Feedback
                </>
              )}
            </Button>
            {isFeedbackLoading && <Skeleton className="h-24 w-full" />}
            {question.answerFeedback && !isFeedbackLoading && (
              <div className="w-full mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-gray-800 space-y-4">
                <div>
                  <p className="font-bold flex items-center mb-2 text-green-700">
                    <Sparkles className="h-4 w-4 mr-2" /> Tutor Feedback
                  </p>
                  <Separator className="mb-2 bg-green-200" />
                  <p className="whitespace-pre-wrap">{question.answerFeedback}</p>
                </div>
                {question.suggestedAnswer && (
                  <div>
                    <p className="font-bold flex items-center mb-2 text-green-700">
                      <BookCopy className="h-4 w-4 mr-2" /> Tutor's Suggested Answer
                    </p>
                    <Separator className="mb-2 bg-green-200" />
                    <p className="whitespace-pre-wrap">{question.suggestedAnswer}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
         {question.learningOutcome && (
            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 flex items-start gap-3">
                 <Target className="h-5 w-5 mt-0.5 text-primary/80 flex-shrink-0" />
                 <div>
                    <p className="font-semibold text-primary/90">Learning Outcome</p>
                    <p className="whitespace-pre-wrap">{question.learningOutcome}</p>
                 </div>
            </div>
        )}
      </CardContent>

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
            {explanation ? 'Hide Correct Answer' : 'Show Correct Answer'}
          </Button>
        </div>
        {isExplanationLoading && <Skeleton className="h-16 w-full" />}
        {explanation && !isExplanationLoading && (
          <div className="w-full p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-800">
            <p className="font-bold flex items-center mb-2 text-primary">
              <Sparkles className="h-4 w-4 mr-2" /> Correct Answer
            </p>
            <Separator className="mb-2" />
            <p className="whitespace-pre-wrap">{explanation}</p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
