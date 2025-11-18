"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useTranslations } from "@/contexts/LocaleContext";
import { EsimPlan } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type Step = 1 | 2 | 3 | 4;

export default function GuestCheckout() {
  const router = useRouter();
  const { selectedPlan } = useCheckout();
  const t = useTranslations();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // If no plan selected, try to get from sessionStorage
    if (!selectedPlan) {
      const pendingPurchase = sessionStorage.getItem("pendingPurchase");
      if (pendingPurchase) {
        try {
          const plan = JSON.parse(pendingPurchase);
          // Store in context if needed
        } catch (error) {
          console.error("Failed to parse pending purchase:", error);
        }
      } else {
        router.push("/marketplace");
      }
    }
  }, [selectedPlan, router]);

  const plan = selectedPlan || (() => {
    const pendingPurchase = sessionStorage.getItem("pendingPurchase");
    if (pendingPurchase) {
      try {
        return JSON.parse(pendingPurchase) as EsimPlan;
      } catch {
        return null;
      }
    }
    return null;
  })();

  if (!plan) {
    return null;
  }

  const validatePhone = (value: string): boolean => {
    // Basic phone validation - adjust regex as needed
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(value.replace(/\s/g, ""));
  };

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handlePhoneNext = () => {
    setPhoneError("");
    const trimmedPhone = phone.trim();
    
    if (!trimmedPhone) {
      setPhoneError(t("phoneRequired"));
      return;
    }

    if (!validatePhone(trimmedPhone)) {
      setPhoneError(t("phoneInvalid"));
      return;
    }

    setCurrentStep(2);
  };

  const handleEmailNext = () => {
    setEmailError("");
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) {
      setEmailError(t("emailRequired"));
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setEmailError(t("emailInvalid"));
      return;
    }

    setCurrentStep(3);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/guest/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phone.trim(),
          email: email.trim(),
          plan: {
            packageCode: plan.packageCode,
            price: plan.price,
            retailPrice: plan.retailPrice,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to create checkout");
      }

      // Redirect to QPay payment URL
      if (data.data?.paymentUrl) {
        window.location.href = data.data.paymentUrl;
      } else {
        throw new Error("No payment URL received");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const progressPercentage = ((currentStep - 1) / 3) * 100;

  return (
    <div className="py-12 md:py-20 bg-gradient-to-b from-white via-slate-50 to-white min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/checkout"
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
              {t("guestCheckout")}
            </h1>
            <p className="text-slate-600 text-lg">
              {t("guestCheckoutSubtitle")}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">
                {t("step")} {currentStep} {t("of")} 4
              </span>
              <span className="text-sm text-slate-500">
                {Math.round(progressPercentage)}% {t("complete")}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
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
                  <p className="text-red-900 font-semibold mb-1">Error</p>
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

          {/* Step 1: Phone */}
          {currentStep === 1 && (
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
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {t("enterPhoneNumber")}
                </h2>
                <p className="text-slate-600">
                  {t("enterPhoneDesc")}
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handlePhoneNext();
                }}
                className="space-y-6"
              >
                <Input
                  label={t("phoneNumber")}
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setPhoneError("");
                  }}
                  placeholder={t("phonePlaceholder")}
                  error={phoneError}
                  required
                />

                <Button type="submit" className="w-full" size="lg">
                  {t("continue")}
                </Button>
              </form>
            </Card>
          )}

          {/* Step 2: Email */}
          {currentStep === 2 && (
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {t("enterEmail")}
                </h2>
                <p className="text-slate-600">
                  {t("enterEmailDesc")}
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleEmailNext();
                }}
                className="space-y-6"
              >
                <Input
                  label={t("emailAddress")}
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                  }}
                  placeholder={t("emailPlaceholder")}
                  error={emailError}
                  required
                />

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setCurrentStep(1)}
                  >
                    {t("back")}
                  </Button>
                  <Button type="submit" className="flex-1" size="lg">
                    {t("continue")}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Step 3: Plan Summary */}
          {currentStep === 3 && (
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
                  {t("reviewOrder")}
                </h2>
                <p className="text-slate-600">
                  {t("reviewOrderDesc")}
                </p>
              </div>

              <div className="space-y-6">
                {/* Plan Details */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
                  <div className="flex items-start gap-4 mb-4">
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
                      <div className="flex flex-wrap items-center gap-2 text-sm mb-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg font-medium">
                          {plan.data}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-100 text-cyan-700 rounded-lg font-medium">
                          {plan.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <h4 className="font-semibold text-slate-900 mb-3">
                    {t("contactInformation")}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-slate-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <span className="text-slate-700">{phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-slate-500"
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
                      <span className="text-slate-700">{email}</span>
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">{t("total")}</span>
                    <span className="text-3xl font-bold">
                      {formatCurrency(plan.retailPrice)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setCurrentStep(2)}
                  >
                    {t("back")}
                  </Button>
                  <Button
                    type="button"
                    className="flex-1"
                    size="lg"
                    onClick={() => setCurrentStep(4)}
                  >
                    {t("continue")}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Step 4: Confirm & Pay */}
          {currentStep === 4 && (
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {t("confirmAndPay")}
                </h2>
                <p className="text-slate-600">
                  {t("confirmAndPayDesc")}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Terms */}
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
                    required
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-slate-700 cursor-pointer"
                  >
                    {t("agreeToTerms")}{" "}
                    <a
                      href="#"
                      className="text-blue-600 hover:text-blue-700 font-semibold underline"
                    >
                      {t("termsOfService")}
                    </a>{" "}
                    {t("and")}{" "}
                    <a
                      href="#"
                      className="text-blue-600 hover:text-blue-700 font-semibold underline"
                    >
                      {t("privacyPolicy")}
                    </a>
                  </label>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setCurrentStep(3)}
                    disabled={isSubmitting}
                  >
                    {t("back")}
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    size="lg"
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
                      t("payWithQPay")
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

