'use client';
import { forwardRef } from 'react';
import type { Question, QuestionType } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

type AnswerSheetProps = {
  questions: Question[];
};

const AnswerSheet = forwardRef<HTMLDivElement, AnswerSheetProps>(
  ({ questions }, ref) => {
    const questionOrder: QuestionType[] = [
      'Multiple-Choice',
      'Short Answer',
      'Long Answer',
    ];

    const groupedQuestions = questions.reduce((acc, question) => {
      const type = question.questionType || 'Short Answer';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(question);
      return acc;
    }, {} as Record<QuestionType, Question[]>);

    return (
      <div ref={ref} className="p-8 bg-white text-black w-[210mm]">
        <h1 className="text-3xl font-bold text-center mb-2">
          QuestGen+ Answer Key
        </h1>
        <p className="text-center text-gray-600 mb-8">
          A complete guide to the generated questions.
        </p>
        {questionOrder.map((section) => {
          const sectionQuestions = groupedQuestions[section];
          if (!sectionQuestions || sectionQuestions.length === 0) {
            return null;
          }
          return (
            <div key={section} className="mb-8">
              <h2 className="text-2xl font-semibold border-b-2 border-gray-300 pb-2 mb-4">
                {section.replace('-', ' ')}
              </h2>
              {sectionQuestions.map((q, index) => (
                <div key={q.id} className="mb-6 break-after-page">
                  <p className="font-semibold text-lg mb-2">
                    {index + 1}. {q.question}
                  </p>
                  {q.questionType === 'Multiple-Choice' && q.options && (
                    <ul className="list-disc list-inside mb-2 pl-4">
                      {q.options.map((opt, i) => (
                        <li key={i} className={opt === q.answer ? 'font-bold' : ''}>
                          {opt}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-md">
                    <p className="font-bold text-blue-800">Answer:</p>
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {q.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  }
);

AnswerSheet.displayName = 'AnswerSheet';
export default AnswerSheet;
