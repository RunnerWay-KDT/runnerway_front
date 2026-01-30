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
} from "../types/api";

// ============================================
// 토큰 저장소 키
// ============================================
const ACCESS_TOKEN_KEY = "runnerway_access_token";
const REFRESH_TOKEN_KEY = "runnerway_refresh_token";

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

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    console.log("🌐 API Base URL:", this.baseURL);
  }

  /**
   * API 요청을 보내는 기본 메서드
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
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

    // 인증 토큰 추가 (로그인/회원가입 제외)
    if (
      !endpoint.includes("/auth/login") &&
      !endpoint.includes("/auth/signup")
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

        // 401 에러인 경우 특별 처리
        if (response.status === 401) {
          console.error("🚫 인증 실패 - 토큰이 유효하지 않거나 만료되었습니다");
          // 토큰 삭제 (선택적)
          // await tokenManager.clearTokens();
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
};

// 기본 내보내기
export default apiClient;
