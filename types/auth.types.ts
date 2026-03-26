export type UserRole = 'STORE_OWNER' | 'CUSTOMER';

export interface User {
  id: string;
  phone: string;
  name: string;
  profileImage?: string;
  role: UserRole;
  language: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
}

export interface SendOtpRequest {
  phone: string;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthError {
  code: string;
  message: string;
}
