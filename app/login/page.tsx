"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath =
        sessionStorage.getItem("redirectAfterLogin") || "/profile";
      sessionStorage.removeItem("redirectAfterLogin");
      router.push(redirectPath);
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(email, password);

      const pendingPurchase = sessionStorage.getItem("pendingPurchase");
      if (pendingPurchase) {
        sessionStorage.removeItem("pendingPurchase");
      }

      const redirectPath =
        sessionStorage.getItem("redirectAfterLogin") || "/profile";
      sessionStorage.removeItem("redirectAfterLogin");
      router.push(redirectPath);
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-20 px-4 bg-linear-to-br from-white via-green-50/30 to-emerald-50/30">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold mb-3 bg-linear-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-lg text-slate-600">
            Sign in to access your eSIM account
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">
                  {error}
                </p>
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">
                  Remember me
                </span>
              </label>
              <Link
                href="#"
                className="text-sm text-green-600 hover:text-green-700"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 256 262"
                  aria-hidden="true"
                >
                  <path fill="#4285F4" d="M255.9 133.5c0-10.7-.9-18.5-2.8-26.6H130v48.2h71.9c-1.4 12-9 30.2-25.9 42.4l-.2 1.5 37.6 29 2.6.3c23.5-21.7 39.9-53.6 39.9-95.8z"/>
                  <path fill="#34A853" d="M130 261.1c36.1 0 66.5-11.8 88.7-32.1l-42.3-32.7c-11.3 7.9-26.2 13.4-46.4 13.4-35.5 0-65.7-21.7-76.5-52.1l-1.6.1-41.4 32-.5 1.4C31.6 230 76.8 261.1 130 261.1z"/>
                  <path fill="#FBBC05" d="M53.5 157.6c-2.9-8.1-4.6-16.8-4.6-25.6 0-8.9 1.7-17.5 4.5-25.6l-.1-1.7-42-32.4-1.4.7C2.7 90.5 0 105.2 0 120.9c0 15.6 2.7 30.4 7.7 44.6l45.8-7.9z"/>
                  <path fill="#EB4335" d="M130 50.5c25.1 0 41.9 10.9 51.5 20l37.6-36.6C196.3 12.7 166.1 0 130 0 76.8 0 31.6 31 7.7 76.4l46 36.4c10.8-30.4 41-62.3 76.3-62.3z"/>
                </svg>
                <span className="ml-2">Google</span>
              </button>
              <button
                type="button"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 0C4.477 0 0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.879V12.89h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.989C16.343 19.128 20 14.991 20 10c0-5.523-4.477-10-10-10z" />
                </svg>
                <span className="ml-2">Facebook</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-green-600 hover:text-green-700"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </Card>

        <p className="mt-8 text-center text-xs text-gray-600">
          By signing in, you agree to our{" "}
          <Link href="#" className="text-green-600 hover:text-green-700">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="#" className="text-green-600 hover:text-green-700">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}


