'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navigation from './Navigation';
import LanguageSwitcher from '../LanguageSwitcher';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-emerald-100 bg-white shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href={`/`} className="flex items-center space-x-2 group">
          <div className="flex items-center transition-transform group-hover:scale-105">
            <span className="text-2xl md:text-3xl font-extrabold bg-linear-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              GOY
            </span>
            <span className="text-2xl md:text-3xl font-extrabold text-slate-800 ml-1">
              eSIM
            </span>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <LanguageSwitcher />
          <Navigation onLinkClick={() => {}} isMobile={false} />
        </div>

        {/* Mobile: Language + Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <LanguageSwitcher />
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-emerald-50 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-slate-700"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-emerald-100 bg-white shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <Navigation onLinkClick={() => setIsMobileMenuOpen(false)} isMobile={true} />
          </div>
        </div>
      )}
    </header>
  );
}
