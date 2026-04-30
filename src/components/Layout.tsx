import { type ReactNode } from 'react';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-full max-w-lg mx-auto px-4 pb-safe">
      {children}
    </div>
  );
}
