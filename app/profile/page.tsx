"use client";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import ChangePasswordModal from "@/components/ChangePasswordModal";
import WalletCard from "@/components/WalletCard";

export default function Profile() {
  const { user, fetchUserProfile, isLoading } = useAuth();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [orderNo, setOrderNo] = useState<string | null>(null);

  // Check for success message from checkout
  useEffect(() => {
    const orderSuccess = sessionStorage.getItem("orderSuccess");
    if (orderSuccess) {
      try {
        const successData = JSON.parse(orderSuccess);
        setSuccessMessage(successData.message);
        setOrderNo(successData.orderNo);
        // Clear the success message after displaying
        sessionStorage.removeItem("orderSuccess");
        // Auto-hide after 10 seconds
        const timer = setTimeout(() => {
          setSuccessMessage(null);
          setOrderNo(null);
        }, 10000);
        return () => clearTimeout(timer);
      } catch (error) {
        console.error("Failed to parse order success data:", error);
      }
    }
  }, []);

  // Refresh profile data when component mounts
  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading || !user) {
    return (
      <ProtectedRoute>
        <div className="py-20 md:py-28 bg-linear-to-b from-white via-slate-50 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading profile...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const activeEsims = [
    {
      id: 1,
      country: "🇺🇸 United States",
      data: "10GB",
      used: "3.2GB",
      expiry: "2024-12-15",
      status: "active",
    },
    {
      id: 2,
      country: "🇬🇧 United Kingdom",
      data: "15GB",
      used: "8.5GB",
      expiry: "2024-12-20",
      status: "active",
    },
  ];

  const recentOrders = [
    {
      id: 1,
      country: "🇯🇵 Japan",
      date: "2024-10-15",
      price: "$34.99",
      status: "completed",
    },
    {
      id: 2,
      country: "🇫🇷 France",
      date: "2024-09-20",
      price: "$22.99",
      status: "completed",
    },
  ];

  return (
    <ProtectedRoute>
      <div className="py-20 md:py-28 bg-linear-to-b from-white via-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Success Message Banner */}
            {successMessage && (
              <div className="mb-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg shadow-lg animate-fade-in">
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-green-900 mb-1">
                      Order Successful!
                    </h3>
                    <p className="text-green-800 mb-2">{successMessage}</p>
                    {orderNo && (
                      <p className="text-sm text-green-700 font-mono">
                        Order Number: {orderNo}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSuccessMessage(null);
                      setOrderNo(null);
                    }}
                    className="shrink-0 text-green-700 hover:text-green-900 transition-colors"
                    aria-label="Close"
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

            <h1 className="text-5xl md:text-6xl font-extrabold mb-12 bg-linear-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              My Profile
            </h1>

            {/* Wallet Section */}
            <div className="mb-10">
              <WalletCard />
            </div>

            {/* Preferences Section */}
            {user.preferences && (
              <Card className="mb-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-slate-900">
                    Preferences
                  </h2>
                  <Button variant="outline" size="sm">
                    Edit Preferences
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Preferred Language
                    </p>
                    <p className="text-lg font-medium">
                      {user.preferences.preferredLanguage.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Timezone</p>
                    <p className="text-lg font-medium">
                      {user.preferences.timezone}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Notifications</p>
                    <div className="space-y-1">
                      <p className="text-sm">
                        Email:{" "}
                        {user.preferences.emailNotifications
                          ? "✓ Enabled"
                          : "✗ Disabled"}
                      </p>
                      <p className="text-sm">
                        SMS:{" "}
                        {user.preferences.smsNotifications
                          ? "✓ Enabled"
                          : "✗ Disabled"}
                      </p>
                      <p className="text-sm">
                        Push:{" "}
                        {user.preferences.pushNotifications
                          ? "✓ Enabled"
                          : "✗ Disabled"}
                      </p>
                    </div>
                  </div>
                  {user.preferences.favoriteCountries &&
                    user.preferences.favoriteCountries.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">
                          Favorite Countries
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {user.preferences.favoriteCountries.map(
                            (country, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                              >
                                {country}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </Card>
            )}

            {/* Profile Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
              <Card className="lg:col-span-2">
                <h2 className="text-3xl font-bold mb-6 text-slate-900">
                  Account Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b">
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="text-lg font-medium">{user.name}</p>
                      {user.firstName && user.lastName && (
                        <p className="text-xs text-gray-500 mt-1">
                          {user.firstName} {user.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pb-4 border-b">
                    <div>
                      <p className="text-sm text-gray-600">Email Address</p>
                      <p className="text-lg font-medium">{user.email}</p>
                    </div>
                  </div>
                  {user.phoneNumber && (
                    <div className="flex items-center justify-between pb-4 border-b">
                      <div>
                        <p className="text-sm text-gray-600">Phone Number</p>
                        <p className="text-lg font-medium">
                          {user.phoneNumber}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Password</p>
                      <p className="text-lg font-medium">••••••••</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsChangePasswordOpen(true)}
                    >
                      Change
                    </Button>
                  </div>
                </div>
              </Card>

              <div className="space-y-6">
                <Card hover className="group">
                  <p className="text-sm text-slate-600 mb-2 font-semibold">
                    Member Since
                  </p>
                  <p className="text-3xl font-extrabold text-slate-900">
                    {user.memberSince}
                  </p>
                  {user.createdAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </Card>
                {user.lastLoginAt && (
                  <Card hover className="group">
                    <p className="text-sm text-slate-600 mb-2 font-semibold">
                      Last Login
                    </p>
                    <p className="text-2xl font-extrabold text-slate-900">
                      {new Date(user.lastLoginAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(user.lastLoginAt).toLocaleTimeString()}
                    </p>
                  </Card>
                )}
                <Card hover className="group">
                  <p className="text-sm text-slate-600 mb-2 font-semibold">
                    Total eSIMs Purchased
                  </p>
                  <p className="text-3xl font-extrabold text-slate-900">
                    {user.totalEsims}
                  </p>
                </Card>
                <Card hover className="group">
                  <p className="text-sm text-slate-600 mb-2 font-semibold">
                    Active eSIMs
                  </p>
                  <p className="text-3xl font-extrabold bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {user.activeEsims}
                  </p>
                </Card>
              </div>
            </div>

            {/* Active eSIMs */}
            <Card className="mb-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-slate-900">
                  Active eSIMs
                </h2>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
              {activeEsims.length > 0 ? (
                <div className="space-y-4">
                  {activeEsims.map((esim) => (
                    <div
                      key={esim.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">
                          {esim.country}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {esim.used} / {esim.data} used
                        </p>
                      </div>
                      <div className="text-right mr-4">
                        <p className="text-sm text-gray-600">Expires</p>
                        <p className="font-medium">{esim.expiry}</p>
                      </div>
                      <Button size="sm">Manage</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No active eSIMs</p>
              )}
            </Card>

            {/* Recent Orders */}
            <Card>
              <h2 className="text-3xl font-bold mb-8 text-slate-900">
                Recent Orders
              </h2>
              {recentOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 text-sm font-semibold">
                          Country
                        </th>
                        <th className="text-left py-3 px-2 text-sm font-semibold">
                          Date
                        </th>
                        <th className="text-left py-3 px-2 text-sm font-semibold">
                          Price
                        </th>
                        <th className="text-left py-3 px-2 text-sm font-semibold">
                          Status
                        </th>
                        <th className="text-left py-3 px-2 text-sm font-semibold">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="border-b">
                          <td className="py-4 px-2">{order.country}</td>
                          <td className="py-4 px-2 text-gray-600">
                            {order.date}
                          </td>
                          <td className="py-4 px-2 font-semibold">
                            {order.price}
                          </td>
                          <td className="py-4 px-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {order.status}
                            </span>
                          </td>
                          <td className="py-4 px-2">
                            <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600">No orders yet</p>
              )}
            </Card>
          </div>
        </div>
        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
        />
      </div>
    </ProtectedRoute>
  );
}
