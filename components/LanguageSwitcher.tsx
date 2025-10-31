'use client';

import { useLocale, useSetLocale } from '@/contexts/LocaleContext';
import { useState } from 'react';

const languages = [
  { code: 'mn', name: 'Монгол', flag: '🇲🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const setLocale = useSetLocale();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  const handleLanguageChange = (newLocale: string) => {
    setLocale(newLocale as any);  
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all shadow-sm hover:shadow-md active:scale-95"
        aria-label="Change language"
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="hidden sm:inline text-sm font-bold text-slate-700">{currentLanguage.code.toUpperCase()}</span>
        <svg
          className={`w-4 h-4 text-slate-700 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border-2 border-slate-200 py-2 z-20">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors ${
                  locale === lang.code ? 'bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white' : 'text-slate-700'
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span className="font-bold">{lang.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

