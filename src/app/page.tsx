'use client';

import { useState } from 'react';
import { BookText, ImageIcon, FileText } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  handleGenerateQuestions,
  handleGenerateVisualQuestions,
} from '@/app/actions';
import type { Question } from '@/lib/types';
import type { GenerateImageQuestionsInput } from '@/ai/flows/generate-image-questions';
import Header from '@/components/app/Header';
import SyllabusForm from '@/components/app/SyllabusForm';
import PdfForm from '@/components/app/PdfForm';
import VisualQuestionForm from '@/components/app/VisualQuestionForm';
import QuestionArea from '@/components/app/QuestionArea';

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onGenerateFromText = async (text: string, source: 'syllabus' | 'pdf') => {
    setIsLoading(true);
    setError(null);
    setQuestions([]);
    try {
      const result = await handleGenerateQuestions(text);
      const parsedQuestions: Question[] = result.questions
        .split(/\n\s*\n/)
        .filter((q) => q.trim().length > 0)
        .map((q, index) => ({
          id: `${source}-${index}-${Date.now()}`,
          question: q.trim(),
          feedback: null,
          topic: `${source === 'pdf' ? 'PDF' : 'Syllabus'}-based`,
        }));
      setQuestions(parsedQuestions);
    } catch (e) {
      setError('Failed to generate questions. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const onGenerateSyllabus = async (data: { syllabus: string }) => {
    await onGenerateFromText(data.syllabus, 'syllabus');
  };

  const onGeneratePdf = async (data: { content: string }) => {
    await onGenerateFromText(data.content, 'pdf');
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="syllabus">
                <BookText className="mr-2 h-4 w-4" />
                From Syllabus
              </TabsTrigger>
              <TabsTrigger value="pdf">
                <FileText className="mr-2 h-4 w-4" />
                From PDF
              </TabsTrigger>
              <TabsTrigger value="visual">
                <ImageIcon className="mr-2 h-4 w-4" />
                Visual Questions
              </TabsTrigger>
            </TabsList>
            <TabsContent value="syllabus">
              <SyllabusForm onSubmit={onGenerateSyllabus} isLoading={isLoading} />
            </TabsContent>
            <TabsContent value="pdf">
              <PdfForm onSubmit={onGeneratePdf} isLoading={isLoading} />
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
