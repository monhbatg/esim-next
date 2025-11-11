'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCheckout } from '@/contexts/CheckoutContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Wallet } from '@/types';

export default function Checkout() {
  const router = useRouter();
  const { user, getWallet } = useAuth();
  const { selectedPlan, setSelectedPlan, clearCheckout } = useCheckout();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const pendingPurchase = sessionStorage.getItem('pendingPurchase');
    if (pendingPurchase && !selectedPlan) {
      try {
        const plan = JSON.parse(pendingPurchase);
        setSelectedPlan(plan);
        sessionStorage.removeItem('pendingPurchase');
      } catch (error) {
        console.error('Failed to parse pending purchase:', error);
      }
    }
  }, [selectedPlan, setSelectedPlan]);

  useEffect(() => {
    if (!selectedPlan) {
      const pendingPurchase = sessionStorage.getItem('pendingPurchase');
      if (!pendingPurchase) {
        router.push('/marketplace');
      }
    }
  }, [selectedPlan, router]);

  useEffect(() => {
    const fetchWallet = async () => {
      if (user) {
        try {
          setIsLoadingWallet(true);
          setError('');
          const walletData = await getWallet();
          setWallet(walletData);
        } catch (err) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('Failed to load wallet');
          }
        } finally {
          setIsLoadingWallet(false);
        }
      }
    };

    fetchWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const calculateTotal = () => {
    if (!selectedPlan) return 0;
    const subtotal = selectedPlan.price;
    const taxes = subtotal * 0.1;
    return subtotal + taxes;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!wallet) {
      setError('Wallet not loaded. Please try again.');
      return;
    }


    const total = calculateTotal();
    if (wallet.balance < total) {
      setError(`Insufficient balance. You need ${wallet.currency} ${total.toFixed(2)} but have ${wallet.currency} ${wallet.balance.toFixed(2)}.`);
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // TODO: Call actual payment API endpoint here
      // await processPayment(selectedPlan.id, total);

      clearCheckout();
      router.push('/checkout/success');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Payment processing failed. Please try again.');
      }
      setIsProcessing(false);
    }
  };

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  if (!selectedPlan) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="py-20 md:py-28 bg-linear-to-b from-white via-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-12 bg-linear-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Checkout
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card>
                  <h2 className="text-3xl font-bold mb-8 text-slate-900">Payment Information</h2>
                  
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 text-sm font-medium">{error}</p>
                    </div>
                  )}

                  {isLoadingWallet ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-3"></div>
                        <p className="text-sm text-gray-600">Loading wallet...</p>
                      </div>
                    </div>
                  ) : wallet ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <h3 className="text-xl font-bold mb-5 text-slate-900">Payment Method</h3>
                        
                        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-xl p-6 text-white mb-6">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-semibold opacity-90">Wallet Balance</p>
                          </div>
                          <p className="text-4xl font-extrabold mb-1">
                            {formatCurrency(wallet.balance, wallet.currency)}
                          </p>
                          <p className="text-sm opacity-90">{wallet.currency}</p>
                        </div>

                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-600 text-xl">💳</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900 mb-1">Pay from Wallet</h4>
                              <p className="text-sm text-slate-600">
                                Your payment will be automatically deducted from your wallet balance.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-blue-900 mb-1">Contact Information</p>
                            <p className="text-sm text-blue-700">
                              We'll use your account email ({user?.email}){user?.phoneNumber && ` and phone (${user.phoneNumber})`} for order confirmation.
                            </p>
                          </div>
                        </div>
                      </div>

                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="terms"
                        className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        required
                      />
                      <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                        I agree to the{' '}
                        <a href="#" className="text-green-600 hover:text-green-700">
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-green-600 hover:text-green-700">
                          Privacy Policy
                        </a>
                      </label>
                    </div>

                      <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        disabled={isProcessing || (wallet && wallet.balance < calculateTotal())}
                      >
                        {isProcessing ? 'Processing Payment...' : `Pay ${formatCurrency(calculateTotal(), wallet.currency)}`}
                      </Button>
                    </form>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-red-600 mb-4">Unable to load wallet. Please try again.</p>
                      <Button onClick={() => window.location.reload()} variant="outline">
                        Retry
                      </Button>
                    </div>
                  )}
                </Card>
              </div>

              <div>
                <Card className="sticky top-24">
                  <h2 className="text-2xl font-bold mb-6 text-slate-900">Order Summary</h2>
                  
                  <div className="space-y-4">
                    <div className="pb-4 border-b">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{selectedPlan.flag}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{selectedPlan.country}</h3>
                          <p className="text-sm text-gray-600">
                            {selectedPlan.data} • {selectedPlan.duration}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pb-4 border-b">
                      <p className="text-sm font-medium mb-2">Plan includes:</p>
                      <ul className="space-y-1">
                        {selectedPlan.features.map((feature, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center">
                            <span className="text-green-500 mr-2">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span>{formatCurrency(selectedPlan.price, wallet?.currency || 'USD')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Processing Fee</span>
                        <span>{formatCurrency(0, wallet?.currency || 'USD')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Taxes</span>
                        <span>{formatCurrency(selectedPlan.price * 0.1, wallet?.currency || 'USD')}</span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between">
                          <span className="font-semibold">Total</span>
                          <span className="text-xl font-bold text-green-600">
                            {formatCurrency(calculateTotal(), wallet?.currency || 'USD')}
                          </span>
                        </div>
                      </div>
                      {wallet && (
                        <div className="pt-2 border-t">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Balance After Payment</span>
                            <span className={`text-sm font-semibold ${
                              wallet.balance - calculateTotal() >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {formatCurrency(wallet.balance - calculateTotal(), wallet.currency)}
                            </span>
                          </div>
                          {wallet.balance < calculateTotal() && (
                            <p className="text-xs text-red-600 mt-1">
                              Insufficient balance
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>🔒</span>
                        <span>Secure checkout with 256-bit encryption</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}



