'use client';

import { useState } from 'react';
import { BookText, FileText } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  handleGenerateQuestions,
} from '@/app/actions';
import type { Question } from '@/lib/types';
import Header from '@/components/app/Header';
import SyllabusForm from '@/components/app/SyllabusForm';
import PdfForm from '@/components/app/PdfForm';
import QuestionArea from '@/components/app/QuestionArea';
import Footer from '@/components/app/Footer';

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
      const parsedQuestions: Question[] = result.questions.map((q, index) => ({
        id: `${source}-${index}-${Date.now()}`,
        question: q.questionText,
        questionType: q.questionType,
        options: q.options,
        answer: q.answer,
        marks: q.marks,
        feedback: null,
        topic: `${source === 'pdf' ? 'PDF' : 'Syllabus'}-based`,
        bloomsLevel: q.bloomsLevel,
        learningOutcome: q.learningOutcome,
        skill: q.skill,
        requiresVisual: q.requiresVisual,
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
              <TabsTrigger value="pdf">
                <FileText className="mr-2 h-4 w-4" />
                From PDF
              </TabsTrigger>
            </TabsList>
            <TabsContent value="syllabus">
              <SyllabusForm onSubmit={onGenerateSyllabus} isLoading={isLoading} />
            </TabsContent>
            <TabsContent value="pdf">
              <PdfForm onSubmit={onGeneratePdf} isLoading={isLoading} />
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
      <Footer />
    </div>
  );
}
