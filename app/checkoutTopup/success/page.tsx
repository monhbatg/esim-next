"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCheckout } from "@/contexts/CheckoutContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ProtectedRoute from "@/components/ProtectedRoute";
import { EsimPlan } from "@/types";

interface PurchaseData {
  plan: EsimPlan;
  total: number;
  subtotal: number;
  taxes: number;
  currency: string;
  orderDate: string;
}

export default function CheckoutSuccess() {
  const router = useRouter();
  const { user } = useAuth();
  const { selectedPlan } = useCheckout();
  
  console.log("selectedPlan", selectedPlan);

  const [purchaseData, setPurchaseData] = useState<PurchaseData | null>(null);
  const [orderNumber] = useState(
    () => "ESIM-" + Math.random().toString(36).substr(2, 9).toUpperCase()
  );
  const [showConfetti, setShowConfetti] = useState(true);
  
  // Generate confetti data once to avoid calling Math.random() during render
  const [confettiPieces] = useState(() => {
    return Array.from({ length: 80 }, () => ({
      left: Math.random() * 100,
      delay: Math.random() * 4,
      duration: 3 + Math.random() * 3,
      color: [
        "#3b82f6",
        "#8b5cf6",
        "#ec4899",
        "#10b981",
        "#f59e0b",
        "#06b6d4",
      ][Math.floor(Math.random() * 6)],
      rotation: Math.random() * 360,
    }));
  });

  useEffect(() => {
    // First, try to get data from CheckoutContext (if still available)
    // This ensures we're using the exact chosen package data
    if (selectedPlan) {
      // If we have selectedPlan in context, use it to reconstruct purchase data
      const lastPurchase = sessionStorage.getItem("lastPurchase");
      if (lastPurchase) {
        try {
          const storedData = JSON.parse(lastPurchase);
          // Merge stored purchase data with the chosen package from context
          // This ensures we're using the exact package that was selected
          const data: PurchaseData = {
            ...storedData,
            plan: {
              ...storedData.plan,
              ...selectedPlan, // Override with context data to ensure it's the chosen package
            },
          };
          setPurchaseData(data);
        } catch (error) {
          console.error("Failed to parse purchase data:", error);
        }
      } else {
        // If no sessionStorage but we have context, create purchase data from context
        // This is a fallback in case sessionStorage wasn't set
        const data: PurchaseData = {
          plan: selectedPlan,
          total: selectedPlan.retailPrice * 1.1, // price + 10% tax
          subtotal: selectedPlan.retailPrice,
          taxes: selectedPlan.retailPrice * 0.1,
          currency: "USD", // Default, should come from wallet
          orderDate: new Date().toISOString(),
        };
        setPurchaseData(data);
      }
    } else {
      // Fallback to sessionStorage if context is cleared
      const lastPurchase = sessionStorage.getItem("lastPurchase");
      if (lastPurchase) {
        try {
          const data = JSON.parse(lastPurchase);
          setPurchaseData(data);
        } catch (error) {
          console.error("Failed to parse purchase data:", error);
        }
      } else {
        // If no purchase data, redirect to marketplace
        router.push("/marketplace");
      }
    }
  }, [router, selectedPlan]);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (!purchaseData) {
    return (
      <ProtectedRoute>
        <div className="py-20 md:py-28 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading order details...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="py-12 md:py-20 relative bg-gradient-to-b from-white via-slate-50 to-white min-h-screen">
        {/* Enhanced Confetti Animation */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {confettiPieces.map((piece, i) => (
              <div
                key={i}
                className="absolute animate-confetti"
                style={{
                  left: `${piece.left}%`,
                  top: "-10%",
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

        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Success Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 rounded-full mb-6 shadow-2xl relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full opacity-20 animate-ping"></div>
                <svg
                  className="w-16 h-16 text-green-600 relative z-10"
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
              <h1 className="text-4xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Payment Successful!
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 font-medium mb-2">
                Your eSIM is ready to activate
              </p>
              <p className="text-sm text-slate-500">
                Order placed on {formatDate(purchaseData.orderDate)}
              </p>
            </div>

            {/* Order Summary Card */}
            <Card className="mb-6">
              <div className="text-center mb-6 pb-6 border-b border-slate-200">
                <p className="text-sm text-slate-600 mb-2 font-semibold uppercase tracking-wide">
                  Order Number
                </p>
                <p className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {orderNumber}
                </p>
              </div>

              {/* Purchased Plan Details */}
              <div className="mb-6 pb-6 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Purchased Plan
                </h3>
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-200">
                  <div className="flex items-start gap-4">
                    <div className="text-5xl shrink-0">
                      {purchaseData.plan.flag}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xl text-slate-900 mb-1">
                        {purchaseData.plan.country}
                      </h4>
                      {purchaseData.plan.region && (
                        <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">
                          {purchaseData.plan.region}
                        </p>
                      )}
                      {/* Package Code - if available */}
                      {purchaseData.plan.packageCode && (
                        <p className="text-xs text-slate-400 mb-3 font-mono">
                          Package: {purchaseData.plan.packageCode}
                        </p>
                      )}
                      {/* Show savings if retailPrice is higher than price */}
                      {purchaseData.plan.retailPrice && 
                       purchaseData.plan.retailPrice > purchaseData.plan.retailPrice && (
                        <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-sm font-semibold">
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
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Save {formatCurrency(
                            purchaseData.plan.retailPrice - purchaseData.plan.price,
                            purchaseData.currency
                          )} (was {formatCurrency(purchaseData.plan.retailPrice, purchaseData.currency)})
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-3 mb-3">
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
                          {purchaseData.plan.data}
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
                          {purchaseData.plan.duration}
                        </span>
                      </div>
                      {purchaseData.plan.features &&
                        purchaseData.plan.features.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-semibold text-slate-700 mb-2">
                              Includes:
                            </p>
                            <ul className="flex flex-wrap gap-2">
                              {purchaseData.plan.features
                                .slice(0, 3)
                                .map((feature, index) => (
                                  <li
                                    key={index}
                                    className="text-xs text-slate-600 bg-white px-2 py-1 rounded"
                                  >
                                    {feature}
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}
                      {/* Plan Price */}
                      <div className="mt-4 pt-3 border-t border-emerald-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-700">
                            Plan Price:
                          </span>
                          <span className="text-xl font-bold text-emerald-700">
                            {formatCurrency(
                              purchaseData.plan.price,
                              purchaseData.currency
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border-2 border-emerald-200">
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                    Total Amount Paid
                  </p>
                  <p className="text-4xl md:text-5xl font-extrabold text-emerald-700 mb-2">
                    {formatCurrency(
                      purchaseData.total,
                      purchaseData.currency
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    Deducted from your wallet
                  </p>
                </div>
              </div>
            </Card>

            {/* Email Notification Card */}
            <Card className="mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-l-4 border-blue-500">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold mb-2 text-slate-900">
                      Check Your Email
                    </h2>
                    <p className="text-slate-700 leading-relaxed mb-2">
                      We&apos;ve sent your eSIM QR code and activation
                      instructions to{" "}
                      <span className="font-semibold text-blue-900">
                        {user?.email}
                      </span>
                      .
                    </p>
                    <p className="text-sm text-slate-600">
                      You should receive it within the next few minutes. Please
                      check your spam folder if you don&apos;t see it.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="text-center p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-base font-bold text-slate-900 mb-1">
                  Instant Activation
                </p>
                <p className="text-sm text-slate-600">
                  Scan QR code to activate immediately
                </p>
              </Card>
              <Card className="text-center p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-base font-bold text-slate-900 mb-1">
                  Global Coverage
                </p>
                <p className="text-sm text-slate-600">Ready to use worldwide</p>
              </Card>
              <Card className="text-center p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <p className="text-base font-bold text-slate-900 mb-1">
                  24/7 Support
                </p>
                <p className="text-sm text-slate-600">
                  We&apos;re here to help anytime
                </p>
              </Card>
            </div>

            {/* Activation Steps */}
            <Card className="mb-6">
              <h3 className="text-2xl font-bold mb-6 text-slate-900">
                Activation Steps
              </h3>
              <ol className="space-y-4">
                <li className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <span className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg">
                    1
                  </span>
                  <div className="flex-1 pt-1">
                    <p className="font-semibold text-slate-900 mb-1">
                      Check Your Email
                    </p>
                    <p className="text-sm text-slate-600">
                      Open the email we sent you and find your eSIM QR code
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <span className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg">
                    2
                  </span>
                  <div className="flex-1 pt-1">
                    <p className="font-semibold text-slate-900 mb-1">
                      Open Settings
                    </p>
                    <p className="text-sm text-slate-600">
                      Go to Settings → Cellular → Add Cellular Plan on your
                      device
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <span className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg">
                    3
                  </span>
                  <div className="flex-1 pt-1">
                    <p className="font-semibold text-slate-900 mb-1">
                      Scan QR Code
                    </p>
                    <p className="text-sm text-slate-600">
                      Scan the QR code with your device camera or manually enter
                      the activation code
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <span className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg">
                    4
                  </span>
                  <div className="flex-1 pt-1">
                    <p className="font-semibold text-slate-900 mb-1">
                      Complete Activation
                    </p>
                    <p className="text-sm text-slate-600">
                      Follow the on-screen instructions to complete activation
                      and start using your eSIM
                    </p>
                  </div>
                </li>
              </ol>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Link href="/profile" className="flex-1">
                <Button className="w-full shadow-xl" size="lg">
                  <span className="flex items-center justify-center gap-2">
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    View My eSIMs
                  </span>
                </Button>
              </Link>
              <Link href="/marketplace" className="flex-1">
                <Button variant="outline" className="w-full" size="lg">
                  <span className="flex items-center justify-center gap-2">
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
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    Browse More Plans
                  </span>
                </Button>
              </Link>
            </div>

            {/* Support Section */}
            <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full mb-4">
                  <svg
                    className="w-8 h-8 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">
                  Need Help?
                </h4>
                <p className="text-sm text-slate-600 mb-4">
                  Our support team is available 24/7 to help you activate your
                  eSIM
                </p>
                <button
                  onClick={() => router.push("/support")}
                  className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                >
                  Contact Support
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </Card>
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
    </ProtectedRoute>
  );
}
