"use client";

import { PlanWithPackage } from "@/types";
import { createContext, ReactNode, useContext, useState } from "react";

interface CheckoutContextType {
  selectedPlan: PlanWithPackage | null;
  setSelectedPlan: (plan: PlanWithPackage | null) => void;
  clearCheckout: () => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(
  undefined
);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [selectedPlan, setSelectedPlan] = useState<PlanWithPackage | null>(
    null
  );

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
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
}
