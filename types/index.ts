// User Types
export interface UserPreferences {
  preferredCurrency: string;
  preferredLanguage: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  favoriteCountries: string[];
  timezone: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  isActive?: boolean;
  lastLoginAt?: string | Date;
  memberSince: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  preferredCurrency?: string;
  preferences?: UserPreferences;
  totalEsims: number;
  activeEsims: number;
}

// Full user profile from /users/me endpoint
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  isActive: boolean;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
  preferredCurrency: string;
  preferences: UserPreferences;
}

// eSIM Plan Types
export interface EsimPlan {
  id: number;
  country: string;
  region: string;
  flag: string;
  data: string;
  duration: string;
  price: number;
  features: string[];
  retailPrice: number;
  // Optional: ISO 3166-1 alpha-2 country codes covered by this plan
  countriesCovered?: string[];
  // Package identifiers from esimaccess API
  packageCode?: string;
  slug?: string;
}

// Active eSIM Types
export interface ActiveEsim {
  id: number;
  country: string;
  data: string;
  used: string;
  expiry: string;
  status: 'active' | 'expired' | 'pending';
}

// Order Types
export interface Order {
  id: number;
  country: string;
  date: string;
  price: string;
  status: 'completed' | 'pending' | 'cancelled';
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Auth Response Types
export interface AuthResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLoginAt: Date;
  createdAt: Date;
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

// Navigation Types
export interface NavigationItem {
  name: string;
  href: string;
  icon?: string;
}

// Wallet Types
export interface Wallet {
  userId: string;
  balance: number;
  currency: string;
}

export interface AddBalanceResponse {
  userId: string;
  balance: number;
  currency: string;
  previousBalance: number;
  amountAdded: number;
}

// Region Types
export interface Region {
  id: number;
  name_en: string;
  name_mn: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateRegionDto {
  name_en: string;
  name_mn: string;
}

export interface UpdateRegionDto {
  name_en?: string;
  name_mn?: string;
}

// Country Types
export interface Country {
  id: number;
  name_en: string;
  name_mn: string;
  image: string | null;
  region_id: number;
  country_code: string | null;
  region?: Region;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateCountryDto {
  name_en: string;
  name_mn: string;
  region_id: number;
  country_code: string;
  image?: string | null;
}

export interface UpdateCountryDto {
  name_en?: string;
  name_mn?: string;
  region_id?: number;
  country_code?: string;
  image?: string | null;
}

export interface QueryCountriesDto {
  region_id?: number;
}

// Category Types
export interface Category {
  id: number;
  name_en: string;
  name_mn: string;
  description_en: string | null;
  description_mn: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateCategoryDto {
  name_en: string;
  name_mn: string;
  description_en?: string | null;
  description_mn?: string | null;
}

export interface UpdateCategoryDto {
  name_en?: string;
  name_mn?: string;
  description_en?: string | null;
  description_mn?: string | null;
}

// Marketplace Types
export interface MarketplaceRegion {
  name_en: string;
  name_mn: string;
}

export interface MarketplaceCountry {
  name_en: string;
  name_mn: string;
  image: string | null;
  country_code: string | null;
  region: MarketplaceRegion;
}

export interface MarketplaceCategory {
  name_en: string;
  name_mn: string;
  description_en: string | null;
  description_mn: string | null;
  countries: MarketplaceCountry[];
}

// Filter Types
export interface CountryFilter {
  id: number;
  name_en: string;
  name_mn: string;
  country_code: string | null;
  image: string | null;
}

export interface CategoryFilter {
  id: number;
  name_en: string;
  name_mn: string;
  description_en: string | null;
  description_mn: string | null;
}

export interface QueryMarketplace {
  category_id?: number;
  region_id?: number;
  search?: string;
}

// Package Types (from esimaccess API)
export interface PackageOperator {
  operatorName: string;
  networkType: string;
}

export interface PackageLocationNetwork {
  locationName: string;
  locationLogo: string;
  operatorList: PackageOperator[];
}

export interface EsimPackage {
  packageCode: string;
  slug: string;
  name: string;
  price: number;
  currencyCode: string;
  volume: number; // in MB
  smsStatus: number;
  dataType: number;
  unusedValidTime: number;
  duration: number;
  durationUnit: string;
  location: string;
  description: string;
  buyPrice: string;
  activeType: number;
  favorite: boolean;
  retailPrice: number;
  speed?: string;
  locationNetworkList?: PackageLocationNetwork[];
}


export interface PlanWithPackage {
  plan: EsimPlan;
  package: EsimPackage;
}