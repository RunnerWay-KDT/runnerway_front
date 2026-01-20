import React from "react";
import { View, StyleSheet, Dimensions, Text } from "react-native";

interface MapMockProps {
  routePath?: string;
  customDrawing?: string | null;
}

const { width, height } = Dimensions.get("window");

export function MapMock({ routePath = "heart" }: MapMockProps) {
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

      {/* 경로 표시 (간단한 SVG 대체) */}
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
          <Text style={styles.routeText}>경로 미리보기</Text>
        </View>
      </View>

      {/* 시작 마커 */}
      <View style={styles.startMarker}>
        <Text style={styles.markerText}>S</Text>
      </View>
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
  },
  routeIndicator: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  routeEmoji: {
    fontSize: 80,
    marginBottom: 12,
  },
  routeText: {
    color: "#10b981",
    fontSize: 16,
    fontWeight: "600",
  },
  startMarker: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -15,
    marginTop: -15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  markerText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
