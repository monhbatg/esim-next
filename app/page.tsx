"use client";

import Link from "next/link";
import { useTranslations } from "@/contexts/LocaleContext";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function Home() {
  const t = useTranslations();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50 py-24 md:py-32 overflow-hidden">
        {/* Decorative blob */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-br from-emerald-400/30 to-teal-400/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-linear-to-tr from-cyan-400/30 to-blue-400/30 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl md:text-7xl font-black mb-6 bg-linear-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent leading-tight">
              {t("heroTitle")}
            </h1>
            <p className="text-xl md:text-2xl text-slate-700 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t("heroSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/marketplace">
                <Button size="lg">{t("browsePlans")} →</Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg">
                  {t("learnMore")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-4 text-slate-900">
            {t("whyChooseTitle")}
          </h2>
          <p className="text-center text-slate-600 mb-16 text-lg max-w-2xl mx-auto">
            {t("whyChooseSubtitle")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card
              hover
              className="text-center group bg-linear-to-br from-emerald-50 to-teal-50 border-emerald-200"
            >
              <div className="text-6xl mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                🌍
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900">
                {t("globalCoverage")}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {t("globalCoverageDesc")}
              </p>
            </Card>
            <Card
              hover
              className="text-center group bg-linear-to-br from-teal-50 to-cyan-50 border-teal-200"
            >
              <div className="text-6xl mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                ⚡
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900">
                {t("instantActivation")}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {t("instantActivationDesc")}
              </p>
            </Card>
            <Card
              hover
              className="text-center group bg-linear-to-br from-cyan-50 to-blue-50 border-cyan-200"
            >
              <div className="text-6xl mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                💰
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900">
                {t("bestPrices")}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {t("bestPricesDesc")}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-linear-to-b from-slate-50 to-white py-20 md:py-28">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-4 text-slate-900">
            {t("howItWorksTitle")}
          </h2>
          <p className="text-center text-slate-600 mb-16 text-lg">
            {t("howItWorksSubtitle")}
          </p>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-24 h-24 bg-linear-to-br from-emerald-500 to-teal-500 text-white rounded-3xl flex items-center justify-center text-4xl font-black mx-auto mb-6 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                1
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900">
                {t("step1Title")}
              </h3>
              <p className="text-slate-600 leading-relaxed">{t("step1Desc")}</p>
            </div>
            <div className="text-center group">
              <div className="w-24 h-24 bg-linear-to-br from-teal-500 to-cyan-500 text-white rounded-3xl flex items-center justify-center text-4xl font-black mx-auto mb-6 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                2
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900">
                {t("step2Title")}
              </h3>
              <p className="text-slate-600 leading-relaxed">{t("step2Desc")}</p>
            </div>
            <div className="text-center group">
              <div className="w-24 h-24 bg-linear-to-br from-cyan-500 to-blue-500 text-white rounded-3xl flex items-center justify-center text-4xl font-black mx-auto mb-6 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                3
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900">
                {t("step3Title")}
              </h3>
              <p className="text-slate-600 leading-relaxed">{t("step3Desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-linear-to-br from-emerald-600 via-teal-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl font-black mb-6 text-white">
              {t("ctaTitle")}
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-10 leading-relaxed">
              {t("ctaSubtitle")}
            </p>
            <Link href="/marketplace">
              <Button
                size="lg"
                className="bg-white text-emerald-600 hover:bg-slate-50 shadow-2xl text-lg px-8 py-4"
              >
                {t("getStartedNow")} →
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
