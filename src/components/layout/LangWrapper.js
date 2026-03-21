'use client';
import { LangProvider } from '@/lib/lang';

export function LangWrapper({ children }) {
  return <LangProvider>{children}</LangProvider>;
}
