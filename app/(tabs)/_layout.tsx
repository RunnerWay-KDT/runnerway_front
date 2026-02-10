import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";
import { Home, Users, User } from "lucide-react-native";
import { Colors } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";

export default function TabLayout() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.emerald[500],
        tabBarInactiveTintColor: Colors.zinc[500],
        tabBarStyle: {
          backgroundColor: Colors.zinc[900],
          borderTopColor: Colors.zinc[800],
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: "커뮤니티",
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "마이",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
