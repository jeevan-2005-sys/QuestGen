'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FormSchema = z.object({
  syllabus: z
    .string()
    .min(50, { message: 'Syllabus must be at least 50 characters.' })
    .max(5000, { message: 'Syllabus must not be longer than 5000 characters.' }),
});

type SyllabusFormProps = {
  onSubmit: (data: z.infer<typeof FormSchema>) => void;
  isLoading: boolean;
};

export default function SyllabusForm({
  onSubmit,
  isLoading,
}: SyllabusFormProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      syllabus: '',
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Generate from Syllabus</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="syllabus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Syllabus Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste your syllabus content here..."
                      className="resize-y min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Paste the raw text from your syllabus. The AI will generate
                    questions based on the provided topics.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Generating...' : 'Generate Paper'}
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
