import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { Colors } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";

export default function ScreensLayout() {
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
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.zinc[950] },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="location-setup" />
      <Stack.Screen name="running-setup" />
      <Stack.Screen name="walking-setup" />
      <Stack.Screen name="route-select" />
      <Stack.Screen name="shape-select" />
      <Stack.Screen name="drawing-setup" />
      <Stack.Screen name="generating" />
      <Stack.Screen name="route-preview" />
      <Stack.Screen name="workout" />
      <Stack.Screen name="result" />
      <Stack.Screen name="profile-edit" />
      <Stack.Screen name="safety-settings" />
      <Stack.Screen name="saved-routes" />
      <Stack.Screen name="workout-history" />
    </Stack>
  );
}
