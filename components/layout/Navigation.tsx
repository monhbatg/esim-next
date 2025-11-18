'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from '@/contexts/LocaleContext';
import { useAuth } from '@/contexts/AuthContext';

const getNavigationItems = () => [
  { name: 'home', href: `/`, protected: false },
  { name: 'marketplace', href: `/marketplace`, protected: false },
  { name: 'topUp', href: `/guest/topup`, protected: false },
  { name: 'about', href: `/about`, protected: false },
  { name: 'profile', href: `/profile`, protected: true },
];

interface NavigationProps {
  onLinkClick: () => void;
  isMobile: boolean;
}

export default function Navigation({ onLinkClick, isMobile }: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const { isAuthenticated, logout, user } = useAuth();
  
  // Filter navigation items: show profile only when authenticated
  const navigationItems = getNavigationItems().filter(item => 
    item.name === 'profile' ? isAuthenticated : true
  );

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, item: typeof navigationItems[0]) => {
    if (item.protected && !isAuthenticated) {
      e.preventDefault();
      sessionStorage.setItem('redirectAfterLogin', item.href);
      router.push('/login');
    }
    onLinkClick();
  };

  const handleAuthAction = () => {
    if (isAuthenticated) {
      logout();
      router.push(`/`);
    } else {
      router.push(`/login`);
    }
    onLinkClick();
  };

  if (isMobile) {
    return (
      <nav className="flex flex-col space-y-3">
        {/* User Info (Mobile) - Show as clickable profile link when authenticated */}
        {isAuthenticated && user && (
          <Link
            href="/profile"
            onClick={onLinkClick}
            className={`mb-2 pb-3 border-b border-emerald-100 block ${
              pathname === '/profile'
                ? 'text-emerald-600'
                : 'text-slate-900'
            }`}
          >
            <p className="text-xs text-slate-500 font-semibold">{t('welcomeBack')}</p>
            <p className="text-lg font-bold">{(user.name || user.firstName || 'Profile').toUpperCase()}</p>
          </Link>
        )}

        {/* Navigation Links (Mobile) */}
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => handleNavClick(e, item)}
              className={`block px-4 py-3 rounded-xl font-bold text-base transition-all ${
                isActive
                  ? 'bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white'
                  : 'bg-slate-50 text-slate-700 hover:bg-emerald-50'
              }`}
            >
              {t(item.name)}
            </Link>
          );
        })}

        {/* Auth Button (Mobile) */}
        <button
          onClick={handleAuthAction}
          className={`mt-2 w-full px-4 py-3 rounded-xl font-bold text-base transition-all ${
            isAuthenticated
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              : 'bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600'
          }`}
        >
          {isAuthenticated ? t('signOut') : t('signIn')}
        </button>
      </nav>
    );
  }

  // Desktop Navigation
  return (
    <nav className="flex items-center gap-6">
      <div className="flex items-center gap-6">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => handleNavClick(e, item)}
              className={`text-sm font-bold transition-colors hover:text-emerald-600 ${
                isActive
                  ? 'text-emerald-600'
                  : 'text-slate-700'
              }`}
            >
              {t(item.name)}
            </Link>
          );
        })}
      </div>
      
      {isAuthenticated ? (
        <div className="flex items-center gap-4">
          {/* User Name as Profile Link */}
          <Link
            href="/profile"
            onClick={onLinkClick}
            className={`text-sm font-bold transition-colors hover:text-emerald-600 ${
              pathname === '/profile'
                ? 'text-emerald-600'
                : 'text-slate-700'
            }`}
          >
            {(user?.name || user?.firstName || 'Profile').toUpperCase()}
          </Link>
          <button
            onClick={handleAuthAction}
            className="inline-flex items-center justify-center rounded-xl border-2 border-emerald-500 px-4 py-2 text-sm font-bold text-emerald-700 transition-all hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shadow-sm hover:shadow-md active:scale-95"
          >
            {t('signOut')}
          </button>
        </div>
      ) : (
        <button
          onClick={handleAuthAction}
          className="inline-flex items-center justify-center rounded-xl bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 px-4 py-2 text-sm font-bold text-white transition-all hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shadow-md hover:shadow-lg active:scale-95"
        >
          {t('signIn')}
        </button>
      )}
    </nav>
  );
}
