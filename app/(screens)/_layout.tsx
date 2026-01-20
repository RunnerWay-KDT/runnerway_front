import { Stack } from "expo-router";
import { Colors } from "../../constants/theme";

export default function ScreensLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.zinc[950] },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="running-setup" />
      <Stack.Screen name="walking-setup" />
      <Stack.Screen name="shape-select" />
      <Stack.Screen name="generating" />
      <Stack.Screen name="route-preview" />
      <Stack.Screen name="workout" />
      <Stack.Screen name="result" />
    </Stack>
  );
}
