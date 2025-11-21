import { api } from './api';
import type {
  Region,
  Country,
  Category,
  MarketplaceCategory,
  CountryFilter,
  CategoryFilter,
  QueryMarketplace,
  CreateRegionDto,
  UpdateRegionDto,
  CreateCountryDto,
  UpdateCountryDto,
  QueryCountriesDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  EsimPackage,
} from '@/types';

/**
 * Regions API
 */
export const regionsApi = {
  /**
   * List all regions
   */
  list: async (): Promise<Region[]> => {
    const response = await api.get<Region[]>('/api/regions');
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch regions');
    }
    return response.data;
  },

  /**
   * Get region by ID
   */
  getById: async (id: number): Promise<Region> => {
    const response = await api.get<Region>(`/api/regions/${id}`);
    if (!response.success || !response.data) {
      throw new Error(response.error || `Failed to fetch region ${id}`);
    }
    return response.data;
  },

  /**
   * Create a new region
   */
  create: async (data: CreateRegionDto): Promise<Region> => {
    const response = await api.post<Region>('/api/regions', data);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create region');
    }
    return response.data;
  },

  /**
   * Update a region
   */
  update: async (id: number, data: UpdateRegionDto): Promise<Region> => {
    const response = await api.put<Region>(`/api/regions/${id}`, data);
    if (!response.success || !response.data) {
      throw new Error(response.error || `Failed to update region ${id}`);
    }
    return response.data;
  },

  /**
   * Delete a region
   */
  delete: async (id: number): Promise<void> => {
    const response = await api.delete(`/api/regions/${id}`);
    if (!response.success) {
      throw new Error(response.error || `Failed to delete region ${id}`);
    }
  },
};

/**
 * Countries API
 */
export const countriesApi = {
  /**
   * List all countries (optionally filtered by region)
   */
  list: async (query?: QueryCountriesDto): Promise<Country[]> => {
    const params = new URLSearchParams();
    if (query?.region_id) {
      params.append('region_id', query.region_id.toString());
    }
    const url = `/api/countries${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<Country[]>(url);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch countries');
    }
    return response.data;
  },

  /**
   * Get country by ID
   */
  getById: async (id: number): Promise<Country> => {
    const response = await api.get<Country>(`/api/countries/${id}`);
    if (!response.success || !response.data) {
      throw new Error(response.error || `Failed to fetch country ${id}`);
    }
    return response.data;
  },

  /**
   * Create a new country
   */
  create: async (data: CreateCountryDto): Promise<Country> => {
    const response = await api.post<Country>('/api/countries', data);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create country');
    }
    return response.data;
  },

  /**
   * Update a country
   */
  update: async (id: number, data: UpdateCountryDto): Promise<Country> => {
    const response = await api.put<Country>(`/api/countries/${id}`, data);
    if (!response.success || !response.data) {
      throw new Error(response.error || `Failed to update country ${id}`);
    }
    return response.data;
  },

  /**
   * Delete a country
   */
  delete: async (id: number): Promise<void> => {
    const response = await api.delete(`/api/countries/${id}`);
    if (!response.success) {
      throw new Error(response.error || `Failed to delete country ${id}`);
    }
  },
};

/**
 * Categories API
 */
export const categoriesApi = {
  /**
   * List all categories
   */
  list: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/api/categories');
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch categories');
    }
    return response.data;
  },

  /**
   * Get category by ID
   */
  getById: async (id: number): Promise<Category> => {
    const response = await api.get<Category>(`/api/categories/${id}`);
    if (!response.success || !response.data) {
      throw new Error(response.error || `Failed to fetch category ${id}`);
    }
    return response.data;
  },

  /**
   * Create a new category
   */
  create: async (data: CreateCategoryDto): Promise<Category> => {
    const response = await api.post<Category>('/api/categories', data);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create category');
    }
    return response.data;
  },

  /**
   * Update a category
   */
  update: async (id: number, data: UpdateCategoryDto): Promise<Category> => {
    const response = await api.put<Category>(`/api/categories/${id}`, data);
    if (!response.success || !response.data) {
      throw new Error(response.error || `Failed to update category ${id}`);
    }
    return response.data;
  },

  /**
   * Delete a category
   */
  delete: async (id: number): Promise<void> => {
    const response = await api.delete(`/api/categories/${id}`);
    if (!response.success) {
      throw new Error(response.error || `Failed to delete category ${id}`);
    }
  },
};

/**
 * Marketplace API
 * Uses Next.js API routes to avoid CORS issues
 */
export const marketplaceApi = {
  /**
   * Get marketplace data (categories with countries)
   * Supports filtering with query parameters for better performance
   * Uses /api/marketplace Next.js route which proxies to the backend
   */
  getMarketplace: async (query?: QueryMarketplace): Promise<MarketplaceCategory[]> => {
    const params = new URLSearchParams();
    if (query?.category_id) {
      params.append('category_id', query.category_id.toString());
    }
    if (query?.region_id) {
      params.append('region_id', query.region_id.toString());
    }
    if (query?.search) {
      params.append('search', query.search);
    }
    const url = `/api/marketplace${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<MarketplaceCategory[]>(url);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch marketplace data');
    }
    return response.data;
  },

  /**
   * Get all countries for filter dropdowns
   * Lightweight endpoint optimized for filter UI components
   */
  getCountries: async (): Promise<CountryFilter[]> => {
    const response = await api.get<CountryFilter[]>('/api/marketplace/countries');
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch countries');
    }
    return response.data;
  },

  /**
   * Get all categories for filter dropdowns
   * Lightweight endpoint optimized for filter UI components
   */
  getCategories: async (): Promise<CategoryFilter[]> => {
    const response = await api.get<CategoryFilter[]>('/api/marketplace/categories');
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch categories');
    }
    return response.data;
  },

  /**
   * Helper function to extract country code from image path
   */
  getCountryCodeFromImage: (image: string | null): string | null => {
    if (!image) return null;
    const match = image.match(/\/([a-z]{2})\.png$/i);
    return match ? match[1].toUpperCase() : null;
  },

  /**
   * Get bundles (packages from multiple countries)
   * TODO: Connect with API when backend is ready
   * Currently returns dummy data for development
   */
  getBundles: async (): Promise<EsimPackage[]> => {
    // Dummy data - replace with actual API call when backend is ready
    const dummyBundles: EsimPackage[] = [
      {
        packageCode: "BUNDLE001",
        slug: "europe-7day-unlimited",
        name: "Europe 7-Day Unlimited",
        price: 150000,
        currencyCode: "MNT",
        volume: 0, // Unlimited
        smsStatus: 0,
        dataType: 1, // Unlimited
        unusedValidTime: 7,
        duration: 7,
        durationUnit: "days",
        location: "Europe",
        description: "Unlimited data across 30+ European countries. Perfect for travelers.",
        activeType: 1,
        favorite: false,
        retailPrice: 150000,
        speed: "4G/5G",
      },
      {
        packageCode: "BUNDLE002",
        slug: "asia-15day-10gb",
        name: "Asia 15-Day 10GB",
        price: 120000,
        currencyCode: "MNT",
        volume: 10737418240, // 10GB in bytes
        smsStatus: 0,
        dataType: 0,
        unusedValidTime: 15,
        duration: 15,
        durationUnit: "days",
        location: "Asia",
        description: "10GB data valid for 15 days across major Asian countries.",
        activeType: 1,
        favorite: false,
        retailPrice: 120000,
        speed: "4G",
      },
      {
        packageCode: "BUNDLE003",
        slug: "global-30day-20gb",
        name: "Global 30-Day 20GB",
        price: 250000,
        currencyCode: "MNT",
        volume: 21474836480, // 20GB in bytes
        smsStatus: 0,
        dataType: 0,
        unusedValidTime: 30,
        duration: 30,
        durationUnit: "days",
        location: "Global",
        description: "20GB data for 30 days. Works in 50+ countries worldwide.",
        activeType: 1,
        favorite: false,
        retailPrice: 250000,
        speed: "4G/5G",
      },
      {
        packageCode: "BUNDLE004",
        slug: "usa-canada-14day-unlimited",
        name: "USA & Canada 14-Day Unlimited",
        price: 180000,
        currencyCode: "MNT",
        volume: 0, // Unlimited
        smsStatus: 0,
        dataType: 1,
        unusedValidTime: 14,
        duration: 14,
        durationUnit: "days",
        location: "USA & Canada",
        description: "Unlimited high-speed data in USA and Canada for 14 days.",
        activeType: 1,
        favorite: false,
        retailPrice: 180000,
        speed: "5G",
      },
      {
        packageCode: "BUNDLE005",
        slug: "middle-east-10day-5gb",
        name: "Middle East 10-Day 5GB",
        price: 95000,
        currencyCode: "MNT",
        volume: 5368709120, // 5GB in bytes
        smsStatus: 0,
        dataType: 0,
        unusedValidTime: 10,
        duration: 10,
        durationUnit: "days",
        location: "Middle East",
        description: "5GB data for 10 days across Middle Eastern countries.",
        activeType: 1,
        favorite: false,
        retailPrice: 95000,
        speed: "4G",
      },
      {
        packageCode: "BUNDLE006",
        slug: "oceania-21day-15gb",
        name: "Oceania 21-Day 15GB",
        price: 200000,
        currencyCode: "MNT",
        volume: 16106127360, // 15GB in bytes
        smsStatus: 0,
        dataType: 0,
        unusedValidTime: 21,
        duration: 21,
        durationUnit: "days",
        location: "Oceania",
        description: "15GB data valid for 21 days in Australia, New Zealand, and Pacific islands.",
        activeType: 1,
        favorite: false,
        retailPrice: 200000,
        speed: "4G/5G",
      },
      {
        packageCode: "BUNDLE007",
        slug: "south-america-30day-unlimited",
        name: "South America 30-Day Unlimited",
        price: 220000,
        currencyCode: "MNT",
        volume: 0, // Unlimited
        smsStatus: 0,
        dataType: 1,
        unusedValidTime: 30,
        duration: 30,
        durationUnit: "days",
        location: "South America",
        description: "Unlimited data across South American countries for 30 days.",
        activeType: 1,
        favorite: false,
        retailPrice: 220000,
        speed: "4G",
      },
      {
        packageCode: "BUNDLE008",
        slug: "africa-14day-8gb",
        name: "Africa 14-Day 8GB",
        price: 110000,
        currencyCode: "MNT",
        volume: 8589934592, // 8GB in bytes
        smsStatus: 0,
        dataType: 0,
        unusedValidTime: 14,
        duration: 14,
        durationUnit: "days",
        location: "Africa",
        description: "8GB data for 14 days across major African countries.",
        activeType: 1,
        favorite: false,
        retailPrice: 110000,
        speed: "4G",
      },
    ];

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return dummyBundles;

    /* TODO: Replace above with actual API call when backend is ready
    try {
      // First, get all countries from marketplace
      const marketplaceData = await marketplaceApi.getMarketplace();
      
      // Extract unique country codes
      const countryCodes = new Set<string>();
      marketplaceData.forEach((category) => {
        category.countries.forEach((country) => {
          const code = country.country_code || marketplaceApi.getCountryCodeFromImage(country.image);
          if (code) {
            countryCodes.add(code.toUpperCase());
          }
        });
      });

      // Fetch packages from all countries in parallel (limit to first 20 countries for performance)
      const countryCodesArray = Array.from(countryCodes).slice(0, 20);
      const packagePromises = countryCodesArray.map((code) =>
        marketplaceApi.getPackages(code).catch((err) => {
          console.warn(`Failed to fetch packages for ${code}:`, err);
          return [];
        })
      );

      const packagesArrays = await Promise.all(packagePromises);
      const allPackages = packagesArrays.flat();

      // Remove duplicates based on packageCode
      const uniquePackages = Array.from(
        new Map(allPackages.map((pkg) => [pkg.packageCode, pkg])).values()
      );

      return uniquePackages;
    } catch (error) {
      console.error('getBundles error:', error);
      throw error;
    }
    */
  },

  /**
   * Get eSIM packages for a specific country code
   * Fetches real package data from esimaccess API
   * Uses fetch directly for Next.js API routes to avoid baseURL conflicts
   */
  getPackages: async (countryCode: string): Promise<EsimPackage[]> => {
    try {
      const params = new URLSearchParams();
      params.append('country_code', countryCode);
      // Add cache-busting timestamp
      params.append('_t', Date.now().toString());
      
      // Use fetch directly for Next.js API routes (not backend API)
      const url = `/api/marketplace/packages?${params.toString()}`;
      
      console.log('getPackages fetching from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
        cache: 'no-store',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      
      console.log('getPackages raw response:', result);
      
      // The Next.js API route returns { success: true, data: [...] }
      if (!result.success) {
        throw new Error(result.error || `Failed to fetch packages for ${countryCode}`);
      }
      
      // Extract packages array
      const packages: EsimPackage[] = Array.isArray(result.data) ? result.data : [];
      
      console.log('getPackages extracted packages:', packages.length, packages);
      
      if (packages.length === 0) {
        console.warn('No packages found in response:', result);
      }
      
      return packages;
    } catch (error) {
      console.error('getPackages error:', error);
      throw error;
    }
  },
};

