"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { guestApi, GuestSimCard } from "@/lib/guest-api";
import { EsimPackage } from "@/types";
import { useTranslations } from "@/contexts/LocaleContext";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useInvoiceStatus } from "@/lib/hooks/useInvoiceStatus";
import { useTopupInvoiceStatus } from "@/lib/hooks/useTopupInvoiceStatus";

type Step = 1 | 2 | 3 | 4 | 5;

type PaymentAppLink = {
  name: string;
  description?: string;
  logo?: string;
  link: string;
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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
  }).format(value);

export default function GuestTopUp() {
  const t = useTranslations();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [identifier, setIdentifier] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");

  const [simCards, setSimCards] = useState<GuestSimCard[]>([]);
  const [suggestPackages, setSuggestPackages] = useState<any[]>([]);
  const [baseEsim, setBaseEsim] = useState<any | null>(null);
  const [selectedSim, setSelectedSim] = useState<GuestSimCard | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<EsimPackage | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaymentCheckPending, setIsPaymentCheckPending] = useState(false);
  const [paymentSuccessInfo, setPaymentSuccessInfo] = useState<{ orderNo?: string; orderId?: string } | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<{
    invoice_id: string;
    qr_image?: string;
    qr_link?: string;
    qr_text?: string;
    qPay_shortUrl?: string;
    urls?: Array<PaymentAppLink>;
  } | null>(null);


  const [popup, setPopup] = useState<{
  show: boolean;
  message: string;
  type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const showPopup = (message: string, type: "success" | "error") => {
  setPopup({ show: true, message, type });

  setTimeout(() => {
    setPopup({ show: false, message: "", type: "success" });
  }, 2500);
  };
  

  // ---------------- SEARCH ----------------
  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim()) {
      setError("Identifier required");
      return;
    }

    setIsSearching(true);

    try {
      const res = await guestApi.searchTopupCards(identifier.trim());

      console.log("FULL RESPONSE:", res);

      // IMPORTANT: backend structure
      const esimList = res?.obj?.esimList ?? [];
      const packages = res?.obj?.suggestPackage ?? [];

      // base ESIM info can be returned in different shapes depending on backend
      const base =
        esimList?.[0]?.object ??
        esimList?.[0] ??
        null;

      setSimCards(esimList);
      setSuggestPackages(packages);
      setBaseEsim(base);

      if (esimList.length === 0 && packages.length === 0) {
        setError("No data found");
        return;
      }

      // If SIM exists → select plan step
      if (esimList.length > 0) {
        setCurrentStep(2);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setIsSearching(false);
    }
  };
  const [loadingEsimDetails, setLoadingEsimDetails] = useState(false);
  const [esimDetailsError, setEsimDetailsError] = useState("");
  const [esimDetails, setEsimDetails] = useState<EsimDetails | null>(null);

  // Fetch eSIM details when payment is paid
    const fetchEsimDetails = useCallback(async (orderNo: string) => {
      if (hasFetchedEsimRef.current) return;
  
      setLoadingEsimDetails(true);
      setEsimDetailsError("");
      hasFetchedEsimRef.current = true;
  
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const url = `${apiUrl}/api/v1/open/esim/queryTopup`;
        const response = await fetch(url, {
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
            "Хайлт хийхэд алдаа гарлаа"
          );
        }
  
        if (result.success && result.obj?.esimList[0]) {
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

  // ---------------- VALIDATION ----------------
  const validatePhone = (value: string): boolean => {
    const cleaned = value.replace(/\s/g, "").replace(/^\+/, "");
    return /^\d{8}$/.test(cleaned);
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

    const cleaned = trimmedPhone.replace(/\s/g, "").replace(/^\+/, "");

    if (cleaned.length !== 8) {
      setPhoneError(
        t("phoneInvalid") || "Phone number must be exactly 8 digits"
      );
      return;
    }

    if (!validatePhone(trimmedPhone)) {
      setPhoneError(
        t("phoneInvalid") || "Phone number must be exactly 8 digits"
      );
      return;
    }

    setCurrentStep(4);
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

    // Move to Summary step
    setCurrentStep(5);
  };

  // -------- SELECT PLAN --------
  const handleSelectPlan = (pkg: any) => {
    setSelectedPlan({
      packageCode: pkg.packageCode,
      slug: pkg.slug || "",
      name: pkg.name,
      price: Number(pkg.buyPrice || pkg.price || 0),
      currencyCode: pkg.currencyCode || "MNT",
      volume: Number(pkg.volume),
      smsStatus: pkg.smsStatus || 0,
      dataType: pkg.dataType || 0,
      unusedValidTime: pkg.unusedValidTime || 0,
      duration: pkg.duration,
      durationUnit: pkg.durationUnit,
      location: pkg.location || "",
      description: pkg.description || pkg.name,
      buyPrice: String(pkg.buyPrice || 0),
      activeType: pkg.activeType || 0,
      favorite: false,
      retailPrice: Number(pkg.retailPrice || pkg.buyPrice || 0),
      speed: pkg.speed,
    });

    setCurrentStep(3);
  };

  // -------- STEP HANDLER FOR BACK BUTTON --------
  const handleBack = () => {
    if (currentStep === 5) {
      setCurrentStep(4);
    } else if (currentStep === 4) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  // -------- TOPUP --------
  const handleTopUp = async () => {
    if (!selectedPlan) return;

    setIsSubmitting(true);

    try {
      await new Promise((r) => setTimeout(r, 1200));
      alert("Top up success (mock)");
    } catch {
      setError("Top up failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e?: FormEvent | any) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    setError("");
    setPaymentDetails(null);

    if (!selectedPlan) {
      setError("No plan selected");
      return;
    }

    const packageCode = (selectedPlan as any).packageCode || (selectedPlan as any).package_code || null;
    if (!packageCode) {
      setError("Missing package code");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        phoneNumber: phone.trim(),
        email: email.trim(),
        amount: Number(selectedPlan.buyPrice),
        // amount:  1,  // For test
        packageCode,
        description: selectedPlan.name || "Top-up",
        iccId: baseEsim?.iccid || baseEsim?.icc || null,
      };
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const url = `${apiUrl}/api/customer/transactions/purchaseTopup`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const raw = await res.json();
      const data = raw?.data ?? raw;

      if (!res.ok) {
        throw new Error(data?.error || raw?.message || "Payment failed");
      }

      if (!data?.invoice_id ||
        !data?.qr_image ||
        !(data?.qr_link || data?.qPay_shortUrl)) {
        throw new Error("Payment details missing");
      }

      const normalizedUrls: PaymentAppLink[] | undefined = Array.isArray(
        data?.urls
      )
        ? (data.urls as Array<Partial<PaymentAppLink> | null>)
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
        invoice_id: data.invoice_id,
        qr_image: data.qr_image,
        qr_link: data.qr_link || data.qPay_shortUrl || "",
        qr_text: data.qr_text,
        qPay_shortUrl: data.qPay_shortUrl,
        urls: normalizedUrls,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------- STEP LABELS --------
  const getStepLabel = (): string => {
    switch (currentStep) {
      case 1:
        return "Search eSIM";
      case 2:
        return "Select Plan";
      case 3:
        return "Phone Number";
      case 4:
        return "Email Address";
      case 5:
        return "Summary";
      default:
        return "";
    }
  };
  const hasRedirectedRef = useRef(false);
  const hasFetchedEsimRef = useRef(false);

  const {
      loading: isCheckingPayment,
      error: paymentCheckError,
      checkStatus: manualCheckStatus,
      status: paymentStatus,
    } = useTopupInvoiceStatus(paymentDetails?.invoice_id || null, {
      enabled: false, // Disabled - no automatic polling allowed
      onSuccess: (result) => {
        if (!hasRedirectedRef.current && result.data?.status === "PAID") {
          hasRedirectedRef.current = true;
          const orderNo =
            result.data.orderNo ||
            result.data.orderId ||
            paymentDetails?.invoice_id;
          if (orderNo) {
            fetchEsimDetails(orderNo);
          }
          showPopup("Амжилттай", "success");
        }
      },
      onError: (error) => {
        setError(error.message);
      },
    });

    // Display payment check errors from the hook
      useEffect(() => {
        if (paymentCheckError && !error) {
          setError(paymentCheckError);
        }
      }, [paymentCheckError, error]);

  // -------- UI --------
  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        {/* HEADER */}
        <div className="mb-8">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              className="mb-4"
              onClick={handleBack}
            >
              {t("back")}
            </Button>
          )}

          <h1 className="text-3xl font-bold mb-2">
            {t("topUpSimCard")}
          </h1>

          {/* STEP INDICATOR */}
          <div className="flex items-center gap-2 text-sm text-slate-600 mt-4">
            <span>Step {currentStep} of 5:</span>
            <span className="font-semibold text-slate-900">{getStepLabel()}</span>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <Card className="mb-6 bg-red-50 border-red-200 text-red-600 p-4">
            {error}
          </Card>
        )}

        {/* POPUP */}
        {popup.show && (
          <div
            role="status"
            aria-live="polite"
            className={`mb-6 rounded-2xl border p-4 text-sm font-semibold ${
              popup.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-600"
            }`}
          >
            {popup.message}
          </div>
        )}

        {/* -------- STEP 1: SEARCH ICCID -------- */}
        {currentStep === 1 && (
          <Card>
            <form onSubmit={handleSearch} className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-2">{t("topUpSimCardDesc")}</h2>
                <p className="text-sm text-slate-600 mb-4">
                  {t("searchEsimForTopUp")}
                </p>
              </div>

              <Input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={t("enterIccid")}
              />

              <Button type="submit" disabled={isSearching} className="w-full">
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </form>
          </Card>
        )}

        {/* -------- STEP 2: SELECT PLAN -------- */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* BASE ESIM INFO */}
            {baseEsim && (
              <Card className="overflow-hidden border border-slate-200">
                <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500" />

                <div className="p-7">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">eSIM Info</h2>
                    <p className="text-sm text-slate-500">
                      Installed eSIM details and package information
                    </p>
                  </div>

                  <div className="grid lg:grid gap-6">
                    <div className="space-y-4">
                      <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-slate-500">Status</span>

                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                            {baseEsim.esimStatus === 'USED_EXPIRED'
                              ? 'Хугацаа дууссан'
                              : baseEsim.esimStatus === 'CANCEL'
                              ? 'Буцаасан'
                              : baseEsim.esimStatus === 'GOT_RESOURCE' || baseEsim.esimStatus === 'IN_USED'
                              ? 'Идэвхтэй'
                              : baseEsim.esimStatus ?? baseEsim.status ?? "-"}
                          </span>
                        </div>

                        <div className="grid gap-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-500">ICCID</span>
                            <span className="font-medium text-slate-900">
                              {baseEsim.iccid ?? baseEsim.icc ?? "-"}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-slate-500">EID</span>
                            <span className="font-medium text-slate-900 break-all text-right">
                              {baseEsim.eid ?? "-"}
                            </span>
                          </div>

                          {baseEsim.expiredTime && (
                            <div className="flex justify-between">
                              <span className="text-slate-500">Expires</span>
                              <span className="text-slate-900 font-medium">
                                {new Date(baseEsim.expiredTime).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* PACKAGES */}
            <Card>
              <h2 className="font-bold text-2xl text-slate-900 mb-3">
                {t("avialableTopupPackages")}
              </h2>

              {suggestPackages.length > 0 && (
                <p className="text-sm text-slate-500 mb-6">
                  Select a package to continue
                </p>
              )}

              {suggestPackages.length === 0 ? (
                <p className="text-slate-500">
                  {t("noAvialableTopupPackages")}
                </p>
              ) : (
                <div className="grid md:grid-cols-3 gap-6">
                  {suggestPackages.map((pkg) => (
                    <Card
                      key={pkg.packageCode}
                      hover
                      className="flex flex-col h-full bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-200 rounded-xl overflow-hidden"
                    >
                      <div className="h-1 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />

                      <div className="p-7 flex flex-col flex-grow">
                        {/* Price */}
                        <div className="text-center mb-7">
                          <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide font-medium">
                            {t("price")}
                          </p>

                          <div className="flex justify-center">
                            <span className="text-3xl font-bold text-slate-900 tracking-tight">
                              {formatCurrency(Number(pkg.buyPrice))}₮
                            </span>
                          </div>
                        </div>

                        {/* Data + Duration */}
                        <div className="flex gap-4 mb-7">
                          <div className="flex-1 text-center py-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors">
                            <p className="text-xs text-slate-500 mb-2 font-medium">
                              {t("data")}
                            </p>
                            <p className="text-xl font-bold text-slate-900">
                              {(Number(pkg.volume) / 1024 / 1024 / 1024)} GB
                            </p>
                          </div>

                          <div className="flex-1 text-center py-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors">
                            <p className="text-xs text-slate-500 mb-2 font-medium">
                              {t("validFor")}
                            </p>
                            <p className="text-xl font-bold text-slate-900">
                              {pkg.duration} {pkg.durationUnit}
                            </p>
                          </div>
                        </div>

                        {/* Features */}
                        <div className="mb-7 flex-grow">
                          <p className="text-sm font-semibold text-slate-800 mb-4">
                            {t("whatsIncluded")}
                          </p>

                          <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                              <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                                <svg
                                  className="w-3 h-3 text-slate-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                              <span className="text-sm text-slate-700">
                                {pkg.description || pkg.name}
                              </span>
                            </li>

                            <li className="flex items-start gap-3">
                              <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                                <svg
                                  className="w-3 h-3 text-slate-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                              <span className="text-sm text-slate-700">
                                {pkg.speed || "3G / 4G / 5G"}
                              </span>
                            </li>
                          </ul>
                        </div>

                        {/* Button */}
                        <Button
                          className="w-full py-3.5 text-base font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all shadow-sm hover:shadow-md mt-auto"
                          onClick={() => handleSelectPlan(pkg)}
                        >
                          {t("purchasePlan")}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* -------- STEP 3: PHONE -------- */}
        {currentStep === 3 && (
          <Card>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePhoneNext();
              }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold mb-2">{t("enterPhoneNumber")}</h2>
                <p className="text-sm text-slate-600">
                  {t("phoneInvalid")}
                </p>
              </div>

              <div>
                <Input
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setPhoneError("");
                  }}
                  placeholder={t("phonePlaceholder")}
                  error={phoneError}
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {t("next")}
              </Button>
            </form>
          </Card>
        )}

        {/* -------- STEP 4: EMAIL -------- */}
        {currentStep === 4 && (
          <Card>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEmailNext();
              }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold mb-2">{t("enterEmail")}</h2>
                <p className="text-sm text-slate-600">
                  {t("enterEmailTopup")}
                </p>
              </div>

              <div>
                <Input
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                  }}
                  placeholder={t("emailPlaceholder")}
                  error={emailError}
                  type="email"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {t("next")}
              </Button>
            </form>
          </Card>
        )}

        {/* -------- STEP 5: REVIEW/SUMMARY -------- */}
        {currentStep === 5 && selectedPlan && (
          <Card>
            <h2 className="text-2xl font-bold mb-8">Ерөнхий мэдээлэл</h2>

            <div className="space-y-6 mb-8">
              {/* SIM INFO */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-4">Исим мэдээлэл</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">ICCID:</span>
                    <span className="font-medium text-slate-900">
                      {baseEsim?.iccid ?? "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Төлөв:</span>
                    <span className="font-medium text-emerald-700">Active</span>
                  </div>
                </div>
              </div>

              {/* PLAN DETAILS */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-4">Багцны мэдээлэл</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Багц:</span>
                    <span className="font-medium text-slate-900">
                      {selectedPlan.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Дата:</span>
                    <span className="font-medium text-slate-900">
                      {Number(selectedPlan.volume) / 1024 / 1024 / 1024} GB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Хүчинтэй хугацаа:</span>
                    <span className="font-medium text-slate-900">
                      {selectedPlan.duration} {selectedPlan.durationUnit}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-slate-300">
                    <span className="text-slate-600 font-semibold">Price:</span>
                    <span className="font-bold text-slate-900 text-lg">
                      {formatCurrency(Number(selectedPlan.buyPrice))}₮
                    </span>
                  </div>
                </div>
              </div>

              {/* CONTACT INFO */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-4">Холбоо барих мэдээлэл</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Утас:</span>
                    <span className="font-medium text-slate-900">{phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Имэйл:</span>
                    <span className="font-medium text-slate-900">{email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION AREA: Confirm & Pay form or payment details */}
            <div className="pt-6 border-t border-slate-200">
              {!paymentDetails ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <input
                      type="checkbox"
                      id="terms"
                      className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
                      required
                    />
                    <label htmlFor="terms" className="text-sm text-slate-700 cursor-pointer">
                      I agree to the <a href="#" className="text-blue-600 underline">terms</a> and <a href="#" className="text-blue-600 underline">privacy policy</a>.
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" className="flex-1" onClick={handleBack}>
                      {t("back")}
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isSubmitting}>
                      {isSubmitting ? "Processing..." : "Төлбөр төлөх"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-5">
                  <div className="bg-blue-50 border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">Та доорх QR кодыг сканнерлаад төлбөрөө төлөөд Төлбөрийн төлөв шалгах товчийг дарна уу.</p>
                  </div>

                  <div className="flex gap-3 items-center">
                    {!(paymentStatus?.data?.status === 'PAID') ? (
                      <Button
                        className="flex-1"
                        disabled={isPaymentCheckPending || isCheckingPayment}
                        onClick={async () => {
                          if (isPaymentCheckPending || isCheckingPayment) return;

                          setIsPaymentCheckPending(true);

                          try {
                            const result = await manualCheckStatus();
                            if (result?.success && result.data?.status === 'PAID') {
                              showPopup('Амжилттай', 'success');
                            } else {
                              showPopup('Амжилтгүй: Төлбөр төлөгдөөгүй байна', 'error');
                            }
                          } finally {
                            setIsPaymentCheckPending(false);
                          }
                        }}
                      >
                        {isPaymentCheckPending ? 'Түр хүлээнэ үү...' : 'Төлбөрийн төлөв шалгах'}
                      </Button>
                    ) : (
                      <div className="flex-1 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center text-emerald-700 font-semibold">
                        Амжилттай
                      </div>
                    )}
                      {/**reset button go step 1 */}
                    <Button variant="outline" className="flex-1" onClick={() => {
                      /**set iccID null */
                      setIdentifier("");
                      setPhone("");
                      setEmail("");
                      setPaymentDetails(null);
                      setCurrentStep(1);
                    }}>
                      Дахин эхлэх
                    </Button>
                  </div>

                  {(paymentStatus?.data?.status !== 'PAID') && (
                    <>
                      {/* QR Code Section */}
                      {paymentDetails.qr_image && (
                        <div className="flex justify-center">
                          <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col items-center gap-4 w-full max-w-md">
                            <div className="w-full max-w-xs aspect-square rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={paymentDetails.qr_image.startsWith("data:") ? paymentDetails.qr_image : `data:image/png;base64,${paymentDetails.qr_image}`}
                                alt="QR"
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <p className="text-sm text-slate-500 text-center">{t("qrCodeExpires")}</p>
                          </div>
                        </div>
                      )}

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
                    </>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
