import React from "react";

import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Flame, Heart, MapPin, TrendingUp, User } from "lucide-react-native";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInLeft, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Shadows,
  Spacing,
} from "../../constants/theme";

export default function HomeScreen() {
  const router = useRouter();

  const recommendedRoutes = [
    { name: "한강공원", distance: "5.2km", time: "30분", safety: 95 },
    { name: "올림픽공원", distance: "3.8km", time: "22분", safety: 92 },
    { name: "서울숲", distance: "4.5km", time: "26분", safety: 90 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>러너웨이</Text>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push("/(tabs)/profile")}
        >
          <User size={24} color={Colors.zinc[50]} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>
            오늘은 어떤 운동을 하시겠어요?
          </Text>

          <View style={styles.mainButtonsRow}>
            <TouchableOpacity
              style={styles.mainButton}
              activeOpacity={0.9}
              onPress={() => router.push("/(screens)/running-setup")}
            >
              <LinearGradient
                colors={[Colors.emerald[500], Colors.emerald[600]]}
                style={styles.mainButtonGradient}
              >
                <Flame size={40} color="#fff" />
                <View style={styles.mainButtonTextContainer}>
                  <Text style={styles.mainButtonTitle}>러닝</Text>
                  <Text style={styles.mainButtonSubtitle}>컨디션 맞춤</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mainButton}
              activeOpacity={0.9}
              onPress={() => router.push("/(screens)/walking-setup")}
            >
              <LinearGradient
                colors={[Colors.blue[500], Colors.blue[600]]}
                style={styles.mainButtonGradient}
              >
                <TrendingUp size={40} color="#fff" />
                <View style={styles.mainButtonTextContainer}>
                  <Text style={styles.mainButtonTitle}>산책</Text>
                  <Text style={styles.mainButtonSubtitle}>여유롭게</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.shapeButton}
            activeOpacity={0.9}
            onPress={() => router.push("/(screens)/shape-select")}
          >
            <LinearGradient
              colors={[Colors.pink[500], Colors.purple[500]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shapeButtonGradient}
            >
              <Heart size={32} color="#fff" />
              <View style={styles.shapeButtonTextContainer}>
                <Text style={styles.shapeButtonTitle}>그림 경로 만들기</Text>
                <Text style={styles.shapeButtonSubtitle}>
                  특별한 모양으로 러닝하기
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.savedRouteButton}
            activeOpacity={0.9}
            onPress={() => router.push("/(screens)/route-select")}
          >
            <View style={styles.savedRouteButtonContent}>
              <Heart
                size={24}
                color={Colors.emerald[400]}
                fill={Colors.emerald[400]}
              />
              <View style={styles.savedRouteTextContainer}>
                <Text style={styles.savedRouteTitle}>저장된 경로에서 시작</Text>
                <Text style={styles.savedRouteSubtitle}>
                  내가 저장한 경로 또는 새로 만들기
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.divider} />

        <View style={styles.recommendSection}>
          <View style={styles.recommendHeader}>
            <Text style={styles.recommendTitle}>오늘의 추천 경로</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/community")}>
              <Text style={styles.moreButton}>더보기</Text>
            </TouchableOpacity>
          </View>

          {recommendedRoutes.map((route, index) => (
            <Animated.View
              key={index}
              entering={FadeInLeft.delay(index * 100).duration(400)}
            >
              <TouchableOpacity style={styles.routeCard} activeOpacity={0.8}>
                <View style={styles.routeCardHeader}>
                  <Text style={styles.routeName}>{route.name}</Text>
                  <View style={styles.safetyBadge}>
                    <MapPin size={12} color={Colors.emerald[400]} />
                    <Text style={styles.safetyText}>
                      안전도 {route.safety}%
                    </Text>
                  </View>
                </View>
                <View style={styles.routeCardInfo}>
                  <Text style={styles.routeInfoText}>{route.distance}</Text>
                  <Text style={styles.routeInfoDot}>•</Text>
                  <Text style={styles.routeInfoText}>{route.time}</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.zinc[950],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.zinc[800],
  },
  headerTitle: {
    fontSize: FontSize["2xl"],
    fontWeight: FontWeight.bold,
    color: Colors.zinc[50],
  },
  profileButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  scrollContent: {
    paddingBottom: Spacing["2xl"],
  },
  section: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize["2xl"],
    fontWeight: FontWeight.bold,
    color: Colors.zinc[50],
    marginBottom: Spacing.lg,
  },
  mainButtonsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  mainButton: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: BorderRadius["2xl"],
    overflow: "hidden",
    ...Shadows.lg,
  },
  mainButtonGradient: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: "flex-end",
  },
  mainButtonTextContainer: {
    marginTop: Spacing.md,
  },
  mainButtonTitle: {
    fontSize: FontSize["2xl"],
    fontWeight: FontWeight.bold,
    color: "#fff",
  },
  mainButtonSubtitle: {
    fontSize: FontSize.sm,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  shapeButton: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    ...Shadows.lg,
  },
  shapeButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  shapeButtonTextContainer: {
    flex: 1,
  },
  shapeButtonTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: "#fff",
  },
  shapeButtonSubtitle: {
    fontSize: FontSize.sm,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  savedRouteButton: {
    marginTop: Spacing.md,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.zinc[900],
    borderWidth: 2,
    borderColor: Colors.emerald[500] + "30",
    overflow: "hidden",
  },
  savedRouteButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  savedRouteTextContainer: {
    flex: 1,
  },
  savedRouteTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.zinc[100],
  },
  savedRouteSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.zinc[500],
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.zinc[800],
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
  },
  recommendSection: {
    paddingHorizontal: Spacing.lg,
  },
  recommendHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  recommendTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.zinc[50],
  },
  moreButton: {
    fontSize: FontSize.sm,
    color: Colors.emerald[500],
  },
  routeCard: {
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  routeCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  routeName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.zinc[50],
  },
  safetyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  safetyText: {
    fontSize: FontSize.xs,
    color: Colors.emerald[400],
  },
  routeCardInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  routeInfoText: {
    fontSize: FontSize.sm,
    color: Colors.zinc[400],
  },
  routeInfoDot: {
    color: Colors.zinc[400],
  },
});
