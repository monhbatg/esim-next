'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from '@/contexts/LocaleContext';

export default function Footer() {
  const t = useTranslations();
  return (
    <footer className="w-full border-t border-emerald-100 bg-linear-to-b from-white to-slate-100">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center">
              <Image
                src="/goysim_logo.jpg"
                alt="GOY eSIM"
                width={100}
                height={100}
                className="h-8 w-8 object-contain"
              />
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t("footerGoal")}
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-slate-900">
              {t("footerProduct")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/marketplace" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  {t("footerMarketPlace")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  {t("footerAbout")}
                </Link>
              </li>
              <li>
                <a href="#" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  {t("footerPricing")}
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-slate-900">
              {t("footerSupport")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/guide" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  {t("footerHelp")}
                </a>
              </li>
              <li>
                <a href="/guide/#common-questions" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  {t("footerFAQ")}
                </a>
              </li>
            </ul>
          </div>  

          {/* Legal */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-slate-900">
              {t("footerContactUs")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="+ 976-6001-6363" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  + 976 6001-6363
                </a>
              </li>
              <li>
                <a href="mailto:esimgoy@gmail.com" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  esimgoy@gmail.com
                </a>
              </li>
              <li>
                <a href="https://www.facebook.com/goyesim" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  facebook.com/goyesim
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-8 text-center text-sm text-slate-600">
          <p>&copy; {new Date().getFullYear()} GOY eSIM. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}