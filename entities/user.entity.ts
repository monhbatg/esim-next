export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Add other user properties as needed
  phoneNumber?: string;
  password?: string; // Note: This should never be exposed in API responses
}
