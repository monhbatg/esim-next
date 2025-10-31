'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCheckout } from '@/contexts/CheckoutContext';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Checkout() {
  const router = useRouter();
  const { user } = useAuth();
  const { selectedPlan, setSelectedPlan, clearCheckout } = useCheckout();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    email: user?.email || '',
    phone: '',
  });

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 2000));

    clearCheckout();
    router.push('/checkout/success');
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
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold mb-5 text-slate-900">Contact Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Email Address"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          required
                        />
                        <Input
                          label="Phone Number"
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+1 (555) 000-0000"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                      
                      <div className="flex gap-3 mb-4">
                        <button
                          type="button"
                          className="flex-1 p-3 border-2 border-green-600 rounded-lg bg-green-50"
                        >
                          <span className="font-medium text-green-600">💳 Credit Card</span>
                        </button>
                        <button
                          type="button"
                          className="flex-1 p-3 border border-gray-300 rounded-lg hover:border-green-600"
                        >
                          <span className="font-medium">PayPal</span>
                        </button>
                        <button
                          type="button"
                          className="flex-1 p-3 border border-gray-300 rounded-lg hover:border-green-600"
                        >
                          <span className="font-medium">Apple Pay</span>
                        </button>
                      </div>

                      <div className="space-y-4">
                        <Input
                          label="Card Number"
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleChange}
                          placeholder="1234 5678 9012 3456"
                          required
                        />
                        <Input
                          label="Cardholder Name"
                          type="text"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleChange}
                          placeholder="John Doe"
                          required
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="Expiry Date"
                            type="text"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleChange}
                            placeholder="MM/YY"
                            required
                          />
                          <Input
                            label="CVV"
                            type="text"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleChange}
                            placeholder="123"
                            required
                          />
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
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing Payment...' : `Pay $${selectedPlan.price}`}
                    </Button>
                  </form>
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
                        <span>${selectedPlan.price}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Processing Fee</span>
                        <span>$0.00</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Taxes</span>
                        <span>${(selectedPlan.price * 0.1).toFixed(2)}</span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between">
                          <span className="font-semibold">Total</span>
                          <span className="text-xl font-bold text-green-600">
                            ${(selectedPlan.price * 1.1).toFixed(2)}
                          </span>
                        </div>
                      </div>
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


