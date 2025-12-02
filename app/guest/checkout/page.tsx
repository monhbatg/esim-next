"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useTranslations } from "@/contexts/LocaleContext";
import { EsimPackage, EsimPlan, PlanWithPackage } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState, useRef, useCallback } from "react";
import { useInvoiceStatus } from "@/lib/hooks/useInvoiceStatus";

type Step = 1 | 2 | 3 | 4;

type PaymentAppLink = {
  name: string;
  description?: string;
  logo?: string;
  link: string;
};

type NormalizedPlan = EsimPlan & {
  package?: EsimPackage;
};

type PaymentDetails = {
  invoice_id: string;
  qr_image: string;
  qr_link: string;
  qr_text?: string;
  qPay_shortUrl?: string;
  urls?: PaymentAppLink[];
  customerId?: string;
  internalInvoiceId?: string;
};

type EsimDetails = {
  esimTranNo: string;
  orderNo: string;
  transactionId: string;
  imsi: string | null;
  iccid: string | null;
  smsStatus: number | null;
  msisdn: string | null;
  ac: string | null;
  qrCodeUrl: string | null;
  shortUrl: string | null;
  smdpStatus: string | null;
  eid: string;
  activeType: number | null;
  dataType: number | null;
  activateTime: string | null;
  expiredTime: string | null;
  totalVolume: number;
  totalDuration: number;
  durationUnit: string;
  orderUsage: number | null;
  esimStatus: string;
  pin: string;
  puk: string;
  apn: string | null;
  packageList: Array<{
    packageName: string;
    packageCode: string;
    slug: string;
    duration: number;
    volume: number;
    locationCode: string;
    createTime: string;
  }>;
};

const isPlanWithPackage = (value: unknown): value is PlanWithPackage => {
  if (
    !value ||
    typeof value !== "object" ||
    !("plan" in value) ||
    !("package" in value)
  ) {
    return false;
  }

  const typedValue = value as {
    plan?: unknown;
    package?: unknown;
  };

  return (
    typeof typedValue.plan === "object" &&
    typedValue.plan !== null &&
    typeof typedValue.package === "object" &&
    typedValue.package !== null
  );
};

const normalizePlanData = (
  incoming: PlanWithPackage | EsimPlan | null
): NormalizedPlan | null => {
  if (!incoming) {
    return null;
  }

  if (isPlanWithPackage(incoming)) {
    return {
      ...incoming.plan,
      package: incoming.package,
    };
  }

  return incoming as NormalizedPlan;
};

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
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
    null
  );
  const [resolvedPlan, setResolvedPlan] = useState<NormalizedPlan | null>(
    normalizePlanData(selectedPlan)
  );
  const [isPlanResolved, setIsPlanResolved] = useState<boolean>(
    Boolean(selectedPlan)
  );
  const [esimDetails, setEsimDetails] = useState<EsimDetails | null>(null);
  const [loadingEsimDetails, setLoadingEsimDetails] = useState(false);
  const [esimDetailsError, setEsimDetailsError] = useState("");
  // Note: Automatic polling is disabled - only manual checks and callback URLs are used
  // Cron jobs for constant transaction checking are prohibited
  const hasRedirectedRef = useRef(false);
  const hasFetchedEsimRef = useRef(false);

  useEffect(() => {
    if (selectedPlan) {
      setResolvedPlan(normalizePlanData(selectedPlan));
      setIsPlanResolved(true);
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const pendingPurchase = window.sessionStorage.getItem("pendingPurchase");
    if (pendingPurchase) {
      try {
        const parsed = JSON.parse(pendingPurchase) as
          | PlanWithPackage
          | EsimPlan;
        setResolvedPlan(normalizePlanData(parsed));
      } catch (error) {
        console.error("Failed to parse pending purchase:", error);
      }
    } else {
      router.push("/marketplace");
    }

    setIsPlanResolved(true);
  }, [selectedPlan, router]);

  const plan = resolvedPlan;

  // Fetch eSIM details when payment is paid
  const fetchEsimDetails = useCallback(async (orderNo: string) => {
    if (hasFetchedEsimRef.current) return;

    setLoadingEsimDetails(true);
    setEsimDetailsError("");
    hasFetchedEsimRef.current = true;

    try {
      const response = await fetch("/api/guest/esim/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderNo: orderNo,
          pager: {
            pageNum: 1,
            pageSize: 20,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.errorMsg || result.error || "Failed to fetch eSIM details"
        );
      }

      if (result.success && result.obj?.esimList?.length > 0) {
        setEsimDetails(result.obj.esimList[0] as EsimDetails);
      } else {
        setEsimDetailsError("No eSIM details found for this order");
      }
    } catch (err) {
      console.error("Failed to fetch eSIM details:", err);
      setEsimDetailsError(
        err instanceof Error ? err.message : "Failed to fetch eSIM details"
      );
    } finally {
      setLoadingEsimDetails(false);
    }
  }, []);

  // Use invoice status hook (polling disabled - only manual checks allowed)
  // Automatic polling/cron jobs are prohibited - use callback URLs instead
  const {
    loading: isCheckingPayment,
    error: paymentCheckError,
    checkStatus: manualCheckStatus,
    status: paymentStatus,
  } = useInvoiceStatus(paymentDetails?.invoice_id || null, {
    enabled: false, // Disabled - no automatic polling allowed
    onSuccess: (result) => {
      if (!hasRedirectedRef.current && result.data?.orderId) {
        hasRedirectedRef.current = true;
        const orderNo =
          result.data.orderNo ||
          result.data.orderId ||
          paymentDetails?.invoice_id;
        // Fetch eSIM details when payment is confirmed
        if (result.data?.status === "PAID" && orderNo) {
          fetchEsimDetails(orderNo);
        }
        // window.location.href = `/guest/success?orderId=${orderId}`;
      }
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  // Fetch eSIM details when payment status becomes PAID
  useEffect(() => {
    if (
      paymentStatus?.data?.status === "PAID" &&
      paymentStatus.data.orderNo &&
      !hasFetchedEsimRef.current
    ) {
      fetchEsimDetails(paymentStatus.data.orderNo);
    }
  }, [
    paymentStatus?.data?.status,
    paymentStatus?.data?.orderNo,
    fetchEsimDetails,
  ]);

  // Display payment check errors from the hook
  useEffect(() => {
    if (paymentCheckError && !error) {
      setError(paymentCheckError);
    }
  }, [paymentCheckError, error]);

  if (!plan && !isPlanResolved) {
    return null;
  }
  if (!plan) {
    return null;
  }

  const planDescription = [plan.country, plan.data, plan.duration]
    .filter(Boolean)
    .join(" · ");
  const amountToCharge = Number(plan?.package?.buyPrice ?? 0);

  const getQrImageSrc = () => {
    if (!paymentDetails?.qr_image) {
      return "";
    }
    return paymentDetails.qr_image.startsWith("data:")
      ? paymentDetails.qr_image
      : `data:image/png;base64,${paymentDetails.qr_image}`;
  };

  const resetPaymentArtifacts = () => {
    setPaymentDetails(null);
  };
  const qrImageSrc = getQrImageSrc();

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
    resetPaymentArtifacts();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();

    setIsSubmitting(true);

    try {
      const packageCode = plan.package?.packageCode || plan.packageCode;

      if (!packageCode) {
        throw new Error(t("missingPackageCode"));
      }

      if (typeof amountToCharge !== "number" || Number.isNaN(amountToCharge)) {
        throw new Error(t("paymentDetailsMissing"));
      }

      const payload = {
        phoneNumber: trimmedPhone,
        email: trimmedEmail,
        // amount: 1, // for test
        amount: amountToCharge,
        packageCode,
        description: planDescription || "eSIM Purchase",
      };

      const response = await fetch("/api/customer/transactions/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const rawData = await response.json();
      const purchaseData = rawData?.data ?? rawData;

      if (!response.ok) {
        throw new Error(
          purchaseData?.error ||
            rawData?.error ||
            rawData?.message ||
            t("error")
        );
      }

      if (
        !purchaseData?.invoice_id ||
        !purchaseData?.qr_image ||
        !(purchaseData?.qr_link || purchaseData?.qPay_shortUrl)
      ) {
        throw new Error(t("paymentDetailsMissing"));
      }

      const normalizedUrls: PaymentAppLink[] | undefined = Array.isArray(
        purchaseData?.urls
      )
        ? (purchaseData.urls as Array<Partial<PaymentAppLink> | null>)
            .filter((app): app is Partial<PaymentAppLink> & { link: string } =>
              Boolean(app?.link && typeof app.link === "string")
            )
            .map((app) => ({
              name: app?.name || app?.description || "Bank App",
              description: app?.description,
              logo: app?.logo,
              link: app.link,
            }))
        : undefined;

      setPaymentDetails({
        invoice_id: purchaseData.invoice_id,
        qr_image: purchaseData.qr_image,
        qr_link: purchaseData.qr_link || purchaseData.qPay_shortUrl || "",
        qr_text: purchaseData.qr_text,
        qPay_shortUrl: purchaseData.qPay_shortUrl,
        urls: normalizedUrls,
        customerId: purchaseData.customerId,
        internalInvoiceId: purchaseData.internalInvoiceId,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("mn-MN", {
      style: "currency",
      currency: "MNT",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const progressPercentage = ((currentStep - 1) / 3) * 100;

  return (
    <div className="py-12 md:py-20 bg-linear-to-b from-white via-slate-50 to-white min-h-screen">
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
            <h1 className="text-4xl md:text-5xl font-extrabold mb-2 bg-linear-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
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
                className="bg-linear-to-r from-blue-500 to-cyan-600 h-2.5 rounded-full transition-all duration-300"
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
                <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4">
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
                <p className="text-slate-600">{t("enterPhoneDesc")}</p>
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
                <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4">
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
                <p className="text-slate-600">{t("enterEmailDesc")}</p>
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
                    onClick={() => {
                      resetPaymentArtifacts();
                      setCurrentStep(1);
                    }}
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
                <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4">
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
                <p className="text-slate-600">{t("reviewOrderDesc")}</p>
              </div>

              <div className="space-y-6">
                {/* Plan Details */}
                <div className="bg-linear-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
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
                <div className="bg-linear-to-br from-blue-500 to-cyan-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">{t("total")}</span>
                    <span className="text-3xl font-bold">
                      {formatCurrency(amountToCharge)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      resetPaymentArtifacts();
                      setCurrentStep(2);
                    }}
                  >
                    {t("back")}
                  </Button>
                  <Button
                    type="button"
                    className="flex-1"
                    size="lg"
                    onClick={() => {
                      resetPaymentArtifacts();
                      setCurrentStep(4);
                    }}
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
                <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4">
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
                <p className="text-slate-600">{t("confirmAndPayDesc")}</p>
              </div>

              {!paymentDetails ? (
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
                      onClick={() => {
                        resetPaymentArtifacts();
                        setCurrentStep(3);
                      }}
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
              ) : (
                <div className="space-y-4">
                  {/* Callback URL Notice */}
                  <Card className="border-blue-200 bg-blue-50">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-blue-600 shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div className="flex-1">
                        <p className="text-blue-900 font-semibold text-sm mb-1">
                          {t("paymentStatusUpdate") ||
                            "Төлбөрийн статус шинэчлэгдэх тухай"}
                        </p>
                        <p className="text-blue-700 text-xs">
                          {t("callbackUrlNotice") ||
                            "Төлбөр амжилттай болсны дараа танд автоматаар мэдэгдэх болно. Та мөн доорх товчийг дарж гараар шалгаж болно."}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Payment Status Display */}
                  {paymentStatus?.data?.status && (
                    <Card
                      className={
                        paymentStatus.data.status === "PAID"
                          ? "border-green-200 bg-green-50"
                          : paymentStatus.data.status === "FAILED"
                          ? "border-red-200 bg-red-50"
                          : paymentStatus.data.status === "PARTIAL"
                          ? "border-yellow-200 bg-yellow-50"
                          : paymentStatus.data.status === "REFUNDED"
                          ? "border-orange-200 bg-orange-50"
                          : paymentStatus.data.status === "NEW"
                          ? "border-blue-200 bg-blue-50"
                          : "border-slate-200 bg-slate-50"
                      }
                    >
                      <div className="flex items-start gap-3">
                        {paymentStatus.data.status === "PAID" && (
                          <svg
                            className="w-6 h-6 text-green-600 shrink-0 mt-0.5"
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
                        )}
                        {paymentStatus.data.status === "FAILED" && (
                          <svg
                            className="w-6 h-6 text-red-600 shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        )}
                        {(paymentStatus.data.status === "PARTIAL" ||
                          paymentStatus.data.status === "REFUNDED" ||
                          paymentStatus.data.status === "NEW" ||
                          paymentStatus.data.status === "PENDING") && (
                          <svg
                            className="w-6 h-6 text-blue-600 shrink-0 mt-0.5"
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
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-sm mb-1">
                            {t("transactionStatus") || "Transaction Status"}
                          </p>
                          <p
                            className={
                              paymentStatus.data.status === "PAID"
                                ? "text-green-900 font-bold text-lg"
                                : paymentStatus.data.status === "FAILED"
                                ? "text-red-900 font-bold text-lg"
                                : paymentStatus.data.status === "PARTIAL"
                                ? "text-yellow-900 font-bold text-lg"
                                : paymentStatus.data.status === "REFUNDED"
                                ? "text-orange-900 font-bold text-lg"
                                : "text-slate-900 font-bold text-lg"
                            }
                          >
                            {paymentStatus.data.status === "PAID" &&
                              (t("transactionStatusPaid") || "Төлөгдсөн")}
                            {paymentStatus.data.status === "FAILED" &&
                              (t("transactionStatusFailed") ||
                                "Гүйлгээ амжилтгүй")}
                            {paymentStatus.data.status === "PARTIAL" &&
                              (t("transactionStatusPartial") ||
                                "Дутуу төлөгдсөн")}
                            {paymentStatus.data.status === "REFUNDED" &&
                              (t("transactionStatusRefunded") ||
                                "Гүйлгээ буцаагдсан")}
                            {paymentStatus.data.status === "NEW" &&
                              (t("transactionStatusNew") ||
                                "Гүйлгээ үүсгэгдсэн")}
                            {paymentStatus.data.status === "PENDING" &&
                              (t("transactionStatusPending") ||
                                "Хүлээгдэж байна")}
                          </p>
                          {paymentStatus.data.paid_amount !== undefined &&
                            paymentStatus.data.paid_amount > 0 && (
                              <p className="text-xs mt-1 opacity-75">
                                {t("paidAmount") || "Төлсөн дүн"}:{" "}
                                {new Intl.NumberFormat("mn-MN", {
                                  style: "currency",
                                  currency: "MNT",
                                  minimumFractionDigits: 0,
                                }).format(paymentStatus.data.paid_amount)}
                              </p>
                            )}
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Manual Check Button */}
                  {!esimDetails && (
                    <div className="flex justify-center">
                      <Button
                        type="button"
                        size="lg"
                        className="w-full max-w-md"
                        disabled={isCheckingPayment || isSubmitting}
                        onClick={async () => {
                          if (!paymentDetails?.invoice_id) return;

                          setIsSubmitting(true);
                          setError("");

                          try {
                            // The checkStatus function updates paymentStatus state
                            // We'll rely on the useEffect to fetch eSIM details when status becomes PAID
                            await manualCheckStatus();
                          } catch (error) {
                            console.error("Check payment error:", error);
                            setError(
                              t("checkPaymentError") ||
                                "Failed to check payment status. Please try again."
                            );
                          } finally {
                            setIsSubmitting(false);
                          }
                        }}
                      >
                        {isCheckingPayment || isSubmitting ? (
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
                            {t("checkingPayment") || "Checking..."}
                          </span>
                        ) : (
                          t("checkPaymentStatus")
                        )}
                      </Button>
                    </div>
                  )}
                  {/* eSIM Details Display - Show when payment is PAID */}
                  {paymentStatus?.data?.status === "PAID" && (
                    <div className="mt-8 space-y-6">
                      {loadingEsimDetails && (
                        <Card className="border-blue-200 bg-blue-50">
                          <div className="flex items-center justify-center gap-3 py-8">
                            <svg
                              className="animate-spin h-6 w-6 text-blue-600"
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
                            <span className="text-blue-900 font-medium">
                              {t("loadingEsimDetails") ||
                                "Loading eSIM details..."}
                            </span>
                          </div>
                        </Card>
                      )}

                      {esimDetailsError && (
                        <Card className="border-red-200 bg-red-50">
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
                              <p className="text-red-900 font-semibold mb-1">
                                Error
                              </p>
                              <p className="text-red-800 text-sm">
                                {esimDetailsError}
                              </p>
                            </div>
                          </div>
                        </Card>
                      )}

                      {esimDetails && !loadingEsimDetails && (
                        <div className="space-y-6">
                          {/* Header */}
                          <div className="text-center">
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">
                              {t("esimDetails") || "eSIM Details"}
                            </h3>
                            <p className="text-slate-600">
                              {t("esimDetailsDesc") ||
                                "Your eSIM purchase is complete! Here are your activation details:"}
                            </p>
                          </div>

                          {/* QR Code Section */}
                          {esimDetails.qrCodeUrl && (
                            <Card className="border-2 border-blue-200 bg-linear-to-br from-blue-50 to-cyan-50">
                              <div className="text-center mb-4">
                                <h4 className="text-lg font-bold text-slate-900 mb-2">
                                  {t("qrCode") || "QR Code"}
                                </h4>
                                <p className="text-sm text-slate-600">
                                  {t("scanQrCodeDesc") ||
                                    "Scan this QR code with your device to activate your eSIM"}
                                </p>
                              </div>
                              <div className="flex justify-center mb-4">
                                <a
                                  href={esimDetails.qrCodeUrl || "#"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block"
                                >
                                  <div className="bg-white rounded-xl border-2 border-slate-200 p-4 w-full max-w-md hover:border-blue-400 transition-colors cursor-pointer">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={esimDetails.qrCodeUrl}
                                      alt={t("qrCode") || "QR Code"}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                </a>
                              </div>
                              <div className="flex justify-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={async () => {
                                    if (!esimDetails.qrCodeUrl) return;

                                    try {
                                      // Try to fetch and download as blob first
                                      const response = await fetch(
                                        esimDetails.qrCodeUrl,
                                        {
                                          mode: "cors",
                                          cache: "no-cache",
                                        }
                                      );

                                      if (!response.ok) {
                                        throw new Error(
                                          `HTTP error! status: ${response.status}`
                                        );
                                      }

                                      const blob = await response.blob();
                                      const blobUrl =
                                        window.URL.createObjectURL(blob);

                                      const link = document.createElement("a");
                                      link.href = blobUrl;
                                      link.download = `esim-qr-code-${
                                        esimDetails.orderNo || "unknown"
                                      }-${esimDetails.esimTranNo || "unknown"}-${
                                        new Date().toISOString().split("T")[0]
                                      }.png`;
                                      link.style.display = "none";
                                      document.body.appendChild(link);
                                      link.click();
                                      
                                      // Clean up after a short delay
                                      setTimeout(() => {
                                        document.body.removeChild(link);
                                        window.URL.revokeObjectURL(blobUrl);
                                      }, 100);
                                    } catch (error) {
                                      console.error(
                                        "Failed to download QR code:",
                                        error
                                      );
                                      
                                      // Fallback: try direct download
                                      try {
                                        const link = document.createElement("a");
                                        link.href = esimDetails.qrCodeUrl;
                                        link.download = `esim-qr-code-${
                                          esimDetails.orderNo || "unknown"
                                        }-${esimDetails.esimTranNo || "unknown"}-${
                                          new Date().toISOString().split("T")[0]
                                        }.png`;
                                        link.target = "_blank";
                                        link.rel = "noopener noreferrer";
                                        link.style.display = "none";
                                        document.body.appendChild(link);
                                        link.click();
                                        setTimeout(() => {
                                          document.body.removeChild(link);
                                        }, 100);
                                      } catch (fallbackError) {
                                        console.error(
                                          "Fallback download also failed:",
                                          fallbackError
                                        );
                                        // Last resort: open in new tab
                                        window.open(
                                          esimDetails.qrCodeUrl,
                                          "_blank"
                                        );
                                      }
                                    }
                                  }}
                                >
                                  {t("downloadQrCode") || "Download QR Code"}
                                </Button>
                                <Link href="/guide">
                                  <Button variant="outline" size="sm">
                                    {t("viewInstallationGuide") ||
                                      "View Installation Guide"}
                                  </Button>
                                </Link>
                              </div>
                            </Card>
                          )}

                          {/* Activation Details */}
                          <Card>
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="text-lg font-bold text-slate-900">
                                {t("esimActivationDetails") ||
                                  "Activation Details"}
                              </h4>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    // Get Mongolian translations
                                    const translations = {
                                      title:
                                        t("esimActivationDetails") ||
                                        "eSIM идэвхжүүлэх мэдээлэл",
                                      orderInfo: "Захиалгын мэдээлэл",
                                      orderNumber:
                                        t("orderNumber") || "Захиалгын дугаар",
                                      transactionNumber:
                                        t("transactionNumber") ||
                                        "Гүйлгээний дугаар",
                                      transactionId: "Гүйлгээний ID",
                                      activationInfo: "Идэвхжүүлэх мэдээлэл",
                                      iccid: t("iccid") || "ICCID",
                                      activationCode:
                                        t("activationCode") ||
                                        "Идэвхжүүлэх код",
                                      imsi: "IMSI",
                                      msisdn: "MSISDN",
                                      eid: "EID",
                                      statusUsage: "Статус ба ашиглалт",
                                      status: t("esimStatus") || "Статус",
                                      totalData:
                                        t("totalData") || "Нийт өгөгдөл",
                                      duration: t("duration") || "Хугацаа",
                                      activationTime:
                                        t("activationTime") ||
                                        "Идэвхжүүлсэн цаг",
                                      expiryTime:
                                        t("expirationTime") ||
                                        "Хугацаа дуусах цаг",
                                      networkSettings: "Сүлжээний тохиргоо",
                                      apn: t("apn") || "APN",
                                      pin: "PIN",
                                      puk: "PUK",
                                      qrCode: t("qrCode") || "QR код",
                                      qrCodeDesc:
                                        t("scanQrCodeDesc") ||
                                        "Энэ QR кодыг төхөөрөмжөөрөө уншуулж eSIM-ээ идэвхжүүлнэ үү",
                                      additionalInfo: "Нэмэлт мэдээлэл",
                                      qrCodeUrl: "QR кодын URL",
                                      shortUrl: "Богино URL",
                                      smsStatus: "SMS статус",
                                      smdpStatus: "SMDP статус",
                                      activeType: "Идэвхтэй төрөл",
                                      dataType: "Өгөгдлийн төрөл",
                                      important: "ЧУХАЛ:",
                                      warning:
                                        "Энэ мэдээллийг аюулгүй хадгална уу! Идэвхжүүлэх код эсвэл PIN/PUK-ээ хэнд ч бүү хуваалцаарай.",
                                      generated: "Үүсгэсэн:",
                                      notActivated:
                                        t("notActivated") || "Идэвхжүүлээгүй",
                                      na: "Байхгүй",
                                    };

                                    // Fetch QR code image and convert to base64
                                    let qrCodeBase64 = "";
                                    if (esimDetails.qrCodeUrl) {
                                      try {
                                        const qrResponse = await fetch(
                                          esimDetails.qrCodeUrl
                                        );
                                        const qrBlob = await qrResponse.blob();
                                        const qrBase64 =
                                          await new Promise<string>(
                                            (resolve, reject) => {
                                              const reader = new FileReader();
                                              reader.onloadend = () => {
                                                const base64String =
                                                  reader.result as string;
                                                resolve(base64String);
                                              };
                                              reader.onerror = reject;
                                              reader.readAsDataURL(qrBlob);
                                            }
                                          );
                                        qrCodeBase64 = qrBase64;
                                      } catch (error) {
                                        console.error(
                                          "Failed to fetch QR code:",
                                          error
                                        );
                                      }
                                    }

                                    // Get status translation
                                    const getStatusText = (status: string) => {
                                      switch (status) {
                                        case "GOT_RESOURCE":
                                          return (
                                            t("esimStatusGotResource") ||
                                            "Идэвхжүүлэхэд бэлэн"
                                          );
                                        case "IN_USE":
                                          return (
                                            t("esimStatusInUse") || "Идэвхтэй"
                                          );
                                        case "USED_UP":
                                          return (
                                            t("esimStatusUsedUp") ||
                                            "Өгөгдөл дууссан"
                                          );
                                        case "CANCEL":
                                          return (
                                            t("esimStatusCancel") ||
                                            "Цуцлагдсан"
                                          );
                                        default:
                                          return status;
                                      }
                                    };

                                    // Create HTML content with embedded QR code
                                    const htmlContent = `<!DOCTYPE html>
<html lang="mn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${translations.title} - ${
                                      esimDetails.orderNo || translations.na
                                    }</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
      color: #1e293b;
      background-color: #f8fafc;
    }
    .container {
      background: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    h1 {
      color: #0f172a;
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 10px;
      margin-bottom: 30px;
    }
    h2 {
      color: #334155;
      margin-top: 30px;
      margin-bottom: 15px;
      font-size: 1.2em;
      border-left: 4px solid #3b82f6;
      padding-left: 10px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: 10px 20px;
      margin-bottom: 15px;
    }
    .label {
      font-weight: 600;
      color: #64748b;
      font-size: 0.9em;
    }
    .value {
      font-family: 'Courier New', monospace;
      color: #0f172a;
      word-break: break-all;
    }
    .qr-code {
      text-align: center;
      margin: 30px 0;
      padding: 20px;
      background: #f8fafc;
      border-radius: 8px;
    }
    .qr-code img {
      max-width: 500px;
      width: 100%;
      height: auto;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      padding: 15px;
      background: white;
    }
    .warning {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin-top: 30px;
      border-radius: 4px;
      font-weight: 500;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      color: #64748b;
      font-size: 0.9em;
    }
    @media print {
      body {
        background: white;
      }
      .container {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${translations.title}</h1>
    
    <h2>${translations.orderInfo}</h2>
    <div class="info-grid">
      <div class="label">${translations.orderNumber}:</div>
      <div class="value">${esimDetails.orderNo || translations.na}</div>
      <div class="label">${translations.transactionNumber}:</div>
      <div class="value">${esimDetails.esimTranNo || translations.na}</div>
      <div class="label">${translations.transactionId}:</div>
      <div class="value">${esimDetails.transactionId || translations.na}</div>
    </div>

    <h2>${translations.activationInfo}</h2>
    <div class="info-grid">
      <div class="label">${translations.iccid}:</div>
      <div class="value">${esimDetails.iccid || translations.na}</div>
      <div class="label">${translations.activationCode} (AC):</div>
      <div class="value">${esimDetails.ac || translations.na}</div>
      <div class="label">${translations.imsi}:</div>
      <div class="value">${esimDetails.imsi || translations.na}</div>
      <div class="label">${translations.msisdn}:</div>
      <div class="value">${esimDetails.msisdn || translations.na}</div>
      <div class="label">${translations.eid}:</div>
      <div class="value">${esimDetails.eid || translations.na}</div>
    </div>

    <h2>${translations.statusUsage}</h2>
    <div class="info-grid">
      <div class="label">${translations.status}:</div>
      <div class="value">${
        getStatusText(esimDetails.esimStatus) || translations.na
      }</div>
      <div class="label">${translations.totalData}:</div>
      <div class="value">${
        esimDetails.totalVolume
          ? `${(esimDetails.totalVolume / (1024 * 1024 * 1024)).toFixed(2)} GB`
          : translations.na
      }</div>
      <div class="label">${translations.duration}:</div>
      <div class="value">${esimDetails.totalDuration} ${
                                      esimDetails.durationUnit || "өдөр"
                                    }</div>
      <div class="label">${translations.activationTime}:</div>
      <div class="value">${
        esimDetails.activateTime
          ? new Date(esimDetails.activateTime).toLocaleString("mn-MN")
          : translations.notActivated
      }</div>
      <div class="label">${translations.expiryTime}:</div>
      <div class="value">${
        esimDetails.expiredTime
          ? new Date(esimDetails.expiredTime).toLocaleString("mn-MN")
          : translations.na
      }</div>
    </div>

    <h2>${translations.networkSettings}</h2>
    <div class="info-grid">
      <div class="label">${translations.apn}:</div>
      <div class="value">${esimDetails.apn || translations.na}</div>
      <div class="label">${translations.pin}:</div>
      <div class="value">${esimDetails.pin || translations.na}</div>
      <div class="label">${translations.puk}:</div>
      <div class="value">${esimDetails.puk || translations.na}</div>
    </div>

    ${
      qrCodeBase64
        ? `
    <h2>${translations.qrCode}</h2>
    <div class="qr-code">
      <a href="${
        esimDetails.qrCodeUrl || "#"
      }" target="_blank" rel="noopener noreferrer" style="display: inline-block;">
        <img src="${qrCodeBase64}" alt="${
            translations.qrCode
          }" style="cursor: pointer;" />
      </a>
      <p style="margin-top: 15px; color: #64748b;">
        ${translations.qrCodeDesc}
      </p>
    </div>
    `
        : ""
    }

    <h2>${translations.additionalInfo}</h2>
    <div class="info-grid">
      <div class="label">${translations.qrCodeUrl}:</div>
      <div class="value">${
        esimDetails.qrCodeUrl
          ? `<a href="${esimDetails.qrCodeUrl}" target="_blank" rel="noopener noreferrer"><img src="${esimDetails.qrCodeUrl}" alt="${translations.qrCode}" style="max-width: 200px; height: auto; border: 1px solid #e2e8f0; border-radius: 4px; padding: 5px; background: white;" /></a>`
          : translations.na
      }</div>
      <div class="label">${translations.shortUrl}:</div>
      <div class="value">${
        esimDetails.shortUrl
          ? `<a href="${esimDetails.shortUrl}" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: underline; word-break: break-all;">${esimDetails.shortUrl}</a>`
          : translations.na
      }</div>
      <div class="label">${translations.smsStatus}:</div>
      <div class="value">${
        esimDetails.smsStatus !== null ? esimDetails.smsStatus : translations.na
      }</div>
      <div class="label">${translations.smdpStatus}:</div>
      <div class="value">${esimDetails.smdpStatus || translations.na}</div>
      <div class="label">${translations.activeType}:</div>
      <div class="value">${
        esimDetails.activeType !== null
          ? esimDetails.activeType
          : translations.na
      }</div>
      <div class="label">${translations.dataType}:</div>
      <div class="value">${
        esimDetails.dataType !== null ? esimDetails.dataType : translations.na
      }</div>
    </div>
    <div class="footer">
      ${translations.generated} ${new Date().toLocaleString("mn-MN")}
    </div>
  </div>
</body>
</html>`;

                                    const blob = new Blob([htmlContent], {
                                      type: "text/html",
                                    });
                                    const url =
                                      window.URL.createObjectURL(blob);
                                    const link = document.createElement("a");
                                    link.href = url;
                                    link.download = `esim-details-${
                                      esimDetails.orderNo || "unknown"
                                    }-${
                                      new Date().toISOString().split("T")[0]
                                    }.html`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    window.URL.revokeObjectURL(url);
                                  } catch (error) {
                                    console.error(
                                      "Failed to save information:",
                                      error
                                    );
                                    alert(
                                      t("saveError") ||
                                        "Failed to save information. Please try again."
                                    );
                                  }
                                }}
                              >
                                {t("saveAllInformation") ||
                                  "Save All Information"}
                              </Button>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                              {/* Order Number */}
                              {esimDetails.orderNo && (
                                <div className="min-w-0">
                                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">
                                    {t("orderNumber") || "Order Number"}
                                  </label>
                                  <p className="text-slate-900 font-mono text-sm break-all">
                                    {esimDetails.orderNo}
                                  </p>
                                </div>
                              )}

                              {/* Transaction Number */}
                              {esimDetails.esimTranNo && (
                                <div className="min-w-0">
                                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">
                                    {t("transactionNumber") ||
                                      "Transaction Number"}
                                  </label>
                                  <p className="text-slate-900 font-mono text-sm break-all">
                                    {esimDetails.esimTranNo}
                                  </p>
                                </div>
                              )}

                              {/* ICCID */}
                              {esimDetails.iccid && (
                                <div className="min-w-0 w-full">
                                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">
                                    {t("iccid") || "ICCID"}
                                  </label>
                                  <div className="bg-slate-50 rounded-md p-2 border border-slate-200 mb-2">
                                    <p className="text-slate-900 font-mono text-sm break-all">
                                      {esimDetails.iccid}
                                    </p>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        esimDetails.iccid || ""
                                      );
                                      // You could add a toast notification here
                                    }}
                                  >
                                    {t("copyIccid") || "Copy"}
                                  </Button>
                                </div>
                              )}

                              {/* Activation Code */}
                              {esimDetails.ac && (
                                <div className="min-w-0 w-full">
                                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">
                                    {t("activationCode") || "Activation Code"}
                                  </label>
                                  <div className="bg-slate-50 rounded-md p-2 border border-slate-200 mb-2">
                                    <p className="text-slate-900 font-mono text-sm break-all">
                                      {esimDetails.ac}
                                    </p>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        esimDetails.ac || ""
                                      );
                                      // You could add a toast notification here
                                    }}
                                  >
                                    {t("copyActivationCode") || "Copy"}
                                  </Button>
                                </div>
                              )}

                              {/* Status */}
                              <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">
                                  {t("esimStatus") || "Status"}
                                </label>
                                <p className="text-slate-900 font-semibold">
                                  {esimDetails.esimStatus === "GOT_RESOURCE" &&
                                    (t("esimStatusGotResource") ||
                                      "Ready to Activate")}
                                  {esimDetails.esimStatus === "IN_USE" &&
                                    (t("esimStatusInUse") || "Active")}
                                  {esimDetails.esimStatus === "USED_UP" &&
                                    (t("esimStatusUsedUp") || "Data Depleted")}
                                  {esimDetails.esimStatus === "CANCEL" &&
                                    (t("esimStatusCancel") || "Cancelled")}
                                  {![
                                    "GOT_RESOURCE",
                                    "IN_USE",
                                    "USED_UP",
                                    "CANCEL",
                                  ].includes(esimDetails.esimStatus) &&
                                    esimDetails.esimStatus}
                                </p>
                              </div>

                              {/* Total Data */}
                              <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">
                                  {t("totalData") || "Total Data"}
                                </label>
                                <p className="text-slate-900 font-semibold">
                                  {esimDetails.totalVolume
                                    ? `${(
                                        esimDetails.totalVolume /
                                        (1024 * 1024 * 1024)
                                      ).toFixed(2)} GB`
                                    : "N/A"}
                                </p>
                              </div>

                              {/* Duration */}
                              <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">
                                  {t("duration") || "Duration"}
                                </label>
                                <p className="text-slate-900 font-semibold">
                                  {esimDetails.totalDuration}{" "}
                                  {esimDetails.durationUnit || "days"}
                                </p>
                              </div>

                              {/* Activation Time */}
                              <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">
                                  {t("activationTime") || "Activation Time"}
                                </label>
                                <p className="text-slate-900">
                                  {esimDetails.activateTime
                                    ? new Date(
                                        esimDetails.activateTime
                                      ).toLocaleString()
                                    : t("notActivated") || "Not Activated"}
                                </p>
                              </div>

                              {/* Expiration Time */}
                              <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">
                                  {t("expirationTime") || "Expiration Time"}
                                </label>
                                <p className="text-slate-900">
                                  {esimDetails.expiredTime
                                    ? new Date(
                                        esimDetails.expiredTime
                                      ).toLocaleString()
                                    : t("notSet") || "Not Set"}
                                </p>
                              </div>
                            </div>
                          </Card>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Payment Instructions */}
              {!esimDetails && paymentDetails && (
                <div className="mt-8 space-y-6">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                      {t("paymentInvoiceReady")}
                    </span>
                    <h3 className="text-2xl font-bold text-slate-900">
                      {t("scanQrCodeToPay")}
                    </h3>
                    <p className="text-slate-600">{t("scanQrCodeDesc")}</p>
                  </div>

                  <div className="flex justify-center">
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col items-center gap-4 w-full max-w-md">
                      <div className="w-full max-w-xs aspect-square rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                        {qrImageSrc ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={qrImageSrc}
                            alt={t("qrCode")}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-sm text-slate-500">
                            {t("qrCode")}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 text-center">
                        {t("qrCodeExpires")}
                      </p>
                    </div>
                  </div>
                  {/* Bank Apps Section - Full Width Below QR */}
                  {paymentDetails.urls && paymentDetails.urls.length > 0 && (
                    <div className="bg-linear-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200 p-6 space-y-5">
                      <div className="text-center">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">
                          {t("bankAppPaymentsTitle")}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {t("bankAppPaymentsDesc")}
                        </p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {paymentDetails.urls.map((app) => (
                          <a
                            key={`${app.name}-${app.link}`}
                            href={app.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group bg-white rounded-xl border-2 border-slate-200 p-4 hover:border-blue-500 hover:shadow-lg transition-all duration-200 flex items-center gap-3 cursor-pointer"
                          >
                            {app.logo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={app.logo}
                                alt={app.name}
                                className="w-14 h-14 rounded-full object-cover border-2 border-slate-200 group-hover:border-blue-400 transition-colors"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-full bg-linear-to-br from-blue-100 to-cyan-100 flex items-center justify-center text-blue-700 font-bold text-xl border-2 border-blue-200 group-hover:border-blue-400 transition-colors">
                                {app.name.charAt(0)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                {app.name}
                              </p>
                              {app.description && (
                                <p className="text-xs text-slate-500 truncate">
                                  {app.description}
                                </p>
                              )}
                            </div>
                            <svg
                              className="w-5 h-5 text-slate-400 shrink-0 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
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
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
