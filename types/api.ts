// ============================================
// API 요청/응답 타입 정의
// ============================================

// ============================================
// 공통 응답 타입
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ============================================
// 인증 관련 타입
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface TokenData {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserStats {
  total_distance: number;
  total_workouts: number;
  completed_routes: number;
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  provider: string | null;
  is_active: boolean;
  stats: UserStats;
}

export interface AuthData {
  user: UserData;
  tokens: TokenData;
}

export interface AuthResponse {
  success: boolean;
  data: AuthData;
  message: string;
}

// ============================================
// 사용자 관련 타입
// ============================================

export interface UpdateProfileRequest {
  name?: string;
  avatar_url?: string | null;
}

export interface UserProfileResponse {
  success: boolean;
  data: UserData;
  message: string;
}

// ============================================
// 러닝 경로 관련 타입
// ============================================

export interface RouteRequest {
  lat: number;
  lng: number;
  target_distance_km?: number;
  prompt?: string;
}

export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface RouteCandidate {
  id: number;
  name: string;
  distance: string;
  time: number;
  path: RoutePoint[];
}

export interface RecommendRouteResponse {
  candidates: RouteCandidate[];
}
