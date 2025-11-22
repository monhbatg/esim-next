"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useTranslations } from "@/contexts/LocaleContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

interface OrderData {
  orderId: string;
  status: "PENDING" | "PAID" | "EXPIRED";
  qrCode?: string;
  iccid?: string;
  smdp?: string;
  activationCode?: string;
  plan?: {
    country: string;
    flag: string;
    data: string;
    duration: string;
    price: number;
  };
}

function GuestSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const orderId = searchParams.get("orderId");
    if (orderId) {
      fetchOrder(orderId);
    } else {
      setError("No order ID provided");
      setIsLoading(false);
    }
  }, [searchParams]);

  const fetchOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/guest/order/${orderId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to load order");
      }

      setOrderData(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load order");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="py-20 flex items-center justify-center min-h-screen">
        <Card className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{t("error")}</h2>
          <p className="text-slate-600 mb-6">{error || t("error")}</p>
          <Button onClick={() => router.push("/guest/check-payment")}>
            {t("checkPaymentStatus")}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-20 bg-gradient-to-b from-white via-slate-50 to-white min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          {orderData.status === "PAID" && (
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
                {t("paymentSuccessful")}
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 font-medium">
                {t("esimReadyToActivate")}
              </p>
            </div>
          )}

          {/* Order Status */}
          {orderData.status !== "PAID" && (
            <Card className="mb-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {t("orderStatus")}: {orderData.status}
                </h2>
                <p className="text-slate-600">
                  {orderData.status === "PENDING"
                    ? t("paymentPending")
                    : t("orderExpired")}
                </p>
              </div>
            </Card>
          )}

          {/* Activation Details (if PAID) */}
          {orderData.status === "PAID" && (
            <>
              {/* Plan Summary */}
              {orderData.plan && (
                <Card className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">
                    {t("purchasedPlan")}
                  </h3>
                  <div className="flex items-start gap-4">
                    <div className="text-4xl shrink-0">
                      {orderData.plan.flag}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-slate-900 mb-1">
                        {orderData.plan.country}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-medium">
                          {orderData.plan.data}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-teal-50 text-teal-700 rounded-lg font-medium">
                          {orderData.plan.duration}
                        </span>
                      </div>
                      <p className="text-xl font-bold text-emerald-700">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                          minimumFractionDigits: 2,
                        }).format(orderData.plan.price)}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Activation Details */}
              <Card className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">
                    {t("esimActivationDetails")}
                  </h3>

                  <div className="space-y-6">
                    {/* QR Code */}
                    {orderData.qrCode && (
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3">
                          {t("qrCode")}
                        </h4>
                      <div className="bg-white p-4 rounded-lg border-2 border-slate-200 inline-block">
                        <img
                          src={orderData.qrCode}
                          alt="eSIM QR Code"
                          className="w-64 h-64"
                        />
                      </div>
                    </div>
                  )}

                  {/* ICCID */}
                  {orderData.iccid && (
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">
                        {t("iccid")}
                      </h4>
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <p className="font-mono text-sm text-slate-900">
                          {orderData.iccid}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* SMDP */}
                  {orderData.smdp && (
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">
                        {t("smdpAddress")}
                      </h4>
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <p className="font-mono text-sm text-slate-900 break-all">
                          {orderData.smdp}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Activation Code */}
                  {orderData.activationCode && (
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">
                        {t("activationCode")}
                      </h4>
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <p className="font-mono text-sm text-slate-900">
                          {orderData.activationCode}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Installation Steps */}
                  <div className="bg-emerald-50 rounded-xl p-6 border-2 border-emerald-200">
                    <h4 className="font-bold text-slate-900 mb-4">
                      {t("installationSteps")}
                    </h4>
                    <ol className="space-y-3 text-sm text-slate-700">
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                          1
                        </span>
                        <span>
                          {t("installationStep1")}
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                          2
                        </span>
                        <span>
                          {t("installationStep2")}
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                          3
                        </span>
                        <span>
                          {t("installationStep3")}
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
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
            </>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {orderData.status === "PAID" ? (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push("/marketplace")}
                >
                  {t("browseMorePlans")}
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => router.push("/guest/check-payment")}
                >
                  {t("checkAnotherOrder")}
                </Button>
              </>
            ) : (
              <Button
                className="w-full"
                onClick={() => router.push("/marketplace")}
              >
                {t("browseMorePlans")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GuestSuccess() {
  return (
    <Suspense fallback={
      <div className="py-20 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <GuestSuccessContent />
    </Suspense>
  );
}

