"use client";

import Card from "@/components/ui/Card";
import { useAuth } from "@/contexts/AuthContext";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useTranslations } from "@/contexts/LocaleContext";
import { EsimPlan } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Checkout() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { selectedPlan, setSelectedPlan } = useCheckout();
  const t = useTranslations();
  const [plan, setPlan] = useState<EsimPlan | null>(selectedPlan);

  useEffect(() => {
    // Load plan from context or sessionStorage
    if (selectedPlan) {
      setPlan(selectedPlan);
    } else {
      const pendingPurchase = sessionStorage.getItem("pendingPurchase");
      if (pendingPurchase) {
        try {
          const parsedPlan = JSON.parse(pendingPurchase) as EsimPlan;
          setPlan(parsedPlan);
          setSelectedPlan(parsedPlan);
        } catch (error) {
          console.error("Failed to parse pending purchase:", error);
          router.push("/marketplace");
        }
      } else {
        router.push("/marketplace");
      }
    }
  }, [selectedPlan, setSelectedPlan, router]);

  if (!plan) {
    return (
      <div className="py-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-slate-600">{t("loading")}</p>
          </div>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-20 bg-gradient-to-b from-white via-slate-50 to-white min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header with back button */}
          <div className="mb-8 text-center">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-6 group"
            >
              <svg
                className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="font-medium">{t("backToMarketplace")}</span>
            </Link>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-2 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {t("chooseCheckoutMethod")}
            </h1>
            <p className="text-slate-600 text-lg">
              {t("selectCheckoutMethod")}
            </p>
          </div>

          {/* Plan Summary */}
          {plan && (
            <Card className="mb-8">
              <div className="flex items-start gap-4">
                <div className="text-4xl shrink-0">{plan.flag}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-900 mb-1">
                    {plan.country}
                  </h3>
                  {plan.region && (
                    <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">
                      {plan.region}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-medium">
                      {plan.data}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-teal-50 text-teal-700 rounded-lg font-medium">
                      {plan.duration}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-emerald-700">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 2,
                    }).format(plan.retailPrice)}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Two Option Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Login to Purchase Card */}
            <Card
              hover
              className="cursor-pointer group relative overflow-hidden"
              onClick={() => {
                if (isAuthenticated) {
                  router.push("/checkout/authenticated");
                } else {
                  sessionStorage.setItem("redirectAfterLogin", "/checkout/authenticated");
                  router.push("/login");
                }
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/5 group-hover:to-teal-500/5 transition-all duration-300 pointer-events-none" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-8 h-8 text-white"
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
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                  {t("loginToPurchase")}
                </h3>
                <p className="text-slate-600 mb-4">
                  {t("loginToPurchaseDesc")}
                </p>
                <div className="flex items-center gap-2 text-emerald-600 font-semibold group-hover:gap-3 transition-all">
                  <span>{t("continue")}</span>
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
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
              </div>
            </Card>

            {/* Continue as Guest Card */}
            <Card
              hover
              className="cursor-pointer group relative overflow-hidden"
              onClick={() => router.push("/guest/checkout")}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/5 group-hover:to-cyan-500/5 transition-all duration-300 pointer-events-none" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">
                  {t("continueAsGuest")}
                </h3>
                <p className="text-slate-600 mb-4">
                  {t("continueAsGuestDesc")}
                </p>
                <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
                  <span>{t("continue")}</span>
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
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
