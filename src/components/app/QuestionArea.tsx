'use client';

import { useMemo, useRef, type Dispatch, type SetStateAction } from 'react';
import { AlertTriangle, Download, RefreshCw } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';

import type { Question, QuestionType } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import QuestionCard from './QuestionCard';
import AnswerSheet from './AnswerSheet';
import { handleRegenerateQuestions } from '@/app/actions';

type QuestionAreaProps = {
  questions: Question[];
  setQuestions: Dispatch<SetStateAction<Question[]>>;
  isLoading: boolean;
  error: string | null;
};

const SectionHeader = ({ title }: { title: string }) => (
  <div className="mt-6 mb-2">
    <h3 className="text-xl font-headline font-semibold text-primary/90">{title}</h3>
    <Separator className="bg-primary/20" />
  </div>
);


export default function QuestionArea({
  questions,
  setQuestions,
  isLoading,
  error,
}: QuestionAreaProps) {
  const exportRef = useRef<HTMLDivElement>(null);
  const answerExportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const groupedQuestions = useMemo(() => {
    return questions.reduce((acc, question) => {
      const type = question.questionType || 'Short Answer';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(question);
      return acc;
    }, {} as Record<QuestionType, Question[]>);
  }, [questions]);

  const handleExport = (
    element: HTMLElement | null,
    filename: string,
    title: string
  ) => {
    if (element) {
      toast({
        title: `Preparing ${title}...`,
        description: 'Your download will start shortly.',
      });
      html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF',
      }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / pdfWidth;
        const imgHeight = canvasHeight / ratio;
        let heightLeft = imgHeight;
        let position = 10; // Add top margin

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
          position = -heightLeft + 10; // Add top margin to subsequent pages
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
          heightLeft -= pdfHeight;
        }

        pdf.save(filename);
        toast({
          title: 'Export Successful',
          description: `Your ${title.toLowerCase()} has been downloaded.`,
        });
      });
    }
  };

  const handleExportPdf = () => {
    handleExport(
      exportRef.current,
      'QuestGenPlus_Paper.pdf',
      'Question Paper'
    );
  };

  const handleExportAnswersPdf = () => {
    handleExport(
      answerExportRef.current,
      'QuestGenPlus_Answers.pdf',
      'Answer Key'
    );
  };

  const onRegenerate = async () => {
    const weakAreas = questions
      .filter((q) => q.feedback === 'Struggled' || q.feedback === 'Wrong')
      .map((q) => q.topic || 'general')
      .filter((value, index, self) => self.indexOf(value) === index);

    if (weakAreas.length === 0) {
      toast({
        title: 'No weak areas identified',
        description:
          'Please provide feedback on questions you struggled with first.',
        variant: 'destructive',
      });
      return;
    }

    toast({ title: 'Regenerating questions for your weak areas...' });

    try {
      const result = await handleRegenerateQuestions({
        topic: weakAreas.join(', '),
        weakAreas: weakAreas.join(', '),
        numMcq: 2,
        numLaq: 1,
      });

      const newQuestions: Question[] = result.questions.map((q, index) => ({
        id: `regen-${index}-${Date.now()}`,
        question: q,
        questionType: 'Multiple-Choice', // Defaulting regenerated for now
        feedback: null,
        topic: weakAreas[0], // Assign topic for future regeneration
      }));
      
      setQuestions((prev) => [...prev, ...newQuestions]);

      toast({
        title: 'Adaptive Questions Generated!',
        description: `We've added ${newQuestions.length} new questions. Also, consider reviewing: ${result.studySuggestions}`,
      });
    } catch (e) {
      toast({
        title: 'Regeneration Failed',
        description: 'Could not generate new questions. Please try again.',
        variant: 'destructive',
      });
      console.error(e);
    }
  };

  if (isLoading) {
    return (
      <div className="mt-8 space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-8">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="mt-8 text-center text-muted-foreground">
        <p>Your generated questions will appear here.</p>
      </div>
    );
  }

  const questionOrder: QuestionType[] = ['Multiple-Choice', 'Short Answer', 'Long Answer'];

  return (
    <div className="mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-3xl font-headline font-bold">Generated Paper</h2>
        <div className="flex flex-wrap gap-2">
           <Button variant="outline" onClick={onRegenerate}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Regenerate
          </Button>
          <Button onClick={handleExportPdf}>
            <Download className="mr-2 h-4 w-4" />
            Export Paper
          </Button>
           <Button onClick={handleExportAnswersPdf}>
            <Download className="mr-2 h-4 w-4" />
            Export Answers
          </Button>
        </div>
      </div>
      <Separator className="my-4" />
      <div ref={exportRef} className="space-y-4 p-4 bg-white rounded-lg">
        {questionOrder.map(section => (
          groupedQuestions[section] && groupedQuestions[section].length > 0 && (
            <div key={section}>
              <SectionHeader title={section.replace('-', ' ')} />
              {groupedQuestions[section].map((q, index) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  questionNumber={index + 1}
                  setQuestions={setQuestions}
                />
              ))}
            </div>
          )
        ))}
      </div>
      {/* Hidden component for answer sheet export */}
      <div className="absolute -z-10 -left-[9999px] top-0 opacity-0">
          <AnswerSheet ref={answerExportRef} questions={questions} />
      </div>
    </div>
  );
}
