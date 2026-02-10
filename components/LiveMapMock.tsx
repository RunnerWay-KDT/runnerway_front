import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Colors } from "../constants/theme";

interface LiveMapMockProps {
  routePath?: string;
  customDrawing?: string | null;
  progress?: number;
}

const { width, height } = Dimensions.get("window");

export function LiveMapMock({
  routePath = "heart",
  customDrawing = null,
  progress = 0,
}: LiveMapMockProps) {
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.5);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(2, { duration: 1000 }),
        withTiming(1, { duration: 0 }),
      ),
      -1,
    );
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1000 }),
        withTiming(0.5, { duration: 0 }),
      ),
      -1,
    );
  }, [pulseScale, pulseOpacity]);

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  // 현재 위치 계산 (progress 기반으로 원형 경로 상의 위치)
  const angle = progress * Math.PI * 2;
  const radius = Math.min(width, height) * 0.2;
  const centerX = width / 2;
  const centerY = height / 2;
  const currentX = centerX + Math.cos(angle - Math.PI / 2) * radius;
  const currentY = centerY + Math.sin(angle - Math.PI / 2) * radius;

  return (
    <View style={styles.container}>
      {/* 배경 그리드 */}
      <View style={styles.grid}>
        {[...Array(20)].map((_, i) => (
          <View
            key={`h-${i}`}
            style={[styles.gridLineHorizontal, { top: i * 40 }]}
          />
        ))}
        {[...Array(15)].map((_, i) => (
          <View
            key={`v-${i}`}
            style={[styles.gridLineVertical, { left: i * 40 }]}
          />
        ))}
      </View>

      {/* 주요 도로 */}
      <View
        style={[
          styles.mainRoad,
          { top: height * 0.3, left: 0, right: 0, height: 3 },
        ]}
      />
      <View
        style={[
          styles.mainRoad,
          { left: width * 0.4, top: 0, bottom: 0, width: 3 },
        ]}
      />

      {/* 경로 표시 */}
      <View style={styles.routeContainer}>
        <View style={styles.routeIndicator}>
          <Text style={styles.routeEmoji}>
            {routePath === "heart"
              ? "❤️"
              : routePath === "star"
              ? "⭐"
              : routePath === "coffee"
              ? "☕"
              : routePath === "dog"
              ? "🐕"
              : routePath === "cat"
              ? "🐱"
              : routePath === "smile"
              ? "😊"
              : "❤️"}
          </Text>
        </View>

        {/* 진행 표시 */}
        <View
          style={[styles.progressOverlay, { width: `${progress * 100}%` }]}
        />
      </View>

      {/* 현재 위치 마커 */}
      <View
        style={[
          styles.currentPositionContainer,
          { left: currentX - 15, top: currentY - 15 },
        ]}
      >
        <Animated.View style={[styles.pulse, pulseAnimatedStyle]} />
        <View style={styles.currentMarker} />
      </View>

      {/* 지도 컨트롤 */}
      <View style={styles.mapControls}>
        <TouchableOpacity style={styles.controlButton}>
          <Text style={styles.controlText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton}>
          <Text style={styles.controlText}>−</Text>
        </TouchableOpacity>
      </View>

      {/* 현재 위치로 이동 버튼 */}
      <TouchableOpacity style={styles.locationButton}>
        <View style={styles.locationDot} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#1a1a1a",
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineHorizontal: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#2a2a2a",
  },
  gridLineVertical: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "#2a2a2a",
  },
  mainRoad: {
    position: "absolute",
    backgroundColor: "#3a3a3a",
  },
  routeContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  routeIndicator: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "rgba(74, 74, 74, 0.3)",
    borderRadius: 100,
  },
  routeEmoji: {
    fontSize: 60,
    opacity: 0.5,
  },
  progressOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  currentPositionContainer: {
    position: "absolute",
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  pulse: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.blue[500],
  },
  currentMarker: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.blue[500],
    borderWidth: 3,
    borderColor: "#fff",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
    elevation: 5,
  },
  mapControls: {
    position: "absolute",
    top: 100,
    right: 16,
    gap: 8,
  },
  controlButton: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    elevation: 3,
    marginBottom: 8,
  },
  controlText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  locationButton: {
    position: "absolute",
    bottom: 200,
    right: 16,
    width: 48,
    height: 48,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    elevation: 3,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.blue[500],
    borderWidth: 2,
    borderColor: "#fff",
  },
});
