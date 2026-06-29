'use client';

import { useEffect, useState } from 'react';
import { seedLocalIfEmpty } from '@/lib/seed';

export function SeedInitializer() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void seedLocalIfEmpty().finally(() => setReady(true));
  }, []);

  if (!ready) {
    return null;
  }

  return null;
}
