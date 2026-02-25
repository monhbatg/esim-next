'use client';

import Card from '@/components/ui/Card';
import { useTranslations } from '@/contexts/LocaleContext';

export default function About() {
  const t = useTranslations();
  return (
    <div className="py-20 md:py-28 bg-linear-to-b from-white via-slate-50 to-white">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-linear-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent leading-tight">
            {t("aboutTitle")}
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 font-medium leading-relaxed">
            {t("aboutDescription")}
          </p>
        </div>

        {/* Mission Section */}
        <div className="max-w-5xl mx-auto mb-20">
          <Card className="bg-linear-to-br from-green-50 to-emerald-50">
            <h2 className="text-4xl font-extrabold mb-6 text-slate-900">{t("ourMissionTitle")}</h2>
            <p className="text-lg text-slate-600 mb-5 leading-relaxed">
              {t("ourMissionOne")}
            </p>
            <p className="text-lg text-slate-600 leading-relaxed">
              {t("ourMissionTwo")}
            </p>
          </Card>
        </div>

        {/* Values Section */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-4 text-slate-900">{t("ourValuesTitle")}</h2>
          <p className="text-center text-slate-600 mb-12 text-lg">{t("ourValuesMajor")}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card hover className="text-center group">
              <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">🎯</div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900">{t("Simplicity")}</h3>
              <p className="text-slate-600 leading-relaxed">
                {t("SimplicityDescription")}
              </p>
            </Card>
            <Card hover className="text-center group">
              <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">💎</div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900">{t("Transparency")}</h3>
              <p className="text-slate-600 leading-relaxed">
                {t("TransparencyDescription")}
              </p>
            </Card>
            <Card hover className="text-center group">
              <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">🚀</div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900">{t("Innovation")}</h3>
              <p className="text-slate-600 leading-relaxed">
                {t("InnovationDescription")}
              </p>
            </Card>
          </div>
        </div>

        {/* Story Section */}
        <div className="max-w-5xl mx-auto mb-20">
          <Card>
            <h2 className="text-4xl font-extrabold mb-6 text-slate-900">{t("ourStoryTitle")}</h2>
            <p className="text-lg text-slate-600 mb-5 leading-relaxed">
              {t("ourStory")}.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed">
              {t("ourStoryTwo")}
            </p>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <Card hover className="group">
              <div className="text-5xl font-extrabold bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3 transform group-hover:scale-110 transition-transform duration-300">190+</div>
              <p className="text-slate-600 font-semibold">{t("countryCount")}</p>
            </Card>
            <Card hover className="group">
              <div className="text-5xl font-extrabold bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3 transform group-hover:scale-110 transition-transform duration-300">100+</div>
              <p className="text-slate-600 font-semibold">{t("activeUsersCount")}</p>
            </Card>
            <Card hover className="group">
              <div className="text-5xl font-extrabold bg-linear-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-3 transform group-hover:scale-110 transition-transform duration-300">100+</div>
              <p className="text-slate-600 font-semibold">{t("esimActivatedCount")}</p>
            </Card>
            <Card hover className="group">
              <div className="text-5xl font-extrabold bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3 transform group-hover:scale-110 transition-transform duration-300">4.9/5</div>
              <p className="text-slate-600 font-semibold">{t("userRating")}</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}