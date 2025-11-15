"use client";

import { useState, FormEvent, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Wallet, AddBalanceResponse } from "@/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function WalletCard() {
  const { user, getWallet, addBalance } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingBalance, setIsAddingBalance] = useState(false);
  const [showAddBalanceForm, setShowAddBalanceForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchWallet = async () => {
    try {
      setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWallet();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleAddBalance = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }

    if (!user?.id) {
      setError("User ID not found");
      return;
    }

    setIsAddingBalance(true);

    try {
      const result: AddBalanceResponse = await addBalance(user.id, amountNum);
      setWallet({
        userId: result.userId,
        balance: result.balance,
        currency: result.currency,
      });
      setSuccessMessage(
        `Successfully added ${result.currency} ${result.amountAdded.toFixed(
          2
        )}! Your new balance is ${result.currency} ${result.balance.toFixed(
          2
        )}.`
      );
      setAmount("");
      setShowAddBalanceForm(false);

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to add balance");
      }
    } finally {
      setIsAddingBalance(false);
    }
  };

  const formatCurrency = (value: number, currency: string) => {
    // MNT (Mongolian Tugrik) typically doesn't use decimal places
    if (currency === "MNT" || currency === "mnt") {
      return new Intl.NumberFormat("mn-MN", {
        style: "currency",
        currency: "MNT",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading wallet...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (error && !wallet) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchWallet} variant="outline" size="sm">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Wallet</h2>
          <p className="text-sm text-slate-600 mt-1">
            Manage your account balance
          </p>
        </div>
        {wallet && !showAddBalanceForm && (
          <Button
            onClick={() => {
              setShowAddBalanceForm(true);
              setError("");
              setSuccessMessage("");
            }}
            className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 shadow-lg hover:shadow-xl"
          >
            <span className="flex items-center gap-2">
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Funds
            </span>
          </Button>
        )}
      </div>

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm font-medium">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm font-medium">{error}</p>
        </div>
      )}

      {wallet && (
        <>
          <div className="mb-6">
            <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-8 text-white shadow-2xl overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
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
                          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold opacity-90">
                      Current Balance
                    </p>
                  </div>
                </div>
                <p className="text-5xl font-extrabold mb-2 drop-shadow-lg">
                  {formatCurrency(wallet.balance, wallet.currency)}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-sm opacity-90 font-medium">
                    {wallet.currency}
                  </p>
                  <span className="text-xs opacity-75">•</span>
                  <p className="text-sm opacity-90">Available for purchases</p>
                </div>
              </div>
            </div>
          </div>

          {showAddBalanceForm && (
            <div className="mb-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-slate-200 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">
                    Add Funds
                  </h3>
                  <p className="text-sm text-slate-600">
                    Top up your wallet balance instantly
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddBalanceForm(false);
                    setAmount("");
                    setError("");
                  }}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                  disabled={isAddingBalance}
                >
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
                </button>
              </div>

              <form onSubmit={handleAddBalance} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    Quick Amount
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {[10000, 20000, 50000, 100000].map((quickAmount) => (
                      <button
                        key={quickAmount}
                        type="button"
                        onClick={() => {
                          setAmount(quickAmount.toString());
                          setError("");
                        }}
                        disabled={isAddingBalance}
                        className={`p-3 rounded-xl font-semibold transition-all duration-200 ${
                          amount === quickAmount.toString()
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg scale-105"
                            : "bg-white text-slate-700 border-2 border-slate-200 hover:border-emerald-400 hover:shadow-md"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {new Intl.NumberFormat("mn-MN").format(quickAmount)} ₮
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Input
                    label="Custom Amount"
                    type="number"
                    step="1"
                    min="1"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setError("");
                    }}
                    placeholder="0"
                    required
                    disabled={isAddingBalance}
                    className="text-lg"
                  />
                  {amount &&
                    !isNaN(parseFloat(amount)) &&
                    parseFloat(amount) > 0 && (
                      <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-emerald-700 font-medium">
                            New Balance:
                          </span>
                          <span className="text-emerald-900 font-bold text-lg">
                            {formatCurrency(
                              wallet.balance + parseFloat(amount),
                              wallet.currency
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddBalanceForm(false);
                      setAmount("");
                      setError("");
                    }}
                    disabled={isAddingBalance}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      isAddingBalance || !amount || parseFloat(amount) <= 0
                    }
                    className="flex-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600"
                  >
                    {isAddingBalance ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4 text-white"
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
                        Processing...
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
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Add{" "}
                        {amount
                          ? formatCurrency(parseFloat(amount), wallet.currency)
                          : "Funds"}
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
