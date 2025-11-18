"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { guestApi, GuestSimCard } from "@/lib/guest-api";
import { marketplaceApi } from "@/lib/marketplace-api";
import { EsimPackage } from "@/types";
import { useTranslations } from "@/contexts/LocaleContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";

type Step = "search" | "select-sim" | "select-plan" | "review" | "processing";

function codeToFlagEmoji(isoCode: string | null): string {
  if (!isoCode) return "🌐";
  const code = isoCode.trim().toUpperCase();
  if (code.length !== 2) return "🌐";
  const A = 0x1f1e6; // Regional Indicator Symbol Letter A
  return String.fromCodePoint(
    A + (code.codePointAt(0)! - 65),
    A + (code.codePointAt(1)! - 65)
  );
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function GuestTopUp() {
  const router = useRouter();
  const t = useTranslations();
  const [currentStep, setCurrentStep] = useState<Step>("search");
  const [identifier, setIdentifier] = useState("");
  const [identifierError, setIdentifierError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [simCards, setSimCards] = useState<GuestSimCard[]>([]);
  const [selectedSimCard, setSelectedSimCard] = useState<GuestSimCard | null>(null);
  const [availablePlans, setAvailablePlans] = useState<EsimPackage[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<EsimPackage | null>(null);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateIdentifier = (value: string): boolean => {
    const trimmed = value.trim();
    // Check if it's an email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Check if it's a phone number (basic validation)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return emailRegex.test(trimmed) || phoneRegex.test(trimmed.replace(/\s/g, ""));
  };

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setIdentifierError("");
    setError("");
    const trimmedIdentifier = identifier.trim();

    if (!trimmedIdentifier) {
      setIdentifierError(t("phoneOrEmailRequired"));
      return;
    }

    if (!validateIdentifier(trimmedIdentifier)) {
      setIdentifierError(t("invalidIdentifier"));
      return;
    }

    setIsSearching(true);
    try {
      // Mock data for now - backend will be implemented later
      // const cards = await guestApi.searchSimCards(trimmedIdentifier);
      
      // Mock SIM cards for demonstration
      const mockSimCards: GuestSimCard[] = [
        {
          id: "1",
          iccid: "89012345678901234567",
          phoneNumber: "+1234567890",
          email: trimmedIdentifier.includes("@") ? trimmedIdentifier : "user@example.com",
          country: "United States",
          countryCode: "US",
          flag: "🇺🇸",
          data: "5GB",
          used: "2.3GB",
          remaining: "2.7GB",
          expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: "active",
          purchaseDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          planName: "5GB - 7 Days",
        },
        {
          id: "2",
          iccid: "89012345678901234568",
          phoneNumber: "+1234567890",
          email: trimmedIdentifier.includes("@") ? trimmedIdentifier : "user@example.com",
          country: "Japan",
          countryCode: "JP",
          flag: "🇯🇵",
          data: "10GB",
          used: "8.1GB",
          remaining: "1.9GB",
          expiry: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          status: "active",
          purchaseDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          planName: "10GB - 14 Days",
        },
      ];

      setSimCards(mockSimCards);
      
      if (mockSimCards.length > 0) {
        setCurrentStep("select-sim");
      } else {
        setError(t("noSimCardsFound"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("searchFailed"));
    } finally {
      setIsSearching(false);
    }
  };

  const handleSimCardSelect = async (simCard: GuestSimCard) => {
    setSelectedSimCard(simCard);
    setIsLoadingPlans(true);
    setError("");

    try {
      // Fetch available plans for the country
      const plans = await marketplaceApi.getPackages(simCard.countryCode);
      setAvailablePlans(plans);
      setCurrentStep("select-plan");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToLoadPlans"));
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const handlePlanSelect = (plan: EsimPackage) => {
    setSelectedPlan(plan);
    setCurrentStep("review");
  };

  const handleTopUp = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedSimCard || !selectedPlan) return;

    setError("");
    setIsSubmitting(true);

    try {
      // Mock top-up - backend will be implemented later
      // const response = await guestApi.topUpSimCard({
      //   simCardId: selectedSimCard.id,
      //   identifier: identifier.trim(),
      //   plan: {
      //     packageCode: selectedPlan.packageCode,
      //     price: selectedPlan.price,
      //     retailPrice: selectedPlan.retailPrice,
      //   },
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock response
      const mockResponse = {
        orderId: `TOPUP-${Date.now()}`,
        paymentUrl: "#", // Will redirect to QPay when backend is ready
        status: "PENDING" as const,
        simCardId: selectedSimCard.id,
      };

      // For now, just show success message
      // When backend is ready, redirect to payment URL
      // if (mockResponse.paymentUrl) {
      //   window.location.href = mockResponse.paymentUrl;
      // }

      alert(t("topUpSuccess") + " " + t("backendWillBeImplemented"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("topUpFailed"));
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-700 border-emerald-300";
      case "expired":
        return "bg-red-100 text-red-700 border-red-300";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return t("active");
      case "expired":
        return t("expired");
      case "pending":
        return t("pending");
      default:
        return status;
    }
  };

  return (
    <div className="py-12 md:py-20 bg-gradient-to-b from-white via-slate-50 to-white min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
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
              <span className="font-medium">{t("back")}</span>
            </Link>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-2 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
              {t("topUpSimCard")}
            </h1>
            <p className="text-slate-600 text-lg">
              {t("topUpSimCardDesc")}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-red-600 shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-red-900 font-semibold mb-1">{t("error")}</p>
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
                <button
                  onClick={() => setError("")}
                  className="text-red-600 hover:text-red-800"
                >
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </Card>
          )}

          {/* Step 1: Search */}
          {currentStep === "search" && (
            <Card>
              <div className="mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-white"
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
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {t("searchForSimCards")}
                </h2>
                <p className="text-slate-600">
                  {t("searchForSimCardsDesc")}
                </p>
              </div>

              <form onSubmit={handleSearch} className="space-y-6">
                <Input
                  label={t("phoneOrEmail")}
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setIdentifierError("");
                  }}
                  placeholder={t("phoneOrEmailPlaceholder")}
                  error={identifierError}
                  required
                />

                <Button type="submit" className="w-full" size="lg" disabled={isSearching}>
                  {isSearching ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      {t("searching")}
                    </span>
                  ) : (
                    t("search")
                  )}
                </Button>
              </form>
            </Card>
          )}

          {/* Step 2: Select SIM Card */}
          {currentStep === "select-sim" && (
            <div className="space-y-6">
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                      {t("yourSimCards")}
                    </h2>
                    <p className="text-slate-600">
                      {t("selectSimCardToTopUp")}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentStep("search");
                      setSimCards([]);
                    }}
                  >
                    {t("changeSearch")}
                  </Button>
                </div>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                {simCards.map((simCard) => (
                  <Card
                    key={simCard.id}
                    hover
                    className={`cursor-pointer transition-all ${
                      selectedSimCard?.id === simCard.id
                        ? "ring-2 ring-blue-500 border-blue-500"
                        : ""
                    }`}
                    onClick={() => handleSimCardSelect(simCard)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl shrink-0">{simCard.flag}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-lg text-slate-900 mb-1">
                              {simCard.country}
                            </h3>
                            {simCard.planName && (
                              <p className="text-sm text-slate-600 mb-2">
                                {simCard.planName}
                              </p>
                            )}
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-lg border ${getStatusColor(
                              simCard.status
                            )}`}
                          >
                            {getStatusText(simCard.status)}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-slate-600">
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
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            <span>
                              {t("data")}: {simCard.data} ({t("remaining")}: {simCard.remaining})
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
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
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span>
                              {t("expires")}: {formatDate(simCard.expiry)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500 text-xs">
                            <span>ICCID: {simCard.iccid.slice(-4)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {isLoadingPlans && (
                <Card>
                  <div className="flex items-center justify-center py-8">
                    <svg
                      className="animate-spin h-8 w-8 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span className="ml-3 text-slate-600">{t("loadingPlans")}</span>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Step 3: Select Plan */}
          {currentStep === "select-plan" && selectedSimCard && (
            <div className="space-y-6">
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                      {t("selectTopUpPlan")}
                    </h2>
                    <p className="text-slate-600">
                      {t("selectTopUpPlanDesc")}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep("select-sim")}
                  >
                    {t("back")}
                  </Button>
                </div>

                {/* Selected SIM Card Summary */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{selectedSimCard.flag}</div>
                    <div>
                      <p className="font-semibold text-slate-900">{selectedSimCard.country}</p>
                      <p className="text-sm text-slate-600">
                        {t("remaining")}: {selectedSimCard.remaining}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {availablePlans.length === 0 ? (
                <Card>
                  <div className="text-center py-8">
                    <p className="text-slate-600">{t("noPlansAvailable")}</p>
                  </div>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {availablePlans.map((plan) => (
                    <Card
                      key={plan.packageCode}
                      hover
                      className={`cursor-pointer transition-all ${
                        selectedPlan?.packageCode === plan.packageCode
                          ? "ring-2 ring-blue-500 border-blue-500"
                          : ""
                      }`}
                      onClick={() => handlePlanSelect(plan)}
                    >
                      <div className="mb-4">
                        <h3 className="font-bold text-lg text-slate-900 mb-2">
                          {plan.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg font-medium text-sm">
                            {(plan.volume / 1024).toFixed(plan.volume >= 1024 ? 0 : 1)}{plan.volume >= 1024 ? "GB" : "MB"}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-100 text-cyan-700 rounded-lg font-medium text-sm">
                            {plan.duration} {plan.durationUnit}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                        <div>
                          <p className="text-xs text-slate-500">{t("price")}</p>
                          <p className="text-2xl font-bold text-slate-900">
                            {formatCurrency(plan.retailPrice)}
                          </p>
                        </div>
                        {selectedPlan?.packageCode === plan.packageCode && (
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-white"
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
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === "review" && selectedSimCard && selectedPlan && (
            <Card>
              <div className="mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {t("reviewTopUp")}
                </h2>
                <p className="text-slate-600">
                  {t("reviewTopUpDesc")}
                </p>
              </div>

              <div className="space-y-6">
                {/* SIM Card Info */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
                  <h3 className="font-bold text-lg text-slate-900 mb-4">
                    {t("simCardInfo")}
                  </h3>
                  <div className="flex items-start gap-4">
                    <div className="text-4xl shrink-0">{selectedSimCard.flag}</div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 mb-2">
                        {selectedSimCard.country}
                      </p>
                      <div className="space-y-1 text-sm text-slate-600">
                        <p>ICCID: {selectedSimCard.iccid}</p>
                        <p>
                          {t("currentData")}: {selectedSimCard.data} ({t("remaining")}: {selectedSimCard.remaining})
                        </p>
                        <p>
                          {t("expires")}: {formatDate(selectedSimCard.expiry)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selected Plan */}
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <h3 className="font-bold text-lg text-slate-900 mb-4">
                    {t("selectedPlan")}
                  </h3>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-900 mb-2">{selectedPlan.name}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg font-medium">
                          {(selectedPlan.volume / 1024).toFixed(selectedPlan.volume >= 1024 ? 0 : 1)}{selectedPlan.volume >= 1024 ? "GB" : "MB"}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-100 text-cyan-700 rounded-lg font-medium">
                          {selectedPlan.duration} {selectedPlan.durationUnit}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 mb-1">{t("price")}</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {formatCurrency(selectedPlan.retailPrice)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">{t("total")}</span>
                    <span className="text-3xl font-bold">
                      {formatCurrency(selectedPlan.retailPrice)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setCurrentStep("select-plan")}
                  >
                    {t("back")}
                  </Button>
                  <Button
                    type="button"
                    className="flex-1"
                    size="lg"
                    onClick={handleTopUp}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        {t("processing")}
                      </span>
                    ) : (
                      t("proceedToPayment")
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

