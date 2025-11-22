"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { useTranslations } from "@/contexts/LocaleContext";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState, Suspense } from "react";

type PaymentStatus = "PENDING" | "PAID" | "EXPIRED" | null;

interface PaymentInfo {
  status: PaymentStatus;
  orderId?: string;
  qrCode?: string;
  iccid?: string;
  smdp?: string;
  activationCode?: string;
}

function CheckPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const [identifier, setIdentifier] = useState("");
  const [identifierError, setIdentifierError] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if orderId is in URL params
    const orderId = searchParams.get("orderId");
    if (orderId) {
      checkPaymentStatus(orderId);
    }
  }, [searchParams]);

  const checkPaymentStatus = async (value: string) => {
    setIsChecking(true);
    setError("");
    setIdentifierError("");

    try {
      const response = await fetch("/api/guest/check-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier: value.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to check payment status");
      }

      setPaymentInfo(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setPaymentInfo(null);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIdentifierError("");

    const trimmed = identifier.trim();
    if (!trimmed) {
      setIdentifierError(t("phoneOrEmailRequired"));
      return;
    }

    await checkPaymentStatus(trimmed);
  };

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800 border-green-300";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "EXPIRED":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case "PAID":
        return (
          <svg
            className="w-6 h-6"
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
        );
      case "PENDING":
        return (
          <svg
            className="w-6 h-6"
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
        );
      case "EXPIRED":
        return (
          <svg
            className="w-6 h-6"
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
        );
      default:
        return null;
    }
  };

  return (
    <div className="py-12 md:py-20 bg-gradient-to-b from-white via-slate-50 to-white min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-2 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
              {t("checkPaymentStatus")}
            </h1>
            <p className="text-slate-600 text-lg">
              {t("checkPaymentDesc")}
            </p>
          </div>

          {/* Check Form */}
          {!paymentInfo && (
            <Card className="mb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label={t("phoneOrEmail")}
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setIdentifierError("");
                    setError("");
                  }}
                  placeholder={t("phoneOrEmailPlaceholder")}
                  error={identifierError}
                  required
                />

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isChecking}
                >
                  {isChecking ? (
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
                      {t("checking")}
                    </span>
                  ) : (
                    t("checkStatus")
                  )}
                </Button>
              </form>
            </Card>
          )}

          {/* Payment Status Result */}
          {paymentInfo && (
            <div className="space-y-6">
              {/* Status Card */}
              <Card className={`border-2 ${getStatusColor(paymentInfo.status)}`}>
                <div className="flex items-center gap-4">
                  <div className="shrink-0">{getStatusIcon(paymentInfo.status)}</div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-1">
                      {t("paymentStatus")} {paymentInfo.status}
                    </h2>
                    {paymentInfo.orderId && (
                      <p className="text-sm opacity-80">
                        {t("orderId")}: {paymentInfo.orderId}
                      </p>
                    )}
                  </div>
                </div>
              </Card>

              {/* Activation Details (if PAID) */}
              {paymentInfo.status === "PAID" && (
                <Card>
                  <h3 className="text-xl font-bold text-slate-900 mb-6">
                    {t("esimActivationDetails")}
                  </h3>

                  <div className="space-y-6">
                    {/* QR Code */}
                    {paymentInfo.qrCode && (
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3">
                          {t("qrCode")}
                        </h4>
                        <div className="bg-white p-4 rounded-lg border-2 border-slate-200 inline-block">
                          <img
                            src={paymentInfo.qrCode}
                            alt="eSIM QR Code"
                            className="w-48 h-48"
                          />
                        </div>
                      </div>
                    )}

                    {/* ICCID */}
                    {paymentInfo.iccid && (
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">
                          {t("iccid")}
                        </h4>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                          <p className="font-mono text-sm text-slate-900">
                            {paymentInfo.iccid}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* SMDP */}
                    {paymentInfo.smdp && (
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">
                          {t("smdpAddress")}
                        </h4>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                          <p className="font-mono text-sm text-slate-900 break-all">
                            {paymentInfo.smdp}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Activation Code */}
                    {paymentInfo.activationCode && (
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">
                          {t("activationCode")}
                        </h4>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                          <p className="font-mono text-sm text-slate-900">
                            {paymentInfo.activationCode}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Installation Steps */}
                    <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                      <h4 className="font-bold text-slate-900 mb-4">
                        {t("installationSteps")}
                      </h4>
                      <ol className="space-y-3 text-sm text-slate-700">
                        <li className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                            1
                          </span>
                          <span>
                            {t("installationStep1")}
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                            2
                          </span>
                          <span>
                            {t("installationStep2")}
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                            3
                          </span>
                          <span>
                            {t("installationStep3")}
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                            4
                          </span>
                          <span>
                            {t("installationStep4")}
                          </span>
                        </li>
                      </ol>
                    </div>
                  </div>
                </Card>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setPaymentInfo(null);
                    setIdentifier("");
                    setError("");
                  }}
                >
                  {t("checkAnotherOrder")}
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => router.push("/marketplace")}
                >
                  {t("browseMorePlans")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CheckPayment() {
  return (
    <Suspense fallback={
      <div className="py-12 md:py-20 bg-gradient-to-b from-white via-slate-50 to-white min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-slate-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <CheckPaymentContent />
    </Suspense>
  );
}

