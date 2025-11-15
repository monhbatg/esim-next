"use client";

import CongratulationsModal from "@/components/CongratulationsModal";
import ProtectedRoute from "@/components/ProtectedRoute";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useCheckout } from "@/contexts/CheckoutContext";
import { transactionsApi } from "@/lib/transactions-api";
import { Wallet } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function Checkout() {
  const router = useRouter();
  const { user, getWallet } = useAuth();
  const { selectedPlan, setSelectedPlan } = useCheckout();

  const [isProcessing, setIsProcessing] = useState(false);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [error, setError] = useState("");
  const [showCongratulationsModal, setShowCongratulationsModal] =
    useState(false);
  const [orderNo, setOrderNo] = useState<string | null>(null);

  useEffect(() => {
    const pendingPurchase = sessionStorage.getItem("pendingPurchase");
    if (pendingPurchase && !selectedPlan) {
      try {
        const plan = JSON.parse(pendingPurchase);
        setSelectedPlan(plan);
        sessionStorage.removeItem("pendingPurchase");
      } catch (error) {
        console.error("Failed to parse pending purchase:", error);
      }
    }
  }, [selectedPlan, setSelectedPlan]);

  useEffect(() => {
    // Don't redirect if modal is showing, if there's a pending purchase, or if there's a completed purchase
    if (!selectedPlan && !showCongratulationsModal) {
      const pendingPurchase = sessionStorage.getItem("pendingPurchase");
      const lastPurchase = sessionStorage.getItem("lastPurchase");
      // Only redirect if there's no pending purchase and no completed purchase
      if (!pendingPurchase && !lastPurchase) {
        router.push("/marketplace");
      }
    }
  }, [selectedPlan, router, showCongratulationsModal]);

  useEffect(() => {
    const fetchWallet = async () => {
      if (user) {
        try {
          setIsLoadingWallet(true);
          setError("");
          const walletData = await getWallet();
          setWallet(walletData);
        } catch (err) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError("Failed to load wallet");
          }
        } finally {
          setIsLoadingWallet(false);
        }
      }
    };

    fetchWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!wallet) {
      setError("Wallet not loaded. Please try again.");
      return;
    }

    if (!selectedPlan) {
      setError("No plan selected. Please go back and select a plan.");
      return;
    }

    if (!selectedPlan.packageCode) {
      setError(
        "Invalid plan: missing package code. Please select a different plan."
      );
      return;
    }

    const total = selectedPlan.retailPrice;
    if (wallet.balance < total) {
      setError(
        `Insufficient balance. You need ${wallet.currency} ${total.toFixed(
          2
        )} but have ${wallet.currency} ${wallet.balance.toFixed(2)}.`
      );
      return;
    }

    setIsProcessing(true);

    try {
      // Build the order request
      const orderRequest = {
        amount: selectedPlan.price,
        packageInfoList: [
          {
            packageCode: selectedPlan.packageCode,
            count: 1,
            price: selectedPlan.price,
          },
        ],
      };

      // Call the order endpoint using axios via transactions API
      const orderData = await transactionsApi.orderEsim(orderRequest);

      // Store purchase data for success page
      const purchaseData = {
        plan: {
          ...selectedPlan,
        },
        total: selectedPlan.retailPrice,
        subtotal: selectedPlan.retailPrice,
        taxes: 0,
        currency: wallet.currency,
        orderDate: new Date().toISOString(),
        orderNo: orderData.orderNo,
        transactionId: orderData.transactionId,
        balanceBefore: orderData.balanceBefore,
        balanceAfter: orderData.balanceAfter,
      };
      sessionStorage.setItem("lastPurchase", JSON.stringify(purchaseData));

      // Refresh wallet balance
      try {
        const updatedWallet = await getWallet();
        setWallet(updatedWallet);
      } catch (walletError) {
        console.warn("Failed to refresh wallet balance:", walletError);
        // Don't fail the order if wallet refresh fails
      }

      // Store order number for modal
      setOrderNo(orderData.orderNo);

      // Show congratulations modal
      setIsProcessing(false);
      setShowCongratulationsModal(true);

      // Don't clear checkout immediately - let user close modal first
      // clearCheckout() will be called when modal closes
    } catch (err) {
      console.error("Order error:", err);

      // Handle different error types
      let errorMessage = "Payment processing failed. Please try again.";

      if (err instanceof Error) {
        errorMessage = err.message;

        // Handle specific error cases
        if (errorMessage.toLowerCase().includes("balance")) {
          errorMessage = `Insufficient balance. ${errorMessage}`;
        } else if (errorMessage.toLowerCase().includes("duplicate")) {
          errorMessage =
            "This transaction was already processed. Please try again.";
        } else if (
          errorMessage.toLowerCase().includes("authentication") ||
          errorMessage.toLowerCase().includes("session") ||
          errorMessage.toLowerCase().includes("logged in")
        ) {
          errorMessage = "Your session has expired. Please log in again.";
          // Redirect to login after 2 seconds
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        } else if (errorMessage.toLowerCase().includes("not found")) {
          errorMessage = "User or wallet not found. Please contact support.";
        } else if (
          errorMessage.toLowerCase().includes("server") ||
          errorMessage.toLowerCase().includes("500")
        ) {
          errorMessage = "Server error. Please try again in a few moments.";
        }
      }

      setError(errorMessage);
      setIsProcessing(false);
    }
  };

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  if (!selectedPlan) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="py-12 md:py-20 bg-gradient-to-b from-white via-slate-50 to-white min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header with back button */}
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
                <span className="font-medium">Back to Marketplace</span>
              </Link>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-2 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Checkout
              </h1>
              <p className="text-slate-600 text-lg">
                Review your order and complete your purchase
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Order Summary - appears first on mobile, sticky on desktop */}
              <div className="order-1 lg:order-2">
                <Card className="lg:sticky lg:top-24">
                  <h2 className="text-2xl font-bold mb-6 text-slate-900">
                    Order Summary
                  </h2>

                  <div className="space-y-5">
                    {/* Plan Details */}
                    <div className="pb-5 border-b border-slate-200">
                      <div className="flex items-start gap-4">
                        <div className="text-4xl shrink-0">
                          {selectedPlan.flag}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-slate-900 mb-1">
                            {selectedPlan.country}
                          </h3>
                          {selectedPlan.region && (
                            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">
                              {selectedPlan.region}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-medium">
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
                              {selectedPlan.data}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg font-medium">
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
                              {selectedPlan.duration}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Plan Features */}
                    {selectedPlan.features &&
                      selectedPlan.features.length > 0 && (
                        <div className="pb-5 border-b border-slate-200">
                          <p className="text-sm font-semibold text-slate-900 mb-3">
                            What&apos;s included:
                          </p>
                          <ul className="space-y-2">
                            {selectedPlan.features.map((feature, index) => (
                              <li
                                key={index}
                                className="text-sm text-slate-600 flex items-start gap-2"
                              >
                                <svg
                                  className="w-5 h-5 text-green-500 shrink-0 mt-0.5"
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
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {/* Total Amount */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border-2 border-emerald-200">
                      <div className="text-center">
                        <p className="text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                          Total Amount
                        </p>
                        <p className="text-3xl md:text-4xl font-extrabold text-emerald-700">
                          {formatCurrency(
                            selectedPlan.retailPrice,
                            wallet?.currency || "USD"
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Wallet Balance Info */}
                    {wallet && (
                      <div className="pt-3 border-t border-slate-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-slate-600">
                            Your Balance
                          </span>
                          <span
                            className={`text-sm font-semibold ${
                              wallet.balance >= selectedPlan.price
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {formatCurrency(wallet.balance, wallet.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">
                            After Payment
                          </span>
                          <span
                            className={`text-sm font-semibold ${
                              wallet.balance - selectedPlan.retailPrice >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {formatCurrency(
                              wallet.balance - selectedPlan.retailPrice,
                              wallet.currency
                            )}
                          </span>
                        </div>
                        {wallet.balance < selectedPlan.price && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-xs text-red-800 font-medium mb-2">
                              Insufficient balance
                            </p>
                            <Link
                              href="/profile"
                              className="text-xs text-red-700 hover:text-red-900 font-semibold underline"
                            >
                              Add funds to your wallet →
                            </Link>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Security Badge */}
                    <div className="pt-4 border-t border-slate-200">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className="shrink-0">
                          <svg
                            className="w-6 h-6 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">
                            Secure Checkout
                          </p>
                          <p className="text-xs text-slate-600">
                            256-bit SSL encryption
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Payment Information - appears second on mobile, first on desktop */}
              <div className="order-2 lg:order-1 lg:col-span-2">
                <Card>
                  <h2 className="text-2xl md:text-3xl font-bold mb-6 text-slate-900">
                    Payment Information
                  </h2>

                  {error && (
                    <div className="mb-6 p-5 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-lg shadow-md animate-fade-in">
                      <div className="flex items-start gap-3">
                        <div className="shrink-0">
                          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
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
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-red-900 text-base font-bold mb-1">
                            Order Failed
                          </p>
                          <p className="text-red-800 text-sm leading-relaxed">
                            {error}
                          </p>
                          {error.includes("session") ||
                          error.includes("logged in") ? (
                            <p className="text-red-700 text-xs mt-2">
                              You will be redirected to the login page
                              shortly...
                            </p>
                          ) : error.includes("balance") ? (
                            <Link
                              href="/profile"
                              className="inline-flex items-center gap-1 text-sm font-semibold text-red-700 hover:text-red-900 mt-2 underline"
                            >
                              Add funds to your wallet
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
                            </Link>
                          ) : null}
                        </div>
                        <button
                          onClick={() => setError("")}
                          className="shrink-0 text-red-700 hover:text-red-900 transition-colors"
                          aria-label="Dismiss error"
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
                    </div>
                  )}

                  {isLoadingWallet ? (
                    <div className="space-y-6">
                      <div>
                        <Skeleton className="h-6 w-48 mb-4" />
                        <Skeleton className="h-32 w-full rounded-xl mb-4" />
                        <Skeleton className="h-24 w-full rounded-lg" />
                      </div>
                      <div>
                        <Skeleton className="h-6 w-40 mb-4" />
                        <Skeleton className="h-20 w-full rounded-lg" />
                      </div>
                      <Skeleton className="h-12 w-full rounded-xl" />
                    </div>
                  ) : wallet ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Payment Method Section */}
                      <div>
                        <h3 className="text-xl font-bold mb-4 text-slate-900">
                          Payment Method
                        </h3>

                        {/* Wallet Balance Display */}
                        <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-6 text-white mb-6 shadow-xl overflow-hidden">
                          {/* Decorative elements */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-semibold opacity-90">
                                Available Balance
                              </p>
                              {wallet.balance < selectedPlan.price && (
                                <span className="text-xs bg-red-500/30 px-2 py-1 rounded-full font-medium">
                                  Insufficient
                                </span>
                              )}
                            </div>
                            <p className="text-4xl md:text-5xl font-extrabold mb-1 drop-shadow-lg">
                              {formatCurrency(wallet.balance, wallet.currency)}
                            </p>
                            <div className="flex items-center gap-2 text-sm opacity-90">
                              <span>{wallet.currency}</span>
                              <span>•</span>
                              <span>Ready to use</span>
                            </div>
                          </div>
                        </div>

                        {/* Payment Method Card */}
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 border-2 border-slate-200 shadow-sm">
                          <div className="flex items-start gap-4">
                            <div className="shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
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
                                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-lg text-slate-900 mb-1">
                                Pay from Wallet
                              </h4>
                              <p className="text-sm text-slate-600 mb-2">
                                Your payment will be automatically deducted from
                                your wallet balance.
                              </p>
                              {wallet.balance < selectedPlan.retailPrice && (
                                <Link
                                  href="/profile"
                                  className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                                >
                                  Add funds to wallet
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
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <svg
                            className="w-5 h-5 text-blue-600 mt-0.5 shrink-0"
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
                            <p className="text-sm font-semibold text-blue-900 mb-1">
                              Order Confirmation
                            </p>
                            <p className="text-sm text-blue-700">
                              We&apos;ll send your eSIM QR code and activation
                              instructions to{" "}
                              <span className="font-medium">{user?.email}</span>
                              {user?.phoneNumber && (
                                <>
                                  {" "}
                                  and{" "}
                                  <span className="font-medium">
                                    {user.phoneNumber}
                                  </span>
                                </>
                              )}
                              .
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Estimated Activation Time */}
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <svg
                            className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0"
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
                          <div>
                            <p className="text-sm font-semibold text-emerald-900 mb-1">
                              Instant Activation
                            </p>
                            <p className="text-sm text-emerald-700">
                              Your eSIM will be activated immediately after
                              payment. You&apos;ll receive your QR code via
                              email within minutes.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Terms and Conditions */}
                      <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <input
                          type="checkbox"
                          id="terms"
                          className="mt-1 h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded cursor-pointer"
                          required
                        />
                        <label
                          htmlFor="terms"
                          className="text-sm text-slate-700 cursor-pointer"
                        >
                          I agree to the{" "}
                          <a
                            href="#"
                            className="text-emerald-600 hover:text-emerald-700 font-semibold underline"
                          >
                            Terms of Service
                          </a>{" "}
                          and{" "}
                          <a
                            href="#"
                            className="text-emerald-600 hover:text-emerald-700 font-semibold underline"
                          >
                            Privacy Policy
                          </a>
                        </label>
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        className="w-full shadow-xl"
                        size="lg"
                        disabled={
                          isProcessing ||
                          (wallet && wallet.balance < selectedPlan.retailPrice)
                        }
                      >
                        {isProcessing ? (
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
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Processing Payment...
                          </span>
                        ) : (
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
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                            </svg>
                            Pay{" "}
                            {formatCurrency(
                              selectedPlan.retailPrice,
                              wallet.currency
                            )}
                          </span>
                        )}
                      </Button>
                    </form>
                  ) : (
                    <div className="text-center py-12">
                      <div className="mb-4">
                        <svg
                          className="w-16 h-16 text-red-500 mx-auto"
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
                      </div>
                      <p className="text-red-600 font-semibold mb-2">
                        Unable to load wallet
                      </p>
                      <p className="text-sm text-slate-600 mb-6">
                        Please try again or contact support if the problem
                        persists.
                      </p>
                      <div className="flex gap-3 justify-center">
                        <Button
                          onClick={() => window.location.reload()}
                          variant="outline"
                        >
                          Retry
                        </Button>
                        <Link href="/profile">
                          <Button variant="primary">Go to Profile</Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CongratulationsModal
        isOpen={showCongratulationsModal}
        onClose={() => {
          setShowCongratulationsModal(false);
          setOrderNo(null);
          // Navigate to homepage after closing modal
          router.push("/");
        }}
        plan={selectedPlan}
        orderNo={orderNo || undefined}
      />
    </ProtectedRoute>
  );
}
