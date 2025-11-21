"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { MarketplacePlansSkeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useLocale, useTranslations } from "@/contexts/LocaleContext";
import { marketplaceApi } from "@/lib/marketplace-api";
import { formatCurrency } from "@/lib/utils";
import {
  EsimPackage,
  EsimPlan,
  MarketplaceCategory,
  MarketplaceCountry,
} from "@/types";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function codeToFlagEmoji(isoCode: string | null): string {
  if (!isoCode) return "🌐";
  const code = isoCode.trim().toUpperCase();
  if (code.length !== 2) return "🌐";
  const A = 0x1f1e6; // Regional Indicator Symbol Letter A
  return String.fromCodePoint(
    A + (code.codePointAt(0)! - 65),
    A + (code.codePointAt(1)! - 65)
  );
}

function getCountryCodeFromImage(image: string | null): string | null {
  if (!image) return null;
  const match = image.match(/\/([a-z]{2})\.png$/i);
  return match ? match[1].toUpperCase() : null;
}

function getCountryCode(country: MarketplaceCountry): string | null {
  return country.country_code || getCountryCodeFromImage(country.image);
}

function formatDataVolume(volumeBytes: number | undefined | null): string {
  // Handle null, undefined, or invalid values
  if (!volumeBytes || volumeBytes === 0 || isNaN(volumeBytes)) {
    return "Unlimited";
  }

  // Handle unlimited or very large values
  if (volumeBytes >= 1000000000000) {
    return "Unlimited";
  }

  // Convert bytes to MB (1 MB = 1024² bytes = 1,048,576 bytes)
  const volumeMB = volumeBytes / (1024 * 1024);

  // Convert to GB if >= 1024 MB (1 GB = 1024 MB)
  if (volumeMB >= 1024) {
    const gb = volumeMB / 1024;
    // Show as whole number if it's a round number, otherwise show 1 decimal
    if (gb % 1 === 0) {
      return `${gb}GB`;
    } else {
      // Round to 1 decimal place
      return `${gb.toFixed(1)}GB`;
    }
  }

  // Show MB for values less than 1GB
  // Round to whole number if it's close to a whole number, otherwise show 1 decimal
  if (volumeMB % 1 < 0.1 || volumeMB % 1 > 0.9) {
    return `${Math.round(volumeMB)}MB`;
  } else {
    return `${volumeMB.toFixed(1)}MB`;
  }
}

function formatDuration(duration: number, unit: string): string {
  return `${duration} ${unit}`;
}

// Helper function to extract numeric data value in GB from formatted string
function extractDataValue(data: string): number {
  if (data === "Unlimited" || !data) {
    return Infinity; // Treat unlimited as very large number
  }
  const match = data.match(/([\d.]+)(GB|MB)/i);
  if (match) {
    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    // Convert MB to GB (1 GB = 1024 MB)
    return unit === "GB" ? value : value / 1024;
  }
  return 0;
}

// Helper function to extract duration in days
function extractDurationDays(duration: number, unit: string): number {
  const normalizedUnit = unit.toLowerCase();
  if (normalizedUnit.includes("day")) {
    return duration;
  } else if (normalizedUnit.includes("week")) {
    return duration * 7;
  } else if (normalizedUnit.includes("month")) {
    return duration * 30;
  } else if (normalizedUnit.includes("year")) {
    return duration * 365;
  }
  return duration; // Default to days
}

function convertPackageToPlan(
  pkg: EsimPackage,
  countryName: string,
  regionName: string,
  countryCode: string | null
): EsimPlan {
  try {
    const features: string[] = [];

    // Use speed from package if available
    if (pkg.speed) {
      features.push(`${pkg.speed} Speed`);
    }

    // Use description from package if available
    if (pkg.description) {
      // Parse description into features
      const descFeatures = pkg.description
        .split(/[.,;]/)
        .filter((f) => f.trim().length > 0);
      if (descFeatures.length > 0) {
        features.push(...descFeatures.slice(0, 3).map((f) => f.trim()));
      }
    }

    // Add data information based on package data
    if (pkg.dataType === 1) {
      features.push("Unlimited Data");
    } else if (pkg.volume) {
      features.push(`${formatDataVolume(pkg.volume)} Data`);
    }

    // Add duration info
    if (pkg.duration && pkg.durationUnit) {
      features.push(`Valid for ${pkg.duration} ${pkg.durationUnit}`);
    }

    // Add network operators if available
    if (pkg.locationNetworkList && pkg.locationNetworkList.length > 0) {
      const operators = pkg.locationNetworkList[0]?.operatorList;
      if (operators && operators.length > 0) {
        const operatorNames = operators.map((op) => op.operatorName).join(", ");
        if (operatorNames) {
          features.push(`Operators: ${operatorNames}`);
        }
      }
    }

    return {
      id: parseInt(pkg.packageCode.replace(/\D/g, "")) || Math.random(),
      country: countryName,
      region: regionName,
      flag: codeToFlagEmoji(countryCode),
      data: formatDataVolume(pkg.volume),
      duration: formatDuration(pkg.duration || 0, pkg.durationUnit || "days"),
      price: pkg.price || 0,
      retailPrice: pkg.retailPrice || pkg.price || 0,
      features: features.length > 0 ? features : ["eSIM Package"],
      countriesCovered: countryCode ? [countryCode] : [],
      // Store package data for checkout
      packageCode: pkg.packageCode,
      slug: pkg.slug,
    };
  } catch (error) {
    console.error("Error converting package to plan:", error, pkg);
    // Return a basic plan even if conversion fails
    return {
      id: Math.random(),
      country: countryName,
      region: regionName,
      flag: codeToFlagEmoji(countryCode),
      data: formatDataVolume(pkg.volume),
      duration: formatDuration(pkg.duration || 0, pkg.durationUnit || "days"),
      price: pkg.price || 0,
      retailPrice: pkg.retailPrice || pkg.price || 0,
      features: ["eSIM Package"],
      countriesCovered: countryCode ? [countryCode] : [],
      packageCode: pkg.packageCode,
      slug: pkg.slug,
    };
  }
}

export interface PlanWithPackage {
  plan: EsimPlan;
  package: EsimPackage;
}

export default function CountryPlansPage() {
  const router = useRouter();
  const params = useParams();
  const countryCode = params?.countryCode as string;
  const { isAuthenticated } = useAuth();
  const { setSelectedPlan } = useCheckout();
  const locale = useLocale();
  const t = useTranslations();

  const [packages, setPackages] = useState<EsimPackage[]>([]);
  const [marketplaceData, setMarketplaceData] = useState<MarketplaceCategory[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 10000000, // Default to high value for MNT
  });
  const [dataRange, setDataRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 1000, // in GB
  });
  const [durationRange, setDurationRange] = useState<{
    min: number;
    max: number;
  }>({
    min: 0,
    max: 365, // in days
  });
  const [sortBy, setSortBy] = useState<"price" | "data" | "duration">("price");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Calculate max values from packages to set reasonable defaults
  useEffect(() => {
    if (packages.length > 0) {
      // Calculate price range
      const prices = packages.map((p) => p.price || 0).filter((p) => p > 0);
      if (prices.length > 0) {
        const maxPrice = Math.max(...prices);
        const minPrice = Math.min(...prices);
        const newMax = Math.max(10000000, Math.ceil(maxPrice * 1.1)); // Higher default for MNT
        setPriceRange((prev) => ({
          min: Math.min(prev.min, minPrice),
          max: newMax,
        }));
      }

      // Calculate data range (convert bytes to GB)
      const dataValues = packages
        .map((p) => {
          if (!p.volume || p.volume === 0) return Infinity;
          const volumeMB = p.volume / (1024 * 1024);
          return volumeMB / 1024; // Convert to GB
        })
        .filter((d) => d !== Infinity && !isNaN(d));
      if (dataValues.length > 0) {
        const maxData = Math.max(...dataValues);
        setDataRange({
          min: 0,
          max: Math.ceil(maxData * 1.1), // Round up with 10% buffer
        });
      }

      // Calculate duration range
      const durations = packages
        .map((p) =>
          extractDurationDays(p.duration || 0, p.durationUnit || "days")
        )
        .filter((d) => d > 0);
      if (durations.length > 0) {
        const maxDuration = Math.max(...durations);
        setDurationRange({
          min: 0,
          max: Math.ceil(maxDuration * 1.1), // Round up with 10% buffer
        });
      }
    }
  }, [packages]);

  // Fetch marketplace data for country info and packages
  useEffect(() => {
    const fetchData = async () => {
      if (!countryCode) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch packages and marketplace data in parallel
        const [packagesData, marketplaceDataResult] = await Promise.all([
          marketplaceApi.getPackages(countryCode.toUpperCase()),
          marketplaceApi.getMarketplace(),
        ]);

        console.log(
          "Fetched packages:",
          packagesData?.length || 0,
          packagesData
        );
        console.log(
          "Fetched marketplace data:",
          marketplaceDataResult?.length || 0
        );

        // getPackages should return the array directly
        if (Array.isArray(packagesData)) {
          setPackages(packagesData);
        } else {
          console.error("Packages data is not an array:", packagesData);
          setPackages([]);
        }
        setMarketplaceData(marketplaceDataResult);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load plans");
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [countryCode]);

  // Get country info from marketplace data (optional - can derive from packages)
  const countryInfo = useMemo(() => {
    if (!countryCode) return null;

    for (const category of marketplaceData) {
      for (const country of category.countries) {
        const code = getCountryCode(country);
        if (code && code.toLowerCase() === countryCode.toLowerCase()) {
          return country;
        }
      }
    }
    return null;
  }, [marketplaceData, countryCode]);

  // Convert packages to plans
  const countryPlans = useMemo((): PlanWithPackage[] => {
    if (packages.length === 0) {
      return [];
    }

    console.log("Converting packages to plans:", packages.length, "packages");

    // Use countryInfo if available, otherwise derive from packages
    let countryName: string;
    let regionName: string;
    let countryCodeValue: string | null = countryCode?.toUpperCase() || null;

    if (countryInfo) {
      countryCodeValue = getCountryCode(countryInfo);
      countryName = locale === "mn" ? countryInfo.name_mn : countryInfo.name_en;
      regionName =
        locale === "mn"
          ? countryInfo.region.name_mn
          : countryInfo.region.name_en;
    } else {
      // Fallback: use package location data
      const firstPackage = packages[0];
      countryName = firstPackage.location || countryCode || "Unknown";
      regionName = "Unknown";
      console.log("Using fallback country name:", countryName);
    }

    const plans = packages
      .map((pkg) => {
        try {
          const plan = convertPackageToPlan(
            pkg,
            countryName,
            regionName,
            countryCodeValue
          );
          return {
            plan,
            package: pkg,
          };
        } catch (error) {
          console.error("Error converting package to plan:", error, pkg);
          return null;
        }
      })
      .filter((item): item is PlanWithPackage => item !== null);

    console.log("Converted plans:", plans.length, "out of", packages.length);
    if (plans.length === 0 && packages.length > 0) {
      console.error(
        "CRITICAL: No plans converted! Sample package:",
        packages[0]
      );
    }
    return plans;
  }, [packages, countryInfo, locale, countryCode]);

  // Filter and sort plans
  const filteredAndSortedPlans = useMemo(() => {
    let filtered = countryPlans;

    // Filter by price range
    filtered = filtered.filter((item) => {
      const price = item.plan.price;
      return price >= priceRange.min && price <= priceRange.max;
    });

    // Filter by data size
    filtered = filtered.filter((item) => {
      const dataValue = extractDataValue(item.plan.data);
      // If unlimited (Infinity), always include it when "all" is selected (max >= 1000)
      if (dataValue === Infinity) {
        return dataRange.max >= 1000; // Include unlimited when "All Data" is selected
      }
      // For regular data values, check if they fall within the range
      return dataValue >= dataRange.min && dataValue <= dataRange.max;
    });

    // Filter by duration
    filtered = filtered.filter((item) => {
      const durationDays = extractDurationDays(
        item.package.duration || 0,
        item.package.durationUnit || "days"
      );
      return (
        durationDays >= durationRange.min && durationDays <= durationRange.max
      );
    });

    // Sort plans
    filtered.sort((a, b) => {
      let aValue: number;
      let bValue: number;

      if (sortBy === "price") {
        aValue = a.plan.price;
        bValue = b.plan.price;
      } else if (sortBy === "data") {
        // Extract numeric value from data (e.g., "1GB" -> 1, "512MB" -> 0.5)
        const aMatch = a.plan.data.match(/([\d.]+)(GB|MB)/i);
        const bMatch = b.plan.data.match(/([\d.]+)(GB|MB)/i);
        aValue = aMatch
          ? parseFloat(aMatch[1]) *
            (aMatch[2].toUpperCase() === "GB" ? 1 : 0.001)
          : 0;
        bValue = bMatch
          ? parseFloat(bMatch[1]) *
            (bMatch[2].toUpperCase() === "GB" ? 1 : 0.001)
          : 0;
      } else {
        // Extract numeric value from duration (e.g., "7 days" -> 7)
        aValue = a.package.duration || 0;
        bValue = b.package.duration || 0;
      }

      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [countryPlans, priceRange, dataRange, durationRange, sortBy, sortOrder]);

  const handlePurchase = (plan: PlanWithPackage) => {
    // Always go to checkout page where user can choose login or guest
    setSelectedPlan(plan);
    sessionStorage.setItem("pendingPurchase", JSON.stringify(plan));
    router.push("/checkout");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30">
        <div className="container mx-auto px-4 py-8">
          <MarketplacePlansSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto p-8 text-center">
          <div className="text-7xl mb-6">⚠️</div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">
            {t("error")}
          </h2>
          <p className="text-lg text-slate-700 mb-8">{error}</p>
          <Link href="/marketplace">
            <Button className="w-full">
              {locale === "mn"
                ? "Буцах"
                : locale === "zh"
                ? "返回"
                : "Back to Marketplace"}
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Get display values - use countryInfo if available, otherwise derive from packages
  const countryName = countryInfo
    ? locale === "mn"
      ? countryInfo.name_mn
      : countryInfo.name_en
    : packages.length > 0
    ? packages[0].location
    : countryCode || "Unknown";
  const regionName = countryInfo
    ? locale === "mn"
      ? countryInfo.region.name_mn
      : countryInfo.region.name_en
    : "Unknown";
  const countryCodeEmoji = codeToFlagEmoji(countryCode?.toUpperCase() || null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-3">
          <nav
            className="flex items-center gap-2 text-base md:text-lg"
            aria-label="Breadcrumb"
          >
            <Link
              href="/marketplace"
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              {locale === "mn"
                ? "Маркетплейс"
                : locale === "zh"
                ? "市场"
                : "Marketplace"}
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-700 font-semibold">{countryName}</span>
          </nav>
        </div>
      </div>

      {/* Compact Sticky Filters */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b-2 border-emerald-200/50 shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap items-center gap-3">
              {/* Back Button */}
              <Link href="/marketplace">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 px-4 py-2 text-sm"
                >
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
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  {locale === "mn"
                    ? "Буцах"
                    : locale === "zh"
                    ? "返回"
                    : "Back"}
                </Button>
              </Link>

              {/* Price Range Filter */}
              <div className="relative min-w-[160px] md:min-w-[180px]">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
                  <svg
                    className="w-4 h-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <select
                  value={
                    priceRange.max >= 10000000
                      ? "all"
                      : priceRange.max.toString()
                  }
                  onChange={(e) =>
                    setPriceRange({
                      ...priceRange,
                      max:
                        e.target.value === "all"
                          ? 10000000
                          : Number(e.target.value),
                    })
                  }
                  className="w-full pl-9 pr-8 py-2.5 text-sm rounded-lg border-2 border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300/50 focus:border-emerald-500 transition-all shadow-sm hover:shadow-md cursor-pointer appearance-none"
                >
                  <option value="all">
                    {locale === "mn"
                      ? "Бүх үнэ"
                      : locale === "zh"
                      ? "所有价格"
                      : "All Prices"}
                  </option>
                  <option value="50000">
                    {priceRange.min.toLocaleString()} - 50,000 ₮
                  </option>
                  <option value="100000">
                    {priceRange.min.toLocaleString()} - 100,000 ₮
                  </option>
                  <option value="200000">
                    {priceRange.min.toLocaleString()} - 200,000 ₮
                  </option>
                  <option value="500000">
                    {priceRange.min.toLocaleString()} - 500,000 ₮
                  </option>
                  <option value="1000000">
                    {priceRange.min.toLocaleString()} - 1,000,000 ₮
                  </option>
                  <option value="2000000">
                    {priceRange.min.toLocaleString()} - 2,000,000 ₮
                  </option>
                  <option value="10000000">0 - Unlimited</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
                  <svg
                    className="w-4 h-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* Data Size Filter */}
              <div className="relative min-w-[160px] md:min-w-[180px]">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
                  <svg
                    className="w-4 h-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                    />
                  </svg>
                </div>
                <select
                  value={
                    dataRange.max >= 1000 ? "all" : dataRange.max.toString()
                  }
                  onChange={(e) =>
                    setDataRange({
                      ...dataRange,
                      max:
                        e.target.value === "all"
                          ? 1000
                          : Number(e.target.value),
                    })
                  }
                  className="w-full pl-9 pr-8 py-2.5 text-sm rounded-lg border-2 border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300/50 focus:border-emerald-500 transition-all shadow-sm hover:shadow-md cursor-pointer appearance-none"
                >
                  <option value="all">
                    {locale === "mn"
                      ? "Бүх өгөгдөл"
                      : locale === "zh"
                      ? "所有数据"
                      : "All Data"}
                  </option>
                  <option value="0.5">0 - 0.5 GB</option>
                  <option value="1">0 - 1 GB</option>
                  <option value="3">0 - 3 GB</option>
                  <option value="5">0 - 5 GB</option>
                  <option value="10">0 - 10 GB</option>
                  <option value="20">0 - 20 GB</option>
                  <option value="50">0 - 50 GB</option>
                  <option value="100">0 - 100 GB</option>
                  <option value="500">0 - 500 GB</option>
                  <option value="1000">0 - Unlimited</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
                  <svg
                    className="w-4 h-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* Duration Filter */}
              <div className="relative min-w-[160px] md:min-w-[180px]">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
                  <svg
                    className="w-4 h-4 text-slate-400"
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
                </div>
                <select
                  value={
                    durationRange.max >= 365
                      ? "all"
                      : durationRange.max.toString()
                  }
                  onChange={(e) =>
                    setDurationRange({
                      ...durationRange,
                      max:
                        e.target.value === "all" ? 365 : Number(e.target.value),
                    })
                  }
                  className="w-full pl-9 pr-8 py-2.5 text-sm rounded-lg border-2 border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300/50 focus:border-emerald-500 transition-all shadow-sm hover:shadow-md cursor-pointer appearance-none"
                >
                  <option value="all">
                    {locale === "mn"
                      ? "Бүх хугацаа"
                      : locale === "zh"
                      ? "所有时长"
                      : "All Duration"}
                  </option>
                  <option value="7">0 - 7 days</option>
                  <option value="14">0 - 14 days</option>
                  <option value="30">0 - 30 days</option>
                  <option value="60">0 - 60 days</option>
                  <option value="90">0 - 90 days</option>
                  <option value="180">0 - 180 days</option>
                  <option value="365">0 - 365 days</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
                  <svg
                    className="w-4 h-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* Sort By */}
              <div className="relative min-w-[140px] md:min-w-[160px]">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
                  <svg
                    className="w-4 h-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
                    />
                  </svg>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "price" | "data" | "duration")
                  }
                  className="w-full pl-9 pr-8 py-2.5 text-sm rounded-lg border-2 border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300/50 focus:border-emerald-500 transition-all shadow-sm hover:shadow-md cursor-pointer appearance-none"
                >
                  <option value="price">
                    {locale === "mn"
                      ? "Үнэ"
                      : locale === "zh"
                      ? "价格"
                      : "Price"}
                  </option>
                  <option value="data">
                    {locale === "mn"
                      ? "Өгөгдөл"
                      : locale === "zh"
                      ? "数据"
                      : "Data"}
                  </option>
                  <option value="duration">
                    {locale === "mn"
                      ? "Хугацаа"
                      : locale === "zh"
                      ? "持续时间"
                      : "Duration"}
                  </option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
                  <svg
                    className="w-4 h-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* Sort Order */}
              <div className="relative min-w-[120px] md:min-w-[140px]">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
                  <svg
                    className="w-4 h-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    />
                  </svg>
                </div>
                <select
                  value={sortOrder}
                  onChange={(e) =>
                    setSortOrder(e.target.value as "asc" | "desc")
                  }
                  className="w-full pl-9 pr-8 py-2.5 text-sm rounded-lg border-2 border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300/50 focus:border-emerald-500 transition-all shadow-sm hover:shadow-md cursor-pointer appearance-none"
                >
                  <option value="asc">
                    {locale === "mn"
                      ? "Өсөх"
                      : locale === "zh"
                      ? "升序"
                      : "Low to High"}
                  </option>
                  <option value="desc">
                    {locale === "mn"
                      ? "Буурах"
                      : locale === "zh"
                      ? "降序"
                      : "High to Low"}
                  </option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
                  <svg
                    className="w-4 h-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* Clear Filters Button */}
              {(priceRange.max < 10000000 ||
                dataRange.max < 1000 ||
                durationRange.max < 365) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setPriceRange({ min: 0, max: 10000000 });
                    setDataRange({ min: 0, max: 1000 });
                    setDurationRange({ min: 0, max: 365 });
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm"
                >
                  <span className="text-slate-600">
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </span>
                  {locale === "mn"
                    ? "Цэвэрлэх"
                    : locale === "zh"
                    ? "清除"
                    : "Clear Filters"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto px-4 py-8">
        {/* Country Header */}
        <div className="text-center mb-10">
          <div className="text-7xl md:text-9xl mb-6">{countryCodeEmoji}</div>
          <h1 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            {countryName}
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 font-medium mb-4">
            {regionName}
          </p>
          <p className="text-lg text-slate-500">
            {filteredAndSortedPlans.length}{" "}
            {filteredAndSortedPlans.length === 1
              ? locale === "mn"
                ? "төлөвлөгөө"
                : locale === "zh"
                ? "计划"
                : "plan"
              : locale === "mn"
              ? "төлөвлөгөө"
              : locale === "zh"
              ? "计划"
              : "plans"}{" "}
            {locale === "mn"
              ? "боломжтой"
              : locale === "zh"
              ? "可用"
              : "available"}
          </p>
        </div>

        {/* Plans Grid */}
        {filteredAndSortedPlans.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">
              {locale === "mn"
                ? "Төлөвлөгөө олдсонгүй"
                : locale === "zh"
                ? "未找到计划"
                : "No Plans Found"}
            </h2>
            <p className="text-lg text-slate-600 mb-6">
              {locale === "mn"
                ? "Шүүлтээ өөрчлөөд дахин оролдоно уу."
                : locale === "zh"
                ? "请尝试更改筛选条件。"
                : "Try adjusting your filters."}
            </p>
            <Button
              onClick={() => {
                setPriceRange({ min: 0, max: 10000000 });
                setDataRange({ min: 0, max: 1000 });
                setDurationRange({ min: 0, max: 365 });
              }}
            >
              {locale === "mn"
                ? "Шүүлтээ цэвэрлэх"
                : locale === "zh"
                ? "清除筛选"
                : "Clear Filters"}
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAndSortedPlans.map((item) => {
              return (
                <Card
                  key={item.package.packageCode || item.plan.id}
                  hover
                  className="flex flex-col h-full bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-200 rounded-xl overflow-hidden"
                >
                  {/* Subtle accent bar */}
                  <div className="h-1 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />

                  <div className="p-7 flex flex-col flex-grow">
                    {/* Price */}
                    <div className="text-center mb-7">
                      <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide font-medium">
                        {t("price")}
                      </p>
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-3xl font-bold text-slate-900 tracking-tight">
                          {formatCurrency(item.package.buyPrice, "MNT")}
                        </span>
                      </div>
                    </div>

                    {/* Data & Duration */}
                    <div className="flex gap-4 mb-7">
                      <div className="flex-1 text-center py-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors">
                        <p className="text-xs text-slate-500 mb-2 font-medium">
                          {t("data")}
                        </p>
                        <p className="text-xl font-bold text-slate-900">
                          {item.plan.data}
                        </p>
                      </div>
                      <div className="flex-1 text-center py-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors">
                        <p className="text-xs text-slate-500 mb-2 font-medium">
                          {t("validFor")}
                        </p>
                        <p className="text-xl font-bold text-slate-900">
                          {item.plan.duration}
                        </p>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mb-7 flex-grow">
                      <p className="text-sm font-semibold text-slate-800 mb-4">
                        {t("whatsIncluded")}
                      </p>
                      <ul className="space-y-3">
                        {item.plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
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
                            <span className="text-sm text-slate-700 leading-relaxed">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Button */}
                    <Button
                      className="w-full py-3.5 text-base font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all shadow-sm hover:shadow-md mt-auto"
                      onClick={() => handlePurchase(item)}
                    >
                      {t("purchasePlan")}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
