import { BrainCircuit } from 'lucide-react';

export default function Header() {
  return (
    <header className="py-6 border-b">
      <div className="container mx-auto px-4 flex items-center justify-center text-center">
        <BrainCircuit className="h-10 w-10 mr-4 text-primary" />
        <div>
          <h1 className="text-4xl font-headline font-bold text-primary">
            QuestGen+
          </h1>
          <p className="text-muted-foreground font-body">
            From Syllabus to Smarter Success — AI-Powered Adaptive Practice
            Engine
          </p>
        </div>
      </div>
    </header>
  );
}
