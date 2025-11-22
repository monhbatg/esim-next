'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useTranslations } from '@/contexts/LocaleContext';

type DeviceTab = 'ios' | 'android' | 'manual';

export default function Guide() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<DeviceTab>('ios');

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white py-20 md:py-28">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent leading-tight">
            {t('installationGuide')}
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 font-medium leading-relaxed">
            {t('installationGuideSubtitle')}
          </p>
        </div>

        {/* Before You Begin */}
        <div className="max-w-5xl mx-auto mb-16">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50">
            <div className="flex items-start gap-4">
              <div className="text-4xl">ℹ️</div>
              <div>
                <h2 className="text-2xl font-bold mb-3 text-slate-900">{t('beforeYouBegin')}</h2>
                <p className="text-lg text-slate-700 leading-relaxed">
                  {t('beforeYouBeginDesc')}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Device Compatibility */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-4xl font-extrabold text-center mb-4 text-slate-900">
            {t('compatibility')}
          </h2>
          <p className="text-center text-slate-600 mb-10 text-lg">
            {t('compatibilityDesc')}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card hover className="group">
              <div className="text-5xl mb-4 text-center transform group-hover:scale-110 transition-transform duration-300">
                📱
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900 text-center">
                {t('ios')}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t('iosCompatibility')}
              </p>
            </Card>

            <Card hover className="group">
              <div className="text-5xl mb-4 text-center transform group-hover:scale-110 transition-transform duration-300">
                🤖
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900 text-center">
                {t('android')}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t('androidCompatibility')}
              </p>
            </Card>

            <Card hover className="group">
              <div className="text-5xl mb-4 text-center transform group-hover:scale-110 transition-transform duration-300">
                ⌚
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900 text-center">
                {t('other')}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t('otherCompatibility')}
              </p>
            </Card>
          </div>

          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50">
            <h3 className="text-xl font-bold mb-3 text-slate-900">
              {t('checkCompatibility')}
            </h3>
            <div className="space-y-2 text-slate-700">
              <p><strong>{t('ios')}:</strong> {t('checkCompatibilityIos')}</p>
              <p><strong>{t('android')}:</strong> {t('checkCompatibilityAndroid')}</p>
            </div>
          </Card>
        </div>

        {/* Installation Instructions */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-4xl font-extrabold text-center mb-4 text-slate-900">
            {t('installationInstructions')}
          </h2>
          <p className="text-center text-slate-600 mb-10 text-lg">
            {t('selectYourDevice')}
          </p>

          {/* Tab Navigation */}
          <div className="flex justify-center gap-4 mb-8 flex-wrap">
            <Button
              onClick={() => setActiveTab('ios')}
              className={`px-8 py-3 text-lg ${
                activeTab === 'ios'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                  : 'bg-white text-slate-700 border-2 border-slate-300 hover:border-emerald-500'
              }`}
            >
              📱 {t('ios')}
            </Button>
            <Button
              onClick={() => setActiveTab('android')}
              className={`px-8 py-3 text-lg ${
                activeTab === 'android'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                  : 'bg-white text-slate-700 border-2 border-slate-300 hover:border-emerald-500'
              }`}
            >
              🤖 {t('android')}
            </Button>
            <Button
              onClick={() => setActiveTab('manual')}
              className={`px-8 py-3 text-lg ${
                activeTab === 'manual'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                  : 'bg-white text-slate-700 border-2 border-slate-300 hover:border-emerald-500'
              }`}
            >
              ⌨️ {t('manualInstallation')}
            </Button>
          </div>

          {/* iOS Instructions */}
          {activeTab === 'ios' && (
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
              <h3 className="text-3xl font-bold mb-6 text-slate-900">{t('iosInstallation')}</h3>
              <div className="space-y-4">
                {[
                  t('iosStep1'),
                  t('iosStep2'),
                  t('iosStep3'),
                  t('iosStep4'),
                  t('iosStep5'),
                  t('iosStep6'),
                  t('iosStep7'),
                  t('iosStep8'),
                  t('iosStep9'),
                  t('iosStep10'),
                ].map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                      {index + 1}
                    </div>
                    <p className="text-slate-700 leading-relaxed pt-1.5">{step}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Android Instructions */}
          {activeTab === 'android' && (
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
              <h3 className="text-3xl font-bold mb-6 text-slate-900">{t('androidInstallation')}</h3>
              <div className="space-y-4">
                {[
                  t('androidStep1'),
                  t('androidStep2'),
                  t('androidStep3'),
                  t('androidStep4'),
                  t('androidStep5'),
                  t('androidStep6'),
                  t('androidStep7'),
                  t('androidStep8'),
                  t('androidStep9'),
                  t('androidStep10'),
                ].map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                      {index + 1}
                    </div>
                    <p className="text-slate-700 leading-relaxed pt-1.5">{step}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Manual Installation */}
          {activeTab === 'manual' && (
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
              <h3 className="text-3xl font-bold mb-6 text-slate-900">{t('manualInstallation')}</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                  <p className="text-slate-700 leading-relaxed pt-1.5">{t('manualStep1')}</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                  <p className="text-slate-700 leading-relaxed pt-1.5">{t('manualStep2')}</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                  <div className="flex-1 pt-1.5">
                    <p className="text-slate-700 leading-relaxed mb-2">{t('manualStep3')}</p>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 ml-4">
                      <li>{t('manualStep3Detail1')}</li>
                      <li>{t('manualStep3Detail2')}</li>
                    </ul>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center font-bold text-lg">
                    4
                  </div>
                  <p className="text-slate-700 leading-relaxed pt-1.5">{t('manualStep4')}</p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Activation Tips */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-4xl font-extrabold text-center mb-10 text-slate-900">
            {t('activationTips')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card hover className="group">
              <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                📡
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">{t('tip1Title')}</h3>
              <p className="text-slate-600 leading-relaxed">{t('tip1Desc')}</p>
            </Card>

            <Card hover className="group">
              <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                🏷️
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">{t('tip2Title')}</h3>
              <p className="text-slate-600 leading-relaxed">{t('tip2Desc')}</p>
            </Card>

            <Card hover className="group">
              <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                ⚙️
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">{t('tip3Title')}</h3>
              <p className="text-slate-600 leading-relaxed">{t('tip3Desc')}</p>
            </Card>

            <Card hover className="group">
              <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                💾
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">{t('tip4Title')}</h3>
              <p className="text-slate-600 leading-relaxed">{t('tip4Desc')}</p>
            </Card>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-4xl font-extrabold text-center mb-10 text-slate-900">
            {t('troubleshooting')}
          </h2>
          
          <div className="space-y-4">
            <Card className="bg-gradient-to-r from-red-50 to-orange-50">
              <h3 className="text-xl font-bold mb-2 text-slate-900">❌ {t('cantScanQR')}</h3>
              <p className="text-slate-700 leading-relaxed">{t('cantScanQRSolution')}</p>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-50 to-amber-50">
              <h3 className="text-xl font-bold mb-2 text-slate-900">⚠️ {t('noAddPlanOption')}</h3>
              <p className="text-slate-700 leading-relaxed">{t('noAddPlanOptionSolution')}</p>
            </Card>

            <Card className="bg-gradient-to-r from-orange-50 to-red-50">
              <h3 className="text-xl font-bold mb-2 text-slate-900">🚫 {t('activationFailed')}</h3>
              <p className="text-slate-700 leading-relaxed">{t('activationFailedSolution')}</p>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
              <h3 className="text-xl font-bold mb-2 text-slate-900">📵 {t('esimNotWorking')}</h3>
              <p className="text-slate-700 leading-relaxed">{t('esimNotWorkingSolution')}</p>
            </Card>
          </div>
        </div>

        {/* Common Questions */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-4xl font-extrabold text-center mb-10 text-slate-900">
            {t('commonQuestions')}
          </h2>
          
          <div className="space-y-4">
            <Card>
              <h3 className="text-lg font-bold mb-2 text-slate-900">❓ {t('q1')}</h3>
              <p className="text-slate-700 leading-relaxed">{t('a1')}</p>
            </Card>

            <Card>
              <h3 className="text-lg font-bold mb-2 text-slate-900">❓ {t('q2')}</h3>
              <p className="text-slate-700 leading-relaxed">{t('a2')}</p>
            </Card>

            <Card>
              <h3 className="text-lg font-bold mb-2 text-slate-900">❓ {t('q3')}</h3>
              <p className="text-slate-700 leading-relaxed">{t('a3')}</p>
            </Card>

            <Card>
              <h3 className="text-lg font-bold mb-2 text-slate-900">❓ {t('q4')}</h3>
              <p className="text-slate-700 leading-relaxed">{t('a4')}</p>
            </Card>

            <Card>
              <h3 className="text-lg font-bold mb-2 text-slate-900">❓ {t('q5')}</h3>
              <p className="text-slate-700 leading-relaxed">{t('a5')}</p>
            </Card>
          </div>
        </div>

        {/* Need Help Section */}
        <div className="max-w-3xl mx-auto text-center">
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50">
            <div className="text-5xl mb-4">💬</div>
            <h2 className="text-3xl font-extrabold mb-4 text-slate-900">
              {t('needMoreHelp')}
            </h2>
            <p className="text-lg text-slate-700 mb-6 leading-relaxed">
              {t('needMoreHelpDesc')}
            </p>
            <Button className="px-8 py-3 text-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700">
              {t('contactSupport')}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

