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
  // Optional: ISO 3166-1 alpha-2 country codes covered by this plan
  countriesCovered?: string[];
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

// Region Types
export type Region = 'All' | 'North America' | 'Europe' | 'Asia' | 'Oceania' | 'Africa' | 'South America';

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

