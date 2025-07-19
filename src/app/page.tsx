'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { BookText, ImageIcon } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  handleGenerateQuestions,
  handleGenerateVisualQuestions,
} from '@/app/actions';
import type { Question } from '@/lib/types';
import type { GenerateImageQuestionsInput } from '@/ai/flows/generate-image-questions';
import Header from '@/components/app/Header';
import SyllabusForm from '@/components/app/SyllabusForm';
import VisualQuestionForm from '@/components/app/VisualQuestionForm';
import QuestionArea from '@/components/app/QuestionArea';

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onGenerateSyllabus = async (data: { syllabus: string }) => {
    setIsLoading(true);
    setError(null);
    setQuestions([]);
    try {
      const result = await handleGenerateQuestions(data.syllabus);
      // The AI returns a single block of text. We split it into questions.
      // A more robust solution would be for the AI to return structured JSON.
      const parsedQuestions: Question[] = result.questions
        .split(/\n\s*\n/)
        .filter((q) => q.trim().length > 0)
        .map((q, index) => ({
          id: `syllabus-${index}-${Date.now()}`,
          question: q.trim(),
          feedback: null,
          topic: 'Syllabus-based',
        }));
      setQuestions(parsedQuestions);
    } catch (e) {
      setError('Failed to generate questions. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const onGenerateVisual = async (data: GenerateImageQuestionsInput) => {
    setIsLoading(true);
    setError(null);
    setQuestions([]);
    try {
      const result = await handleGenerateVisualQuestions(data);
      const parsedQuestions: Question[] = result.questions.map((q, index) => ({
        id: `visual-${index}-${Date.now()}`,
        question: q.question,
        imageDataUri: q.imageDataUri,
        explanation: q.explanation,
        feedback: null,
        topic: data.topic,
      }));
      setQuestions(parsedQuestions);
    } catch (e) {
      setError('Failed to generate visual questions. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="syllabus" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="syllabus">
                <BookText className="mr-2 h-4 w-4" />
                From Syllabus
              </TabsTrigger>
              <TabsTrigger value="visual">
                <ImageIcon className="mr-2 h-4 w-4" />
                Visual Questions
              </TabsTrigger>
            </TabsList>
            <TabsContent value="syllabus">
              <SyllabusForm onSubmit={onGenerateSyllabus} isLoading={isLoading} />
            </TabsContent>
            <TabsContent value="visual">
              <VisualQuestionForm
                onSubmit={onGenerateVisual}
                isLoading={isLoading}
              />
            </TabsContent>
          </Tabs>

          <QuestionArea
            questions={questions}
            setQuestions={setQuestions}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </main>
      <footer className="text-center py-4 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} QuestGen+. All rights reserved.</p>
      </footer>
    </div>
  );
}
