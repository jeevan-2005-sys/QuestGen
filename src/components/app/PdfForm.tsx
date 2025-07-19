'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send, Upload, FileText, Loader2 } from 'lucide-react';
import * as pdfjs from 'pdfjs-dist';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;


const FormSchema = z.object({
  content: z
    .string()
    .min(50, { message: 'Extracted text must be at least 50 characters.' })
    .max(15000, {
      message: 'Extracted content is too long. Please use a smaller PDF.',
    }),
});

type PdfFormProps = {
  onSubmit: (data: z.infer<typeof FormSchema>) => void;
  isLoading: boolean;
};

export default function PdfForm({ onSubmit, isLoading }: PdfFormProps) {
  const { toast } = useToast();
  const [isExtracting, setIsExtracting] = useState(false);
  const [fileName, setFileName] = useState('');

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      content: '',
    },
  });

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a PDF file.',
        variant: 'destructive',
      });
      return;
    }

    setIsExtracting(true);
    setFileName(file.name);
    form.reset();

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument(arrayBuffer).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => ('str' in item ? item.str : '')).join(' ');
        fullText += pageText + '\n\n';
      }
      form.setValue('content', fullText.trim());
      toast({
        title: 'Extraction Successful',
        description: `Extracted ${pdf.numPages} pages from ${file.name}.`,
      });
    } catch (error) {
      console.error('Failed to extract text from PDF:', error);
      toast({
        title: 'Extraction Failed',
        description:
          'Could not extract text from the PDF. The file might be corrupted or image-based.',
        variant: 'destructive',
      });
      setFileName('');
    } finally {
      setIsExtracting(false);
      // Reset the file input so the same file can be re-uploaded
      event.target.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Generate from PDF</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormItem>
              <FormLabel>Upload PDF</FormLabel>
              <FormControl>
                <div className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      document.getElementById('pdf-upload')?.click()
                    }
                    disabled={isExtracting}
                  >
                    {isExtracting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    {isExtracting
                      ? 'Extracting...'
                      : fileName || 'Select a PDF file'}
                  </Button>
                  <input
                    id="pdf-upload"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="sr-only"
                    disabled={isExtracting}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Upload a PDF document. The text will be extracted automatically.
              </FormDescription>
              <FormMessage />
            </FormItem>

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Extracted Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="PDF content will appear here after extraction."
                      className="resize-y min-h-[200px] bg-muted/50"
                      readOnly
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Review the extracted content before generating questions.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isLoading || isExtracting || !form.getValues('content')}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Generate Paper
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
