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

