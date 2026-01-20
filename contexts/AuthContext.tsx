import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  loginWithSocial: (provider: string) => Promise<{ success: boolean }>;
  signup: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ success: boolean }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "runnerway_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const savedUser = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Failed to load user from storage:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveUserToStorage = async (userData: User) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error("Failed to save user to storage:", error);
    }
  };

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean }> => {
    // 실제 앱에서는 API 호출
    const userData: User = {
      id: "1",
      email: email,
      name: email.split("@")[0],
      avatar: null,
      stats: {
        totalDistance: 142.5,
        totalWorkouts: 24,
        completedRoutes: 18,
      },
    };

    setUser(userData);
    await saveUserToStorage(userData);
    return { success: true };
  };

  const loginWithSocial = async (
    provider: string,
  ): Promise<{ success: boolean }> => {
    // 실제 앱에서는 OAuth 처리
    const userData: User = {
      id: "1",
      email: `user@${provider}.com`,
      name: `${provider} User`,
      avatar: null,
      provider: provider,
      stats: {
        totalDistance: 142.5,
        totalWorkouts: 24,
        completedRoutes: 18,
      },
    };

    setUser(userData);
    await saveUserToStorage(userData);
    return { success: true };
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
  ): Promise<{ success: boolean }> => {
    // 실제 앱에서는 API 호출
    const userData: User = {
      id: "1",
      email: email,
      name: name,
      avatar: null,
      stats: {
        totalDistance: 0,
        totalWorkouts: 0,
        completedRoutes: 0,
      },
    };

    setUser(userData);
    await saveUserToStorage(userData);
    return { success: true };
  };

  const logout = async () => {
    setUser(null);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to remove user from storage:", error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    loginWithSocial,
    signup,
    logout,
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
