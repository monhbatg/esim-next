// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  memberSince: string;
  totalEsims: number;
  activeEsims: number;
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

// Navigation Types
export interface NavigationItem {
  name: string;
  href: string;
  icon?: string;
}

