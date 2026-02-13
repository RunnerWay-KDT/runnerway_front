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
  saved_routes_count: number;
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

// ============================================
// 운동 기록 조회 타입
// ============================================

export interface WorkoutSummary {
  id: string;
  route_id: string | null;
  route_option_id: string | null;
  route_name: string;
  type: string | null; // preset / custom / null
  mode: string | null; // running / walking / null
  distance: number | null;
  duration: number | null; // 초
  avg_pace: string | null;
  calories: number | null;
  route_completion: number | null;
  is_bookmarked: boolean;
  svg_path: string | null; // 커스텀 경로의 SVG path 데이터
  shape_id: string | null; // 프리셋 도형 식별자 (예: 'heart', 'star')
  icon_name: string | null; // 프리셋 도형 아이콘 이름
  started_at: string;
  completed_at: string | null;
}

export interface WorkoutListResponse {
  success: boolean;
  data: {
    workouts: WorkoutSummary[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_count: number;
      has_next: boolean;
      has_prev: boolean;
    };
  };
  message: string;
}

export interface WorkoutDetail {
  id: string;
  route_name: string;
  type: string | null;
  mode: string | null;
  distance: number | null;
  duration: number | null;
  avg_pace: string | null;
  calories: number | null;
  route_completion: number | null;
  started_at: string;
  completed_at: string | null;
  planned_path: { lat: number; lng: number }[] | null;
  actual_path: { lat: number; lng: number; timestamp?: number }[] | null;
  splits: WorkoutSplit[] | null;
  start_latitude: number;
  start_longitude: number;
  end_latitude: number | null;
  end_longitude: number | null;
  created_at: string;
}

export interface WorkoutDetailResponse {
  success: boolean;
  data: WorkoutDetail;
}

// ============================================
// 저장한 경로 관련 타입
// ============================================

export interface SavedRouteSummary {
  id: string;
  route_id: string;
  route_option_id: string | null; // 저장된 경로 옵션 ID
  route_name: string;
  type: string | null; // preset / custom / none
  mode: string | null; // running / walking / none
  distance: number;
  safety_score: number;
  shape: {
    shape_id: string;
    shape_name: string;
    icon_name: string;
  } | null;
  svg_path: string | null; // 커스텀 경로의 SVG path 데이터
  author: {
    id: string;
    name: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  saved_at: string; // ISO8601
}

export interface SavedRouteListResponse {
  success: boolean;
  data: {
    routes: SavedRouteSummary[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_count: number;
      has_next: boolean;
      has_prev: boolean;
    };
  };
  message: string;
}
