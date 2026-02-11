import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState, AppStateStatus } from "react-native";
import {
  authApi,
  userApi,
  tokenManager,
  setUnauthorizedCallback,
} from "../utils/api";

interface UserStats {
  totalDistance: number;
  totalWorkouts: number;
  savedRoutesCount: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  provider?: string;
  stats: UserStats;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean }>;
  signup: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ success: boolean }>;
  logout: () => Promise<void>;
  updateProfile: (data: {
    name?: string;
    avatar?: string | null;
  }) => Promise<void>;
  refreshUserData: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "runnerway_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const appState = useRef(AppState.currentState);

  // 강제 로그아웃 처리 (토큰 문제 발생 시)
  const forceLogout = useCallback(async () => {
    console.log("� 강제 로그아웃 수행");
    setUser(null);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      await tokenManager.clearTokens();
    } catch (error) {
      console.error("Failed to clear user data:", error);
    }
  }, []);

  // 토큰 유효성 검증 (서버에 /users/me 호출로 확인)
  const verifyToken = useCallback(async () => {
    try {
      const token = await tokenManager.getAccessToken();
      if (!token) {
        // 토큰이 없으면 로그아웃 상태
        if (user) {
          await forceLogout();
        }
        return;
      }

      // 서버에 토큰 유효성 확인
      const response = await userApi.getMe();
      if (response.success && response.data) {
        // 토큰 유효 - 사용자 정보 갱신
        const userData: User = {
          id: response.data.id,
          email: response.data.email,
          name: response.data.name,
          avatar: response.data.avatar_url,
          provider: response.data.provider || undefined,
          stats: {
            totalDistance: response.data.stats.total_distance,
            totalWorkouts: response.data.stats.total_workouts,
            savedRoutesCount: response.data.stats.saved_routes_count,
          },
        };
        setUser(userData);
        await saveUserToStorage(userData);
      }
    } catch (error) {
      console.error("🔐 토큰 검증 실패 - 로그아웃 처리:", error);
      await forceLogout();
    }
  }, [user, forceLogout]);

  // 토큰 만료 시 자동 로그아웃 처리
  useEffect(() => {
    const handleUnauthorized = async () => {
      console.log("🔐 토큰 인증 실패 감지 - 자동 로그아웃 수행");
      await forceLogout();
    };

    // API 클라이언트에 콜백 등록
    setUnauthorizedCallback(handleUnauthorized);
  }, [forceLogout]);

  // 앱이 포그라운드로 돌아올 때 토큰 검증
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          console.log("📱 앱 포그라운드 복귀 - 토큰 검증 시작");
          verifyToken();
        }
        appState.current = nextAppState;
      },
    );

    return () => {
      subscription.remove();
    };
  }, [verifyToken]);

  const saveUserToStorage = async (userData: User) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error("Failed to save user to storage:", error);
    }
  };

  const loadUserFromStorage = async () => {
    try {
      const savedUser = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        // 저장된 사용자 정보가 없지만 토큰이 있다면 사용자 정보 가져오기
        const token = await tokenManager.getAccessToken();
        if (token) {
          try {
            const response = await userApi.getMe();
            if (response.success && response.data) {
              const userData: User = {
                id: response.data.id,
                email: response.data.email,
                name: response.data.name,
                avatar: response.data.avatar_url,
                provider: response.data.provider || undefined,
                stats: {
                  totalDistance: response.data.stats.total_distance,
                  totalWorkouts: response.data.stats.total_workouts,
                  savedRoutesCount: response.data.stats.saved_routes_count,
                },
              };
              setUser(userData);
              await saveUserToStorage(userData);
            }
          } catch (error) {
            console.error("Failed to fetch user info:", error);
            // 토큰이 유효하지 않으면 삭제
            await tokenManager.clearTokens();
          }
        }
      }
    } catch (error) {
      console.error("Failed to load user from storage:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserFromStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean }> => {
    try {
      const response = await authApi.login({ email, password });

      if (response.success && response.data) {
        // 사용자 정보를 로컬 형식으로 변환
        const userData: User = {
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
          avatar: response.data.user.avatar_url,
          provider: response.data.user.provider || undefined,
          stats: {
            totalDistance: response.data.user.stats.total_distance,
            totalWorkouts: response.data.user.stats.total_workouts,
            savedRoutesCount: response.data.user.stats.saved_routes_count,
          },
        };

        setUser(userData);
        await saveUserToStorage(userData);
        return { success: true };
      }

      return { success: false };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false };
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
  ): Promise<{ success: boolean }> => {
    try {
      const response = await authApi.signup({ email, password, name });

      if (response.success && response.data) {
        // 사용자 정보를 로컬 형식으로 변환
        const userData: User = {
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
          avatar: response.data.user.avatar_url,
          provider: response.data.user.provider || undefined,
          stats: {
            totalDistance: response.data.user.stats.total_distance,
            totalWorkouts: response.data.user.stats.total_workouts,
            savedRoutesCount: response.data.user.stats.saved_routes_count,
          },
        };

        setUser(userData);
        await saveUserToStorage(userData);
        return { success: true };
      }

      return { success: false };
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      try {
        await AsyncStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error("Failed to remove user from storage:", error);
      }
    }
  };

  const updateProfile = async (data: {
    name?: string;
    avatar?: string | null;
  }) => {
    if (!user) return;

    try {
      const response = await userApi.updateProfile({
        name: data.name,
        avatar_url: data.avatar,
      });

      if (response.success && response.data) {
        const updatedUser: User = {
          id: response.data.id,
          email: response.data.email,
          name: response.data.name,
          avatar: response.data.avatar_url,
          provider: response.data.provider || undefined,
          stats: {
            totalDistance: response.data.stats.total_distance,
            totalWorkouts: response.data.stats.total_workouts,
            savedRoutesCount: response.data.stats.saved_routes_count,
          },
        };

        setUser(updatedUser);
        await saveUserToStorage(updatedUser);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  };

  /** 사용자 데이터 새로고침 (통계 업데이트 등) */
  const refreshUserData = async () => {
    if (!user) return;

    try {
      const response = await userApi.getMe();
      if (response.success && response.data) {
        const updatedUser: User = {
          id: response.data.id,
          email: response.data.email,
          name: response.data.name,
          avatar: response.data.avatar_url,
          provider: response.data.provider || undefined,
          stats: {
            totalDistance: response.data.stats.total_distance,
            totalWorkouts: response.data.stats.total_workouts,
            savedRoutesCount: response.data.stats.saved_routes_count,
          },
        };

        setUser(updatedUser);
        await saveUserToStorage(updatedUser);
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    logout,
    updateProfile,
    refreshUserData,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
