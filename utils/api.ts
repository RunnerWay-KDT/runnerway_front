// ============================================
// API 서비스 - 백엔드 통신 유틸리티
// ============================================

import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_CONFIG } from "../constants/config";
import type {
  LoginRequest,
  SignupRequest,
  AuthResponse,
  UserProfileResponse,
  UpdateProfileRequest,
  ApiResponse,
  RouteRequest,
  RecommendRouteResponse,
  WorkoutStartRequest,
  WorkoutStartResponse,
  WorkoutCompleteRequest,
  WorkoutCompleteResponse,
  WorkoutListResponse,
  WorkoutDetailResponse,
  SavedRouteListResponse,
} from "../types/api";

// ============================================
// 토큰 저장소 키
// ============================================
const ACCESS_TOKEN_KEY = "runnerway_access_token";
const REFRESH_TOKEN_KEY = "runnerway_refresh_token";

// ============================================
// 로그아웃 콜백 (AuthContext에서 설정)
// ============================================
let onUnauthorized: (() => void) | null = null;

export const setUnauthorizedCallback = (callback: () => void) => {
  onUnauthorized = callback;
};

// ============================================
// 토큰 관리 함수
// ============================================

export const tokenManager = {
  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error("Failed to get access token:", error);
      return null;
    }
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error("Failed to get refresh token:", error);
      return null;
    }
  },

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [ACCESS_TOKEN_KEY, accessToken],
        [REFRESH_TOKEN_KEY, refreshToken],
      ]);
    } catch (error) {
      console.error("Failed to save tokens:", error);
      throw error;
    }
  },

  async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
    } catch (error) {
      console.error("Failed to clear tokens:", error);
    }
  },
};

// ============================================
// API 클라이언트
// ============================================

export class ApiClient {
  private baseURL: string;
  private isRefreshing = false;
  private refreshPromise: Promise<void> | null = null;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    console.log("🌐 API Base URL:", this.baseURL);
  }

  /**
   * 토큰 갱신 처리
   */
  private async handleTokenRefresh(): Promise<void> {
    // 이미 갱신 중이면 대기
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const refreshToken = await tokenManager.getRefreshToken();
        if (!refreshToken) {
          throw new Error("리프레시 토큰이 없습니다");
        }

        console.log("🔄 토큰 갱신 시도...");
        const response = await fetch(
          `${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
          },
        );

        if (!response.ok) {
          throw new Error("토큰 갱신 실패");
        }

        const data = await response.json();

        if (data.success && data.data?.tokens) {
          await tokenManager.setTokens(
            data.data.tokens.access_token,
            data.data.tokens.refresh_token,
          );
          console.log("✅ 토큰 갱신 성공");
        } else {
          throw new Error("토큰 갱신 응답 형식 오류");
        }
      } catch (error) {
        console.error("❌ 토큰 갱신 실패:", error);
        // 갱신 실패 시 로그아웃 콜백 실행
        await tokenManager.clearTokens();
        if (onUnauthorized) {
          onUnauthorized();
        }
        throw error;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * API 요청을 보내는 기본 메서드
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false,
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    console.log("📡 API Request:", options.method || "GET", url);

    // 기본 헤더 설정
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // 기존 헤더 병합
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        if (typeof value === "string") {
          headers[key] = value;
        }
      });
    }

    // 인증 토큰 추가 (로그인/회원가입/토큰갱신 제외)
    if (
      !endpoint.includes("/auth/login") &&
      !endpoint.includes("/auth/signup") &&
      !endpoint.includes("/auth/refresh")
    ) {
      const token = await tokenManager.getAccessToken();
      console.log(
        "🔑 Access Token:",
        token ? `${token.substring(0, 20)}...` : "없음",
      );
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        console.log("✅ Authorization 헤더 추가됨");
      } else {
        console.warn("⚠️ 토큰이 없습니다. 로그인이 필요합니다.");
        // 토큰이 없으면 바로 로그아웃 콜백 실행 (로그인 페이지로 이동)
        if (onUnauthorized) {
          onUnauthorized();
        }
        throw new Error("인증 토큰이 없습니다. 다시 로그인해주세요.");
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log("✅ API Response:", response.status, response.statusText);

      // JSON 파싱 전에 응답 상태 확인
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "서버 오류가 발생했습니다",
        }));

        console.error("❌ API 에러 상세:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });

        // 401 에러인 경우 토큰 갱신 시도
        if (response.status === 401 && !isRetry) {
          console.error("🚫 인증 실패 - 토큰 갱신 시도");

          try {
            // 토큰 갱신 시도
            await this.handleTokenRefresh();

            // 토큰 갱신 성공 시 원래 요청 재시도
            console.log("🔄 원래 요청 재시도 중...");
            return this.request<T>(endpoint, options, true);
          } catch {
            console.error("❌ 토큰 갱신 실패 - 로그아웃 처리");
            // 토큰 갱신 실패 시 로그아웃 (handleTokenRefresh 내부에서 처리됨)
          }
        } else if (response.status === 401 && isRetry) {
          // 재시도에서도 401 에러면 완전히 실패
          console.error("❌ 토큰 갱신 후에도 인증 실패 - 로그아웃 처리");
          await tokenManager.clearTokens();
          if (onUnauthorized) {
            onUnauthorized();
          }
        }

        throw new Error(
          errorData.message || errorData.detail || `HTTP ${response.status}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("❌ API Error:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("네트워크 오류가 발생했습니다");
    }
  }

  /**
   * GET 요청
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "GET",
    });
  }

  /**
   * POST 요청
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT 요청
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH 요청
   */
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE 요청
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }
}

// ============================================
// API 서비스 인스턴스
// ============================================

const apiClient = new ApiClient();

// ============================================
// 인증 API
// ============================================

export const authApi = {
  /**
   * 이메일 로그인
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      data,
    );

    // 토큰 저장
    if (response.success && response.data.tokens) {
      await tokenManager.setTokens(
        response.data.tokens.access_token,
        response.data.tokens.refresh_token,
      );
    }

    return response;
  },

  /**
   * 회원가입
   */
  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.SIGNUP,
      data,
    );

    // 토큰 저장
    if (response.success && response.data.tokens) {
      await tokenManager.setTokens(
        response.data.tokens.access_token,
        response.data.tokens.refresh_token,
      );
    }

    return response;
  },

  /**
   * 로그아웃
   */
  async logout(): Promise<ApiResponse> {
    try {
      const refreshToken = await tokenManager.getRefreshToken();
      if (refreshToken) {
        await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {
          refresh_token: refreshToken,
        });
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // 에러가 발생해도 로컬 토큰은 삭제
      await tokenManager.clearTokens();
    }

    return { success: true, message: "로그아웃되었습니다" };
  },

  /**
   * 토큰 갱신
   */
  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = await tokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error("리프레시 토큰이 없습니다");
    }

    const response = await apiClient.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.REFRESH,
      { refresh_token: refreshToken },
    );

    // 새 토큰 저장
    if (response.success && response.data.tokens) {
      await tokenManager.setTokens(
        response.data.tokens.access_token,
        response.data.tokens.refresh_token,
      );
    }

    return response;
  },
};

// ============================================
// 사용자 API
// ============================================

export const userApi = {
  /**
   * 현재 사용자 정보 조회
   */
  async getMe(): Promise<UserProfileResponse> {
    return apiClient.get<UserProfileResponse>(API_CONFIG.ENDPOINTS.USER.ME);
  },

  /**
   * 프로필 업데이트
   */
  async updateProfile(
    data: UpdateProfileRequest,
  ): Promise<UserProfileResponse> {
    return apiClient.patch<UserProfileResponse>(
      API_CONFIG.ENDPOINTS.USER.UPDATE_PROFILE,
      data,
    );
  },
};

// ============================================
// 경로 API
// ============================================

export const routeApi = {
  /**
   * 경로 이름 수정 → PATCH /api/v1/routes/{route_id}/name
   */
  async updateRouteName(routeId: string, name: string): Promise<ApiResponse> {
    return apiClient.patch<ApiResponse>(`/api/v1/routes/${routeId}/name`, {
      name,
    });
  },

  /**
   * 커스텀 그림 경로 저장
   */
  async saveCustomDrawing(data: {
    name: string;
    svg_path: string;
    location: {
      latitude: number;
      longitude: number;
      address?: string;
    };
    estimated_distance?: number;
  }): Promise<
    ApiResponse<{
      route_id: string;
      name: string;
      svg_path: string;
      estimated_distance?: number;
      created_at: string;
    }>
  > {
    return apiClient.post(API_CONFIG.ENDPOINTS.ROUTES.CUSTOM_DRAWING, data);
  },

  async generateGpsArt(body: {
    route_id?: string;
    shape_id?: string;
    svg_path?: string; // 프리셋인데 DB에 없을 때 전달, 백엔드가 svg_path에 저장
    start?: { lat: number; lng: number };
    target_distance_km: number;
    name?: string;
    enable_rotation?: boolean;
    rotation_angles?: number[] | null;
  }): Promise<{
    routes: Array<{
      id: number;
      angle: number;
      distance_km: number;
      coordinates: Array<{ lat: number; lng: number }>;
      similarity_score: number;
    }>;
    route_id: string;
    option_ids: string[];
    scaled_drawing?: unknown;
    best_angle?: number;
    validation?: unknown;
  }> {
    return apiClient.post(API_CONFIG.ENDPOINTS.ROUTES.GENERATE_GPS_ART, body);
  },

  /** GPS 아트 비동기 생성 시작 (타임아웃 없음). 완료는 getRouteGenerationStatus 폴링으로 확인 */
  async startGpsArtGeneration(body: {
    route_id?: string;
    shape_id?: string;
    svg_path?: string;
    start?: { lat: number; lng: number };
    target_distance_km: number;
    name?: string;
    enable_rotation?: boolean;
    rotation_angles?: number[] | null;
  }): Promise<{ success: boolean; data: { task_id: string } }> {
    return apiClient.post(
      API_CONFIG.ENDPOINTS.ROUTES.GENERATE_GPS_ART_ASYNC,
      body,
    );
  },

  /** 경로 생성 상태 조회 (completed 시 route_id, option_ids 포함) */
  async getRouteGenerationStatus(taskId: string): Promise<{
    task_id: string;
    status: "pending" | "processing" | "completed" | "failed";
    route_id?: string;
    option_ids?: string[];
    progress?: number;
    current_step?: string;
    estimated_remaining?: number;
    error?: string;
  }> {
    const response = await apiClient.get<{
      success: boolean;
      data: {
        task_id: string;
        status: "pending" | "processing" | "completed" | "failed";
        route_id?: string;
        option_ids?: string[];
        progress?: number;
        current_step?: string;
        estimated_remaining?: number;
        error?: string;
      };
    }>(`${API_CONFIG.ENDPOINTS.ROUTES.GENERATE_STATUS}/${taskId}`);
    return response.data;
  },

  async getRouteOptions(routeId: string) {
    return apiClient.get(`/api/v1/routes/${routeId}/options`);
  },

  async getOptionPlaces(routeId: string, optionId: string) {
    return apiClient.get<{
      success: boolean;
      data: {
        places: Array<{
          id: string;
          name: string;
          category: string;
          lat: number;
          lng: number;
        }>;
      };
    }>(`/api/v1/routes/${routeId}/options/${optionId}/places`);
  },

  /**
   * 경로 추천 요청 (GPT + OSMNX)
   */
  async recommendRoute(data: RouteRequest): Promise<RecommendRouteResponse> {
    return apiClient.post<RecommendRouteResponse>(
      API_CONFIG.ENDPOINTS.ROUTES.RECOMMEND,
      data,
    );
  },

  /**
   * 고도 데이터 프리페칭 요청 (백그라운드 수집 시작)
   */
  async prefetchElevation(data: {
    lat: number;
    lng: number;
    radius?: number;
  }): Promise<ApiResponse> {
    return apiClient.post(API_CONFIG.ENDPOINTS.ROUTES.PREFETCH_ELEVATION, {
      ...data,
      radius: data.radius ?? 2000,
    });
  },
};

// ============================================
// 설정 API
// ============================================

export const settingsApi = {
  /**
   * 사용자 설정 조회
   */
  async getSettings(): Promise<
    ApiResponse<{
      dark_mode: boolean;
      language: string;
      push_enabled: boolean;
      workout_reminder: boolean;
      goal_achievement: boolean;
      community_activity: boolean;
      auto_lap: boolean;
      night_safety_mode: boolean;
      auto_night_mode: boolean;
    }>
  > {
    return apiClient.get("/api/v1/users/me/settings");
  },

  /**
   * 사용자 설정 업데이트
   */
  async updateSettings(data: {
    dark_mode?: boolean;
    language?: string;
    push_enabled?: boolean;
    workout_reminder?: boolean;
    goal_achievement?: boolean;
    community_activity?: boolean;
    auto_lap?: boolean;
    night_safety_mode?: boolean;
    auto_night_mode?: boolean;
  }): Promise<
    ApiResponse<{
      dark_mode: boolean;
      language: string;
      push_enabled: boolean;
      workout_reminder: boolean;
      goal_achievement: boolean;
      community_activity: boolean;
      auto_lap: boolean;
      night_safety_mode: boolean;
      auto_night_mode: boolean;
    }>
  > {
    return apiClient.patch("/api/v1/users/me/settings", data);
  },
};

// ============================================
// 운동 API (workouts + workout_splits 테이블)
// ============================================

export const workoutApi = {
  /**
   * 운동 시작 → workouts 테이블에 INSERT
   */
  async startWorkout(data: WorkoutStartRequest): Promise<WorkoutStartResponse> {
    return apiClient.post<WorkoutStartResponse>(
      API_CONFIG.ENDPOINTS.WORKOUTS.START,
      data,
    );
  },

  /**
   * 운동 완료 → workouts UPDATE + workout_splits INSERT
   */
  async completeWorkout(
    workoutId: string,
    data: WorkoutCompleteRequest,
  ): Promise<WorkoutCompleteResponse> {
    return apiClient.post<WorkoutCompleteResponse>(
      `${API_CONFIG.ENDPOINTS.WORKOUTS.COMPLETE}/${workoutId}/complete`,
      data,
    );
  },

  /**
   * 운동 일시정지
   */
  async pauseWorkout(workoutId: string): Promise<ApiResponse> {
    return apiClient.post<ApiResponse>(
      `${API_CONFIG.ENDPOINTS.WORKOUTS.PAUSE}/${workoutId}/pause`,
    );
  },

  /**
   * 운동 재개
   */
  async resumeWorkout(workoutId: string): Promise<ApiResponse> {
    return apiClient.post<ApiResponse>(
      `${API_CONFIG.ENDPOINTS.WORKOUTS.RESUME}/${workoutId}/resume`,
    );
  },

  /**
   * 운동 취소
   */
  async cancelWorkout(workoutId: string): Promise<ApiResponse> {
    return apiClient.delete<ApiResponse>(
      `${API_CONFIG.ENDPOINTS.WORKOUTS.DETAIL}/${workoutId}`,
    );
  },

  /**
   * 현재 진행 중인 운동 상태 조회
   */
  async getCurrentWorkout(): Promise<ApiResponse> {
    return apiClient.get<ApiResponse>(API_CONFIG.ENDPOINTS.WORKOUTS.CURRENT);
  },

  /**
   * 내 운동 기록 목록 조회 → /api/v1/users/me/workouts
   */
  async getWorkoutHistory(params?: {
    page?: number;
    limit?: number;
    sort?: string;
    mode?: string;
  }): Promise<WorkoutListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.sort) queryParams.append("sort", params.sort);
    if (params?.mode) queryParams.append("mode", params.mode);

    const queryString = queryParams.toString();
    const url = `${API_CONFIG.ENDPOINTS.WORKOUTS.HISTORY}${queryString ? `?${queryString}` : ""}`;
    return apiClient.get<WorkoutListResponse>(url);
  },

  /**
   * 운동 상세 조회 → /api/v1/workouts/{workout_id}
   */
  async getWorkoutDetail(workoutId: string): Promise<WorkoutDetailResponse> {
    return apiClient.get<WorkoutDetailResponse>(
      `${API_CONFIG.ENDPOINTS.WORKOUTS.DETAIL}/${workoutId}`,
    );
  },

  /**
   * 운동 기록 삭제 → DELETE /api/v1/workouts/{workout_id}/record
   */
  async deleteWorkoutRecord(workoutId: string): Promise<ApiResponse> {
    return apiClient.delete<ApiResponse>(
      `${API_CONFIG.ENDPOINTS.WORKOUTS.DELETE_RECORD}/${workoutId}/record`,
    );
  },
};

// ============================================
// 저장 경로(북마크) API
// ============================================
export const savedRouteApi = {
  /**
   * 저장한 경로 목록 조회 → /api/v1/users/me/saved-routes
   */
  async getSavedRoutes(params?: {
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<SavedRouteListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.sort) queryParams.append("sort", params.sort);

    const queryString = queryParams.toString();
    const url = `${API_CONFIG.ENDPOINTS.SAVED_ROUTES.LIST}${queryString ? `?${queryString}` : ""}`;
    return apiClient.get<SavedRouteListResponse>(url);
  },

  /**
   * 경로 저장 (북마크) → POST /api/v1/routes/{route_id}/save
   */
  async saveRoute(
    routeId: string,
    routeOptionId?: string,
    name?: string,
  ): Promise<ApiResponse> {
    const body: Record<string, string> = {};
    if (routeOptionId) body.route_option_id = routeOptionId;
    if (name) body.name = name;
    return apiClient.post<ApiResponse>(
      `${API_CONFIG.ENDPOINTS.SAVED_ROUTES.SAVE}/${routeId}/save`,
      Object.keys(body).length > 0 ? body : undefined,
    );
  },

  /**
   * 경로 저장 취소 → DELETE /api/v1/routes/{route_id}/save
   */
  async unsaveRoute(routeId: string): Promise<ApiResponse> {
    return apiClient.delete<ApiResponse>(
      `${API_CONFIG.ENDPOINTS.SAVED_ROUTES.UNSAVE}/${routeId}/save`,
    );
  },
};

// ============================================
// 커뮤니티 API
// ============================================
export const communityApi = {
  /**
   * 피드 조회 → GET /api/v1/community/feed
   */
  async getFeed(params?: {
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.sort) queryParams.append("sort", params.sort);

    const queryString = queryParams.toString();
    const url = `${API_CONFIG.ENDPOINTS.COMMUNITY.FEED}${queryString ? `?${queryString}` : ""}`;
    return apiClient.get<ApiResponse>(url);
  },

  /**
   * 게시물 상세 조회 → GET /api/v1/community/posts/{post_id}
   */
  async getPostDetail(postId: string): Promise<ApiResponse> {
    return apiClient.get<ApiResponse>(
      `${API_CONFIG.ENDPOINTS.COMMUNITY.POSTS}/${postId}`,
    );
  },

  /**
   * 게시물 작성 → POST /api/v1/community/posts
   */
  async createPost(data: {
    workout_id?: string;
    route_name: string;
    shape_id?: string;
    shape_name?: string;
    shape_icon?: string;
    svg_path?: string;
    distance: number;
    duration: number;
    pace?: string;
    calories?: number;
    caption?: string;
    visibility?: string;
    location?: string;
  }): Promise<ApiResponse> {
    return apiClient.post<ApiResponse>(
      API_CONFIG.ENDPOINTS.COMMUNITY.POSTS,
      data,
    );
  },

  /**
   * 좋아요 → POST /api/v1/community/posts/{post_id}/like
   */
  async likePost(postId: string): Promise<ApiResponse> {
    return apiClient.post<ApiResponse>(
      `${API_CONFIG.ENDPOINTS.COMMUNITY.POST_LIKE}/${postId}/like`,
    );
  },

  /**
   * 좋아요 취소 → DELETE /api/v1/community/posts/{post_id}/like
   */
  async unlikePost(postId: string): Promise<ApiResponse> {
    return apiClient.delete<ApiResponse>(
      `${API_CONFIG.ENDPOINTS.COMMUNITY.POST_LIKE}/${postId}/like`,
    );
  },

  /**
   * 북마크 → POST /api/v1/community/posts/{post_id}/bookmark
   */
  async bookmarkPost(postId: string): Promise<ApiResponse> {
    return apiClient.post<ApiResponse>(
      `${API_CONFIG.ENDPOINTS.COMMUNITY.POST_BOOKMARK}/${postId}/bookmark`,
    );
  },

  /**
   * 북마크 취소 → DELETE /api/v1/community/posts/{post_id}/bookmark
   */
  async unbookmarkPost(postId: string): Promise<ApiResponse> {
    return apiClient.delete<ApiResponse>(
      `${API_CONFIG.ENDPOINTS.COMMUNITY.POST_BOOKMARK}/${postId}/bookmark`,
    );
  },

  /**
   * 댓글 작성 → POST /api/v1/community/posts/{post_id}/comments
   */
  async createComment(postId: string, content: string): Promise<ApiResponse> {
    return apiClient.post<ApiResponse>(
      `${API_CONFIG.ENDPOINTS.COMMUNITY.COMMENTS}/${postId}/comments`,
      { content },
    );
  },

  /**
   * 댓글 삭제 → DELETE /api/v1/community/comments/{comment_id}
   */
  async deleteComment(commentId: string): Promise<ApiResponse> {
    return apiClient.delete<ApiResponse>(
      `${API_CONFIG.ENDPOINTS.COMMUNITY.COMMENT_DELETE}/${commentId}`,
    );
  },

  /**
   * 댓글 좋아요 → POST /api/v1/community/comments/{comment_id}/like
   */
  async likeComment(commentId: string): Promise<ApiResponse> {
    return apiClient.post<ApiResponse>(
      `${API_CONFIG.ENDPOINTS.COMMUNITY.COMMENT_LIKE}/${commentId}/like`,
    );
  },

  /**
   * 댓글 좋아요 취소 → DELETE /api/v1/community/comments/{comment_id}/like
   */
  async unlikeComment(commentId: string): Promise<ApiResponse> {
    return apiClient.delete<ApiResponse>(
      `${API_CONFIG.ENDPOINTS.COMMUNITY.COMMENT_LIKE}/${commentId}/like`,
    );
  },
};

// 기본 내보내기
export default apiClient;
