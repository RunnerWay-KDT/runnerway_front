import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Check,
  Clock,
  MapPin,
  Navigation,
  Shield,
  Sparkles,
  Store,
  TrendingUp,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInUp, ZoomIn } from "react-native-reanimated";
import { BottomSheet } from "../../components/BottomSheet";
import { KakaoMap } from "../../components/KakaoMap";
import { PrimaryButton } from "../../components/PrimaryButton";
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Spacing,
} from "../../constants/theme";
import { getIconComponent } from "../../utils/shapeIcons";
import { routeApi } from "@/utils/api";

interface RouteOption {
  id: number;
  name: string;
  distance: string;
  estimatedTime: number;
  safety: number;
  elevation: number;
  lighting: number;
  convenience: number;
  difficulty: string;
  tag: string | null;
  // 경로 옵션 ID 
  optionId?: string;
  // 실제 경로 좌표
  coordinates?: { lat: number; lng: number }[];
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

  // AI 추천 후보 경로 파싱
  const candidates = params.candidates ? JSON.parse(params.candidates as string) : [];

  const generateRouteOptions = (): RouteOption[] => {
    // 1. AI 추천 경로인 경우 (API 응답 데이터 사용)
    if (candidates.length > 0) {
      return candidates.map((candidate: any, index: number) => ({
        id: candidate.id,
        name: candidate.name, // "Route A", "Route B"...
        distance: candidate.distance,
        estimatedTime: candidate.time,
        safety: 90 - (index * 2), // Mock score difference
        elevation: 10 + (index * 5),
        lighting: 85,
        sidewalk: 95,
        convenience: 3,
        difficulty: index === 0 ? "쉬움" : index === 1 ? "보통" : "도전",
        tag: index === 0 ? "추천" : null,
        path: candidate.path // Store path data in option
      }));
    }

    // 2. 쉐이프 기반 경로 생성 (기존 로직)
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
        convenience: 5,
        difficulty: "쉬움",
        tag: fromSaved ? null : "추천"
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
        convenience: 3,
        difficulty: "보통",
        tag: fromSaved ? null : "BEST"
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
        convenience: 2,
        difficulty: "도전",
        tag: null,
      },
    ];
  };

<<<<<<< HEAD
  const routeOptions = generateRouteOptions();
  const [selectedRoute, setSelectedRoute] = useState(routeOptions[0]); 
=======
  const fallbackOptions = generateRouteOptions();
  const [fetchedOptions, setFetchedOptions] = useState<RouteOption[] | null>(null);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const routeOptions = fetchedOptions ?? fallbackOptions;
  const [selectedRoute, setSelectedRoute] = useState(routeOptions[1]);
>>>>>>> master

  const routeId = params.routeId as string | undefined;

  useEffect(() => {
    if (!routeId) {
      setSelectedRoute(fallbackOptions[1]);
      return;
    }
    let cancelled = false;
    setOptionsLoading(true);
    setOptionsError(null);
    routeApi
      .getRouteOptions(routeId)
      .then((res: unknown) => {
        const data = (res as { data?: { options?: Array<{
          id: string;
          option_number: number;
          name: string;
          distance: number;
          estimated_time: number;
          difficulty: string;
          tag: string | null;
          coordinates: Array<{ lat: number; lng: number}>;
          scores?: { safety?: number; elevation?: number; }
        }>}})?.data;
        if (cancelled) return;
        const options = data?.options ?? [];
        if (options.length === 0) {
          setFetchedOptions(null);
          setSelectedRoute(fallbackOptions[1]);
          setOptionsLoading(false);
          return;
        }
        const mapped: RouteOption[] = options.map((opt, idx) => ({
          id: opt.option_number ?? idx + 1,
          name: opt.name,
          distance: `${Number(opt.distance).toFixed(1)}km`,
          estimatedTime: opt.estimated_time ?? 0,
          safety: opt.scores?.safety ?? 0,
          elevation: opt.scores?.elevation ?? 0,
          lighting: (opt.scores as { lighting?: number })?.lighting ?? 0,
          sidewalk: (opt.scores as { sidewalk?: number })?.sidewalk ?? 0,
          convenience: 0,
          difficulty: opt.difficulty ?? "보통",
          tag: opt.tag ?? null,
          optionId: opt.id,
          coordinates: Array.isArray(opt.coordinates)
            ? opt.coordinates.map((c) => ({ lat: Number(c.lat), lng: Number(c.lng) }))
            : undefined,
        }))
        setFetchedOptions(mapped);
        const defaultIndex = 0; // 가장 유사도 높은 top1(1순위)를 미리 선택
        setSelectedRoute(mapped[defaultIndex]);
        setOptionsLoading(false);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setOptionsError((err as Error)?.message ?? "경로 옵션을 불러오지 못했습니다.");
          setFetchedOptions(null);
          setSelectedRoute(fallbackOptions[1]);
          setOptionsLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [routeId]);

  const RouteIcon = getIconComponent(iconName);

  // workout으로 선택한 경로 좌표 넘기기 (실제 경로 좌표가 있으면 그것을 넘기고, 없으면 프리셋 경로 좌표를 넘김)
  const handleStart = () => {
    router.push({
      pathname: "/(screens)/workout",
      params: {
        ...params,
        ...(routeId && selectedRoute.optionId
          ? { routeId, optionId: selectedRoute.optionId }
          : { }),
        selectedRouteId: selectedRoute.id.toString(),
        targetDistance: parseFloat(selectedRoute.distance).toString(),
        routeName: selectedRoute.name,
        ...(selectedRoute.coordinates && selectedRoute.coordinates.length > 0
          ? { routePolyline: JSON.stringify(selectedRoute.coordinates)}
          : { }),
      },
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "쉬움":
      case '짧은 코스':
        return { text: Colors.emerald[400], bg: `${Colors.emerald[500]}20` };
      case "보통":
        return { text: Colors.blue[400], bg: `${Colors.blue[500]}20` };
      case "도전":
      case '긴 코스':
        return { text: Colors.orange[400], bg: `${Colors.orange[500]}20` };
      default:
        return { text: Colors.zinc[400], bg: `${Colors.zinc[500]}20` };
    }
  };

  // 실제 경로가 있으면 polyline+center 전달 
  // → KakaoMap이 setBounds로 전체 경로가 보이게 함
  const mapPolyline = selectedRoute.coordinates && selectedRoute.coordinates.length > 0
  ? selectedRoute.coordinates
  : [];
  // 경로 전체의 기하학적 중심(무게 중심). 인덱스 중간이 아니라 모든 좌표 평균
  const mapCenter = (() => {
    if (mapPolyline.length === 0) return undefined;
    const sumLat = mapPolyline.reduce((s, p) => s + p.lat, 0);
    const sumLng = mapPolyline.reduce((s, p) => s + p.lng, 0);
    const n = mapPolyline.length;
    return { lat: sumLat / n, lng: sumLng / n };
  })();

  return (
    <View style={styles.container}>
      {/* Background Map */}
      <KakaoMap
        key={mapPolyline.length > 0 ? 'path' : 'preset'} 
        routePath={iconName} 
        polyline={mapPolyline} 
        center={mapCenter} 
      />

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
                        <Shield size={12} color={Colors.purple[400]} />
                        <Text style={styles.routeOptionStatText}>
                          안전도 {route.safety}점
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
            </View>

            {/* 주변 편의시설 - half 상태에서도 보이도록 수정 */}
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
