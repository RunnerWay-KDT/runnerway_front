import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { authApi, userApi, tokenManager } from "../utils/api";

interface UserStats {
  totalDistance: number;
  totalWorkouts: number;
  completedRoutes: number;
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
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "runnerway_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
                  completedRoutes: response.data.stats.completed_routes,
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
            completedRoutes: response.data.user.stats.completed_routes,
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
            completedRoutes: response.data.user.stats.completed_routes,
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
            completedRoutes: response.data.stats.completed_routes,
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

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    logout,
    updateProfile,
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
