'use client';

import { useState, useEffect } from 'react';

export default function Footer() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="text-center py-4 text-sm text-muted-foreground">
      <p>&copy; {year || new Date().getFullYear()} QuestGen+. All rights reserved.</p>
    </footer>
  );
}
