'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { EsimPlan } from '@/types';

interface CheckoutContextType {
  selectedPlan: EsimPlan | null;
  setSelectedPlan: (plan: EsimPlan | null) => void;
  clearCheckout: () => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [selectedPlan, setSelectedPlan] = useState<EsimPlan | null>(null);

  const clearCheckout = () => {
    setSelectedPlan(null);
  };

  return (
    <CheckoutContext.Provider
      value={{
        selectedPlan,
        setSelectedPlan,
        clearCheckout,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
}

