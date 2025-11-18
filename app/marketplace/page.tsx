"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { MarketplaceSkeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useLocale, useTranslations } from "@/contexts/LocaleContext";
import { marketplaceApi, regionsApi } from "@/lib/marketplace-api";
import {
  CategoryFilter,
  EsimPlan,
  MarketplaceCategory,
  MarketplaceCountry,
  Region,
} from "@/types";
import { useRouter } from "next/navigation";
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
  // Extract country code from image path like "/img/flags/th.png"
  const match = image.match(/\/([a-z]{2})\.png$/i);
  return match ? match[1].toUpperCase() : null;
}

// Use country_code from API if available, otherwise extract from image
function getCountryCode(country: MarketplaceCountry): string | null {
  return country.country_code || getCountryCodeFromImage(country.image);
}

// Group countries by unique country (combining from all categories)
interface CountryWithPlans {
  country: MarketplaceCountry;
  categories: Array<{
    category: MarketplaceCategory;
    plan: EsimPlan;
  }>;
}

function convertCountryToPlan(
  country: MarketplaceCountry,
  categoryName: string,
  locale: string
): EsimPlan {
  const countryCode = getCountryCode(country);
  const countryName = locale === "mn" ? country.name_mn : country.name_en;
  const regionName =
    locale === "mn" ? country.region.name_mn : country.region.name_en;

  return {
    id: Math.random(), // Temporary ID, should be replaced with actual plan ID
    country: countryName,
    region: regionName,
    flag: codeToFlagEmoji(countryCode),
    data: "1GB", // Default, should come from API or be configurable
    duration: "7 days", // Default, should come from API or be configurable
    price: 0, // Default, should come from API
    features: [
      "4G/5G Speed",
      "No Contract",
      "Instant Activation",
      "Unlimited Data",
    ],
    countriesCovered: countryCode ? [countryCode] : [],
    retailPrice: 0,
  };
}

export default function Marketplace() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { setSelectedPlan } = useCheckout();
  const locale = useLocale();
  const t = useTranslations();

  const [marketplaceData, setMarketplaceData] = useState<MarketplaceCategory[]>(
    []
  );
  const [categories, setCategories] = useState<CategoryFilter[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Fetch filter options (categories and regions)
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [categoriesData, regionsData] = await Promise.all([
          marketplaceApi.getCategories(),
          regionsApi.list(),
        ]);
        setCategories(categoriesData);
        setRegions(regionsData);
      } catch (err) {
        console.error("Error fetching filters:", err);
      }
    };

    fetchFilters();
  }, []);

  // Fetch marketplace data with server-side filtering
  useEffect(() => {
    const fetchMarketplace = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Build query parameters for server-side filtering
        const query: {
          category_id?: number;
          region_id?: number;
          search?: string;
        } = {};
        if (selectedCategoryId) query.category_id = selectedCategoryId;
        if (selectedRegionId) query.region_id = selectedRegionId;
        if (debouncedQuery) query.search = debouncedQuery;

        const data = await marketplaceApi.getMarketplace(query);
        setMarketplaceData(data);
        // Mark initial load as complete after first successful fetch
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load marketplace data"
        );
        console.error("Error fetching marketplace:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketplace();
  }, [selectedCategoryId, selectedRegionId, debouncedQuery, isInitialLoad]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Flatten countries from all categories and group by country
  const countriesWithPlans = useMemo(() => {
    const countryMap = new Map<string, CountryWithPlans>();

    marketplaceData.forEach((category) => {
      category.countries.forEach((country) => {
        const countryKey = country.country_code || country.name_en;
        const countryName = locale === "mn" ? country.name_mn : country.name_en;
        const categoryName =
          locale === "mn" ? category.name_mn : category.name_en;
        const plan = convertCountryToPlan(country, categoryName, locale);

        if (!countryMap.has(countryKey)) {
          countryMap.set(countryKey, {
            country: country,
            categories: [],
          });
        }

        countryMap.get(countryKey)!.categories.push({
          category,
          plan,
        });
      });
    });

    return Array.from(countryMap.values());
  }, [marketplaceData, locale]);

  // Filter countries based on search and filters
  const filteredCountries = useMemo(() => {
    return countriesWithPlans.filter((item) => {
      const countryName =
        locale === "mn" ? item.country.name_mn : item.country.name_en;
      const regionName =
        locale === "mn"
          ? item.country.region.name_mn
          : item.country.region.name_en;

      // Search filter
      if (debouncedQuery) {
        const query = debouncedQuery.toLowerCase();
        if (
          !countryName.toLowerCase().includes(query) &&
          !regionName.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [countriesWithPlans, debouncedQuery, locale]);

  const handlePurchase = (plan: EsimPlan) => {
    // Always go to checkout page where user can choose login or guest
    setSelectedPlan(plan);
    sessionStorage.setItem("pendingPurchase", JSON.stringify(plan));
    router.push("/checkout");
  };

  const handleCountrySelect = (countryWithPlans: CountryWithPlans) => {
    const countryCode = getCountryCode(countryWithPlans.country);
    if (countryCode) {
      router.push(`/marketplace/${countryCode.toLowerCase()}`);
    }
  };

  // Show skeleton loader on initial load
  if (isLoading && isInitialLoad) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        {/* Sticky Filter Bar */}
        <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-lg">
          <div className="container mx-auto px-4 py-3 md:py-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-4 w-4 md:h-5 md:w-5 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <div className="h-9 md:h-11 bg-slate-200 rounded-lg animate-pulse" />
                </div>
              </div>

              {/* Category Filter */}
              <div className="w-full md:w-48">
                <div className="h-9 md:h-11 bg-slate-200 rounded-lg animate-pulse" />
              </div>

              {/* Region Filter */}
              <div className="w-full md:w-48">
                <div className="h-9 md:h-11 bg-slate-200 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Page Title Skeleton */}
        <div className="container mx-auto px-4 pt-8 pb-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="h-12 md:h-14 w-64 mx-auto mb-3 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-5 md:h-6 w-96 max-w-full mx-auto bg-slate-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Content Area with Skeleton */}
        <div className="container mx-auto px-4 py-8">
          <MarketplaceSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto p-8 text-center transform hover:scale-105 transition-transform duration-300">
          <div className="text-7xl mb-6 animate-bounce">⚠️</div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">
            {t("error")}
          </h2>
          <p className="text-lg text-slate-700 mb-8">{error}</p>
          <Button
            onClick={() => {
              setError(null);
              setIsLoading(true);
              marketplaceApi
                .getMarketplace()
                .then(setMarketplaceData)
                .catch(setError)
                .finally(() => setIsLoading(false));
            }}
            className="transform hover:scale-105 transition-transform"
          >
            {t("tryAgain")}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      {/* Page Title - Outside sticky area */}
      <div className="container mx-auto px-4 pt-8 pb-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent animate-gradient">
            {t("marketplaceTitle")}
          </h1>
          <p className="text-base md:text-lg text-slate-700 font-medium">
            {t("marketplaceSubtitle")}
          </p>
        </div>
      </div>
      {/* Compact Sticky Filters */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b-2 border-emerald-200/50 shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <svg
                    className="w-5 h-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    locale === "mn"
                      ? "Хайх..."
                      : locale === "zh"
                      ? "搜索..."
                      : "Search..."
                  }
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border-2 border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300/50 focus:border-emerald-500 transition-all shadow-sm hover:shadow-md"
                />
              </div>

              {/* Category Filter */}
              <div className="relative min-w-[180px] md:min-w-[200px]">
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
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
                <select
                  value={selectedCategoryId || ""}
                  onChange={(e) =>
                    setSelectedCategoryId(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="w-full pl-9 pr-8 py-2.5 text-sm rounded-lg border-2 border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300/50 focus:border-emerald-500 transition-all shadow-sm hover:shadow-md cursor-pointer appearance-none truncate whitespace-nowrap"
                  style={{ textOverflow: "ellipsis" }}
                >
                  <option value="">{t("allCategories")}</option>
                  {categories.map((category) => {
                    const name =
                      locale === "mn" ? category.name_mn : category.name_en;
                    return (
                      <option
                        key={category.id}
                        value={category.id}
                        title={name}
                      >
                        {name}
                      </option>
                    );
                  })}
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

              {/* Region Filter */}
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
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <select
                  value={selectedRegionId || ""}
                  onChange={(e) =>
                    setSelectedRegionId(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="w-full pl-9 pr-8 py-2.5 text-sm rounded-lg border-2 border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300/50 focus:border-emerald-500 transition-all shadow-sm hover:shadow-md cursor-pointer appearance-none truncate whitespace-nowrap"
                  style={{ textOverflow: "ellipsis" }}
                >
                  <option value="">{t("allRegions")}</option>
                  {regions.map((region) => {
                    const name =
                      locale === "mn" ? region.name_mn : region.name_en;
                    return (
                      <option key={region.id} value={region.id} title={name}>
                        {name}
                      </option>
                    );
                  })}
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
              {(searchQuery || selectedCategoryId || selectedRegionId) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategoryId(null);
                    setSelectedRegionId(null);
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
                  {t("clearFilters")}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Skeleton loader when filtering (not initial load) */}
          {isLoading && !isInitialLoad ? (
            <MarketplaceSkeleton />
          ) : filteredCountries.length === 0 ? (
            <div className="max-w-2xl mx-auto text-center mt-12">
              <Card className="p-12 bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <div className="text-8xl mb-6 animate-bounce">🔍</div>
                <h2 className="text-3xl font-black text-slate-900 mb-4">
                  {t("noResultsFound")}
                </h2>
                <p className="text-lg text-slate-700 mb-8">
                  {t("noResultsDesc")}
                </p>
              </Card>
            </div>
          ) : (
            // Show countries grid
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">
                  {locale === "mn"
                    ? `Доступ улсууд (${filteredCountries.length})`
                    : locale === "zh"
                    ? `可用国家 (${filteredCountries.length})`
                    : `Available Countries (${filteredCountries.length})`}
                </h2>
                <p className="text-slate-600">
                  {locale === "mn"
                    ? "Улс сонгоод боломжтой eSIM төлөвлөгөөгүүдийг харах"
                    : locale === "zh"
                    ? "选择一个国家以查看可用的 eSIM 计划"
                    : "Select a country to view available eSIM plans"}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {filteredCountries.map((item, index) => {
                  const countryName =
                    locale === "mn"
                      ? item.country.name_mn
                      : item.country.name_en;
                  const regionName =
                    locale === "mn"
                      ? item.country.region.name_mn
                      : item.country.region.name_en;
                  const countryCode = getCountryCode(item.country);

                  return (
                    <div
                      key={countryCode || countryName}
                      onClick={() => handleCountrySelect(item)}
                      className="cursor-pointer"
                    >
                      <Card
                        hover
                        className="group flex flex-col items-center text-center bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/20 border-2 border-slate-200 hover:border-emerald-400 shadow-md hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 p-5 md:p-6 relative overflow-hidden"
                      >
                        {/* Decorative gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/5 group-hover:to-teal-500/5 transition-all duration-300 pointer-events-none" />

                        {/* Flag */}
                        <div className="text-5xl md:text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300 relative z-10">
                          {codeToFlagEmoji(countryCode)}
                        </div>

                        {/* Country Name */}
                        <h3 className="text-base md:text-lg font-black text-slate-900 mb-1.5 leading-tight group-hover:text-emerald-700 transition-colors duration-300 relative z-10">
                          {countryName}
                        </h3>

                        {/* Region */}
                        <p className="text-xs md:text-sm text-slate-600 font-medium relative z-10">
                          {regionName}
                        </p>

                        {/* Arrow indicator */}
                        <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10">
                          <div className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-xs">
                            <span>
                              {locale === "mn"
                                ? "Төлөвлөгөө харах"
                                : locale === "zh"
                                ? "查看计划"
                                : "View Plans"}
                            </span>
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
                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                              />
                            </svg>
                          </div>
                        </div>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
