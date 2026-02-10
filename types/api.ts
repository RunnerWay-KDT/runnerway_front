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

export interface UpdateProfileResponse {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  provider: string | null;
  is_active: boolean;
  stats: UserStats;
  updated_at: string;
}

export interface UserProfileResponse {
  success: boolean;
  data: UpdateProfileResponse;
  message: string;
}

// ============================================
// 경로 추천 관련 타입
// ============================================

export interface RouteRequest {
  lat: number;
  lng: number;
  prompt: string;
}

export interface RecommendRouteResponse {
  candidates?: Array<unknown>;
  [key: string]: unknown;
}

// ============================================
// 운동 관련 타입 (workouts + workout_splits 테이블 기반)
// ============================================

export interface WorkoutStartRequest {
  route_id?: string | null;
  route_option_id?: string | null;
  route_name: string;
  type?: string | null; // preset / custom / null
  mode?: string | null; // running / walking / null
  start_location: {
    latitude: number;
    longitude: number;
  };
  started_at: string; // ISO 8601 datetime
}

export interface WorkoutStartResponse {
  success: boolean;
  data: {
    workout_id: string;
    status: string;
    started_at: string;
  };
  message: string;
}

export interface WorkoutSplit {
  km: number;
  pace: string;
  duration: number; // 초
}

export interface WorkoutCompleteRequest {
  completed_at: string; // ISO 8601 datetime
  final_metrics: {
    distance: number; // km
    duration: number; // 초
    average_pace: string; // 예: "6'30\""
    calories: number; // kcal
    max_pace?: string | null;
    min_pace?: string | null;
  };
  route: {
    actual_path: { lat: number; lng: number; timestamp?: number }[];
  };
  splits?: WorkoutSplit[] | null;
  end_location?: {
    latitude: number;
    longitude: number;
  } | null;
  elevation_gain?: number | null;
  elevation_loss?: number | null;
  route_completion?: number | null; // 0-100
}

export interface WorkoutCompleteResponse {
  success: boolean;
  data: {
    workout_id: string;
    completed_distance: number;
    completed_time: number;
    average_pace: string;
    calories: number;
    route_completion?: number | null;
    planned_path?: { lat: number; lng: number }[] | null;
    actual_path?: { lat: number; lng: number; timestamp?: number }[] | null;
    saved_at: string;
  };
  message: string;
}
