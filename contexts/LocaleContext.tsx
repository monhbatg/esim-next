'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import en from '@/locales/en';
import mn from '@/locales/mn';
import zh from '@/locales/zh';

type LocaleCode = 'en' | 'mn' | 'zh';
type Messages = Record<string, string>;

const ALL_MESSAGES: Record<LocaleCode, Messages> = { en, mn, zh } as const;
const SUPPORTED_LOCALES: LocaleCode[] = ['mn', 'en', 'zh'];
const STORAGE_KEY = 'locale';

type LocaleContextValue = {
  locale: LocaleCode;
  setLocale: (locale: LocaleCode) => void;
  messages: Messages;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function getInitialLocale(): LocaleCode {
  if (typeof window === 'undefined') return 'mn';
  const stored = window.localStorage.getItem(STORAGE_KEY) as LocaleCode | null;
  if (stored && SUPPORTED_LOCALES.includes(stored)) return stored;
  return 'mn';
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(getInitialLocale);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {}
  }, [locale]);

  const value = useMemo<LocaleContextValue>(() => ({
    locale,
    setLocale: (next) => {
      if (SUPPORTED_LOCALES.includes(next)) {
        setLocaleState(next);
      }
    },
    messages: ALL_MESSAGES[locale],
  }), [locale]);

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx.locale;
}

export function useSetLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useSetLocale must be used within LocaleProvider');
  return ctx.setLocale;
}

export function useTranslations() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useTranslations must be used within LocaleProvider');
  const { messages } = ctx;
  return (key: string) => messages[key] ?? key;
}


