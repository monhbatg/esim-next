'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function CheckoutSuccess() {
  const router = useRouter();
  const [orderNumber] = useState(() => 
    'ESIM-' + Math.random().toString(36).substr(2, 9).toUpperCase()
  );
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ProtectedRoute>
      <div className="py-20 md:py-28 relative bg-linear-to-b from-white via-slate-50 to-white">
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: '-10%',
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${3 + Math.random() * 2}s`,
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'][
                        Math.floor(Math.random() * 5)
                      ],
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-28 h-28 bg-linear-to-br from-green-100 to-emerald-100 rounded-full mb-6 shadow-2xl animate-bounce">
                <svg
                  className="w-14 h-14 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-linear-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Payment Successful!
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 font-medium">
                Your eSIM is ready to activate
              </p>
            </div>

            <Card className="mb-8">
              <div className="text-center mb-8">
                <p className="text-sm text-slate-600 mb-2 font-semibold">Order Number</p>
                <p className="text-3xl font-extrabold bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{orderNumber}</p>
              </div>

              <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-xl p-6 mb-8 border border-green-200">
                <h2 className="text-2xl font-bold mb-4 text-center text-slate-900">
                  📧 Check Your Email
                </h2>
                <p className="text-center text-slate-700 leading-relaxed">
                  We've sent your eSIM QR code and activation instructions to your email address.
                  You should receive it within the next few minutes.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-5 bg-slate-50 rounded-xl hover:shadow-lg transition-shadow duration-200">
                  <div className="text-4xl mb-3">📱</div>
                  <p className="text-base font-bold text-slate-900 mb-1">Instant Activation</p>
                  <p className="text-sm text-slate-600">
                    Scan QR code to activate
                  </p>
                </div>
                <div className="text-center p-5 bg-slate-50 rounded-xl hover:shadow-lg transition-shadow duration-200">
                  <div className="text-4xl mb-3">🌍</div>
                  <p className="text-base font-bold text-slate-900 mb-1">Global Coverage</p>
                  <p className="text-sm text-slate-600">
                    Ready to use immediately
                  </p>
                </div>
                <div className="text-center p-5 bg-slate-50 rounded-xl hover:shadow-lg transition-shadow duration-200">
                  <div className="text-4xl mb-3">💬</div>
                  <p className="text-base font-bold text-slate-900 mb-1">24/7 Support</p>
                  <p className="text-sm text-slate-600">
                    We're here to help
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-8">
                <h3 className="text-2xl font-bold mb-6 text-slate-900">Next Steps:</h3>
                <ol className="space-y-4 text-base text-slate-600">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-linear-to-br from-green-500 to-emerald-600 text-white rounded-lg flex items-center justify-center font-bold mr-3">1</span>
                    <span className="pt-1">Open the email we sent you and find your eSIM QR code</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-linear-to-br from-emerald-500 to-teal-600 text-white rounded-lg flex items-center justify-center font-bold mr-3">2</span>
                    <span className="pt-1">Go to Settings → Cellular → Add Cellular Plan on your device</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-linear-to-br from-teal-500 to-cyan-600 text-white rounded-lg flex items-center justify-center font-bold mr-3">3</span>
                    <span className="pt-1">Scan the QR code with your device camera</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-linear-to-br from-cyan-500 to-blue-600 text-white rounded-lg flex items-center justify-center font-bold mr-3">4</span>
                    <span className="pt-1">Follow the on-screen instructions to complete activation</span>
                  </li>
                </ol>
              </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/profile" className="flex-1">
                <Button className="w-full" size="lg">
                  View My eSIMs
                </Button>
              </Link>
              <Link href="/marketplace" className="flex-1">
                <Button variant="outline" className="w-full" size="lg">
                  Browse More Plans
                </Button>
              </Link>
            </div>

            <div className="mt-10 text-center">
              <p className="text-base text-slate-600 mb-3 font-medium">
                Need help activating your eSIM?
              </p>
              <button
                onClick={() => router.push('/support')}
                className="text-green-600 hover:text-green-700 text-base font-bold hover:underline"
              >
                Contact Support →
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </ProtectedRoute>
  );
}


