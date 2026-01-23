import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Check,
  Clock,
  MapPin,
  Navigation,
  Shield,
  Sparkles,
  Star,
  Store,
  TrendingUp,
  Users,
} from "lucide-react-native";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp, ZoomIn } from "react-native-reanimated";
import { BottomSheet } from "../../components/BottomSheet";
import { MapMock } from "../../components/MapMock";
import { PrimaryButton } from "../../components/PrimaryButton";
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Spacing,
} from "../../constants/theme";
import { getIconComponent } from "../../utils/shapeIcons";

interface RouteOption {
  id: number;
  name: string;
  distance: string;
  estimatedTime: number;
  safety: number;
  elevation: number;
  lighting: number;
  sidewalk: number;
  convenience: number;
  rating: number;
  runners: number;
  difficulty: string;
  tag: string | null;
}

export default function RoutePreviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [sheetState, setSheetState] = useState<
    "collapsed" | "half" | "expanded"
  >("half");

  const isCustomDrawing = params.mode === "custom";
  const fromSaved = params.fromSaved === "true";
  const iconName =
    (params.shapeIconName as string) || (params.shapeId as string) || "heart";
  const shapeName = (params.shapeName as string) || "하트";
  const savedRouteName = params.routeName as string;

  const generateRouteOptions = (): RouteOption[] => {
    const baseDistance = parseFloat(
      (params.shapeDistance as string) || (params.distance as string) || "4.2",
    );

    return [
      {
        id: 1,
        name:
          fromSaved && savedRouteName ? savedRouteName : `${shapeName} 경로 A`,
        distance: `${(baseDistance * 0.8).toFixed(1)}km`,
        estimatedTime: Math.round(baseDistance * 0.8 * 7),
        safety: 95,
        elevation: 10,
        lighting: 92,
        sidewalk: 96,
        convenience: 5,
        rating: 4.9,
        runners: 203,
        difficulty: "쉬움",
        tag: fromSaved ? null : "추천",
      },
      {
        id: 2,
        name:
          fromSaved && savedRouteName
            ? `${savedRouteName} - 대체 경로`
            : `${shapeName} 경로 B`,
        distance: `${baseDistance.toFixed(1)}km`,
        estimatedTime: Math.round(baseDistance * 7),
        safety: 88,
        elevation: 12,
        lighting: 87,
        sidewalk: 92,
        convenience: 3,
        rating: 4.8,
        runners: 142,
        difficulty: "보통",
        tag: fromSaved ? null : "BEST",
      },
      {
        id: 3,
        name:
          fromSaved && savedRouteName
            ? `${savedRouteName} - 긴 코스`
            : `${shapeName} 경로 C`,
        distance: `${(baseDistance * 1.2).toFixed(1)}km`,
        estimatedTime: Math.round(baseDistance * 1.2 * 7),
        safety: 84,
        elevation: 18,
        lighting: 80,
        sidewalk: 85,
        convenience: 2,
        rating: 4.5,
        runners: 98,
        difficulty: "도전",
        tag: null,
      },
    ];
  };

  const routeOptions = generateRouteOptions();
  const [selectedRoute, setSelectedRoute] = useState(routeOptions[1]);

  const RouteIcon = getIconComponent(iconName);

  const handleStart = () => {
    router.push({
      pathname: "/(screens)/workout",
      params: {
        ...params,
        selectedRouteId: selectedRoute.id.toString(),
        targetDistance: parseFloat(selectedRoute.distance).toString(),
        routeName: selectedRoute.name,
      },
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "쉬움":
        return { text: Colors.emerald[400], bg: `${Colors.emerald[500]}20` };
      case "보통":
        return { text: Colors.blue[400], bg: `${Colors.blue[500]}20` };
      case "도전":
        return { text: Colors.orange[400], bg: `${Colors.orange[500]}20` };
      default:
        return { text: Colors.zinc[400], bg: `${Colors.zinc[500]}20` };
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Map */}
      <MapMock routePath={iconName} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={Colors.zinc[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {fromSaved ? "저장된 경로" : "경로 선택"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Bottom Sheet */}
      <BottomSheet onStateChange={setSheetState}>
        {/* Selected Route Info */}
        <Animated.View entering={FadeInUp.duration(300)}>
          <View style={styles.routeHeader}>
            <View
              style={[
                styles.routeIconContainer,
                {
                  backgroundColor: isCustomDrawing
                    ? `${Colors.purple[500]}20`
                    : `${Colors.emerald[500]}20`,
                },
              ]}
            >
              {isCustomDrawing ? (
                <Sparkles size={24} color={Colors.purple[400]} />
              ) : (
                <RouteIcon size={24} color={Colors.emerald[400]} />
              )}
            </View>
            <View style={styles.routeInfo}>
              <View style={styles.routeNameRow}>
                <Text style={styles.routeName}>{selectedRoute.name}</Text>
                {selectedRoute.tag && (
                  <View
                    style={[
                      styles.routeTag,
                      {
                        backgroundColor:
                          selectedRoute.tag === "BEST"
                            ? `${Colors.emerald[500]}20`
                            : `${Colors.blue[500]}20`,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.routeTagText,
                        {
                          color:
                            selectedRoute.tag === "BEST"
                              ? Colors.emerald[400]
                              : Colors.blue[400],
                        },
                      ]}
                    >
                      {selectedRoute.tag}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.routeLocation}>현재 위치 주변</Text>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <MapPin size={20} color={Colors.emerald[400]} />
              <Text style={styles.statValue}>
                {selectedRoute.distance.replace("km", "")}
              </Text>
              <Text style={styles.statLabel}>km</Text>
            </View>
            <View style={styles.statCard}>
              <Clock size={20} color={Colors.blue[400]} />
              <Text style={styles.statValue}>
                {selectedRoute.estimatedTime}
              </Text>
              <Text style={styles.statLabel}>분</Text>
            </View>
            <View style={styles.statCard}>
              <Shield size={20} color={Colors.purple[400]} />
              <Text style={styles.statValue}>{selectedRoute.safety}</Text>
              <Text style={styles.statLabel}>점</Text>
            </View>
          </View>
        </Animated.View>

        {/* Route Options */}
        {(sheetState === "half" || sheetState === "expanded") && (
          <Animated.View entering={FadeInUp.delay(100).duration(300)}>
            <View style={styles.divider} />

            <View style={styles.sectionHeader}>
              <TrendingUp size={16} color={Colors.emerald[400]} />
              <Text style={styles.sectionTitle}>다른 경로 옵션</Text>
            </View>

            {routeOptions.map((route) => {
              const difficultyStyle = getDifficultyColor(route.difficulty);
              const isSelected = selectedRoute.id === route.id;

              return (
                <TouchableOpacity
                  key={route.id}
                  onPress={() => setSelectedRoute(route)}
                  style={[
                    styles.routeOption,
                    isSelected && styles.routeOptionSelected,
                  ]}
                  activeOpacity={0.7}
                >
                  <View style={styles.routeOptionContent}>
                    <View style={styles.routeOptionHeader}>
                      <Text style={styles.routeOptionName}>{route.name}</Text>
                      {route.tag && (
                        <View
                          style={[
                            styles.routeTag,
                            {
                              backgroundColor:
                                route.tag === "BEST"
                                  ? `${Colors.emerald[500]}20`
                                  : `${Colors.blue[500]}20`,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.routeTagText,
                              {
                                color:
                                  route.tag === "BEST"
                                    ? Colors.emerald[400]
                                    : Colors.blue[400],
                              },
                            ]}
                          >
                            {route.tag}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.routeOptionMeta}>
                      <Text style={styles.routeOptionMetaText}>
                        {route.distance}
                      </Text>
                      <Text style={styles.routeOptionMetaDot}>•</Text>
                      <Text style={styles.routeOptionMetaText}>
                        {route.estimatedTime}분
                      </Text>
                      <Text style={styles.routeOptionMetaDot}>•</Text>
                      <View
                        style={[
                          styles.difficultyBadge,
                          { backgroundColor: difficultyStyle.bg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.difficultyText,
                            { color: difficultyStyle.text },
                          ]}
                        >
                          {route.difficulty}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.routeOptionStats}>
                      <View style={styles.routeOptionStat}>
                        <Star size={12} color={Colors.amber[400]} />
                        <Text style={styles.routeOptionStatText}>
                          {route.rating}
                        </Text>
                      </View>
                      <View style={styles.routeOptionStat}>
                        <Users size={12} color={Colors.blue[400]} />
                        <Text style={styles.routeOptionStatText}>
                          {route.runners}명
                        </Text>
                      </View>
                      <View style={styles.routeOptionStat}>
                        <Shield size={12} color={Colors.purple[400]} />
                        <Text style={styles.routeOptionStatText}>
                          {route.safety}점
                        </Text>
                      </View>
                    </View>
                  </View>
                  {isSelected && (
                    <Animated.View
                      entering={ZoomIn.duration(200)}
                      style={styles.checkMark}
                    >
                      <Check size={16} color="#fff" />
                    </Animated.View>
                  )}
                </TouchableOpacity>
              );
            })}

            {/* Route Features */}
            <View style={styles.sectionHeader}>
              <Navigation size={16} color={Colors.emerald[400]} />
              <Text style={styles.sectionTitle}>선택된 경로 특징</Text>
            </View>

            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <View
                  style={[
                    styles.featureDot,
                    { backgroundColor: Colors.emerald[400] },
                  ]}
                />
                <Text style={styles.featureText}>
                  평탄한 코스 (고도차 {selectedRoute.elevation}m)
                </Text>
              </View>
              <View style={styles.featureItem}>
                <View
                  style={[
                    styles.featureDot,
                    { backgroundColor: Colors.blue[400] },
                  ]}
                />
                <Text style={styles.featureText}>
                  가로등 밝음 ({selectedRoute.lighting}% 조명)
                </Text>
              </View>
              <View style={styles.featureItem}>
                <View
                  style={[
                    styles.featureDot,
                    { backgroundColor: Colors.purple[400] },
                  ]}
                />
                <Text style={styles.featureText}>
                  인도 완비 구간 {selectedRoute.sidewalk}%
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Expanded Content */}
        {sheetState === "expanded" && (
          <Animated.View entering={FadeInUp.delay(200).duration(300)}>
            <View style={styles.divider} />

            <View style={styles.sectionHeader}>
              <Store size={16} color={Colors.amber[400]} />
              <Text style={styles.sectionTitle}>주변 편의시설</Text>
            </View>

            <View style={styles.facilityGrid}>
              <View style={styles.facilityCard}>
                <Text style={styles.facilityLabel}>편의점</Text>
                <Text style={styles.facilityValue}>
                  {selectedRoute.convenience}곳
                </Text>
              </View>
              <View style={styles.facilityCard}>
                <Text style={styles.facilityLabel}>화장실</Text>
                <Text style={styles.facilityValue}>
                  {Math.ceil(selectedRoute.convenience / 2)}곳
                </Text>
              </View>
              <View style={styles.facilityCard}>
                <Text style={styles.facilityLabel}>음수대</Text>
                <Text style={styles.facilityValue}>
                  {selectedRoute.convenience + 2}곳
                </Text>
              </View>
              <View style={styles.facilityCard}>
                <Text style={styles.facilityLabel}>CCTV</Text>
                <Text style={styles.facilityValue}>
                  {Math.round(selectedRoute.safety / 5)}대
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <PrimaryButton onPress={handleStart}>
            이 경로로 운동 시작
          </PrimaryButton>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>다른 경로 생성하기</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.zinc[950],
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.zinc[50],
  },
  routeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  routeIconContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  routeInfo: {
    flex: 1,
  },
  routeNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  routeName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.zinc[50],
  },
  routeTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  routeTagText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  routeLocation: {
    fontSize: FontSize.sm,
    color: Colors.zinc[400],
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: `${Colors.zinc[800]}50`,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    alignItems: "center",
  },
  statValue: {
    fontSize: FontSize["2xl"],
    fontWeight: FontWeight.bold,
    color: Colors.zinc[50],
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.zinc[500],
  },
  divider: {
    height: 1,
    backgroundColor: Colors.zinc[800],
    marginVertical: Spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.zinc[50],
  },
  routeOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    backgroundColor: `${Colors.zinc[800]}30`,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.zinc[800],
    marginBottom: Spacing.sm,
  },
  routeOptionSelected: {
    backgroundColor: `${Colors.emerald[500]}10`,
    borderColor: `${Colors.emerald[500]}50`,
  },
  routeOptionContent: {
    flex: 1,
  },
  routeOptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  routeOptionName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.zinc[50],
  },
  routeOptionMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  routeOptionMetaText: {
    fontSize: FontSize.sm,
    color: Colors.zinc[400],
  },
  routeOptionMetaDot: {
    color: Colors.zinc[600],
  },
  difficultyBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  difficultyText: {
    fontSize: FontSize.xs,
  },
  routeOptionStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  routeOptionStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  routeOptionStatText: {
    fontSize: FontSize.xs,
    color: Colors.zinc[300],
  },
  checkMark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.emerald[500],
    justifyContent: "center",
    alignItems: "center",
  },
  featureList: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  featureText: {
    fontSize: FontSize.sm,
    color: Colors.zinc[300],
  },
  facilityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  facilityCard: {
    width: "48%",
    backgroundColor: `${Colors.zinc[800]}50`,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  facilityLabel: {
    fontSize: FontSize.sm,
    color: Colors.zinc[400],
    marginBottom: Spacing.xs,
  },
  facilityValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.zinc[50],
  },
  actionContainer: {
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  secondaryButton: {
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: FontSize.base,
    color: Colors.zinc[400],
  },
});
