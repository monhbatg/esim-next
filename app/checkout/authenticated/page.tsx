"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCheckout } from "@/contexts/CheckoutContext";

// This page redirects authenticated users to the wallet-based checkout
// For now, we'll redirect to a simple message or implement full wallet checkout later
export default function AuthenticatedCheckout() {
  const router = useRouter();
  const { selectedPlan } = useCheckout();

  useEffect(() => {
    // For now, redirect back to main checkout
    // In the future, this can be a full wallet-based checkout page
    if (!selectedPlan) {
      router.push("/checkout");
    }
  }, [selectedPlan, router]);

  return (
    <ProtectedRoute>
      <div className="py-20 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-slate-600 mb-4">
            Authenticated checkout is being set up. Please use the guest checkout for now.
          </p>
          <button
            onClick={() => router.push("/checkout")}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Go back to checkout options
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}

