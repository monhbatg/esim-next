'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import { EsimPlan } from '@/types';

interface CongratulationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: EsimPlan | null;
  orderNo?: string;
}

export default function CongratulationsModal({
  isOpen,
  onClose,
  plan,
  orderNo,
}: CongratulationsModalProps) {
  const [showConfetti, setShowConfetti] = useState(true);

  // Generate confetti data once
  const [confettiPieces] = useState(() => {
    return Array.from({ length: 50 }, () => ({
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2,
      color: [
        '#3b82f6',
        '#8b5cf6',
        '#ec4899',
        '#10b981',
        '#f59e0b',
        '#06b6d4',
      ][Math.floor(Math.random() * 6)],
      rotation: Math.random() * 360,
    }));
  });

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen || !plan) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        {/* Confetti Animation */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-[51] overflow-hidden">
            {confettiPieces.map((piece, i) => (
              <div
                key={i}
                className="absolute animate-confetti"
                style={{
                  left: `${piece.left}%`,
                  top: '-10%',
                  animationDelay: `${piece.delay}s`,
                  animationDuration: `${piece.duration}s`,
                }}
              >
                <div
                  className="w-3 h-3 rounded-full shadow-lg"
                  style={{
                    backgroundColor: piece.color,
                    transform: `rotate(${piece.rotation}deg)`,
                  }}
                />
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full relative z-[52] overflow-hidden">
          {/* Decorative gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 opacity-50"></div>

          <div className="relative p-8">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full opacity-20 animate-ping"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 rounded-full flex items-center justify-center shadow-xl">
                  <svg
                    className="w-12 h-12 text-green-600"
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
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-3 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Congratulations! 🎉
              </h2>
              <p className="text-lg text-slate-700 font-medium">
                Your eSIM purchase was successful!
              </p>
            </div>

            {/* Plan Details */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border-2 border-emerald-200 mb-6">
              <div className="flex items-center gap-4 mb-3">
                <div className="text-4xl shrink-0">{plan.flag}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-xl text-slate-900 mb-1">
                    {plan.country}
                  </h3>
                  {plan.region && (
                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                      {plan.region}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg font-semibold text-sm">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  {plan.data}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-100 text-teal-700 rounded-lg font-semibold text-sm">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {plan.duration}
                </span>
              </div>
              {orderNo && (
                <div className="pt-3 border-t border-emerald-200">
                  <p className="text-xs text-slate-600 mb-1">Order Number</p>
                  <p className="text-lg font-bold text-emerald-700">{orderNo}</p>
                </div>
              )}
            </div>

            {/* Message */}
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Great news!</span> Your eSIM QR
                code and activation instructions will be sent to your email
                shortly.
              </p>
            </div>

            {/* Action Button */}
            <div className="flex justify-center">
              <Button
                onClick={onClose}
                className="min-w-[200px] shadow-xl"
                size="lg"
              >
                <span className="flex items-center justify-center gap-2">
                  Got it!
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg) scale(0.5);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </>
  );
}

