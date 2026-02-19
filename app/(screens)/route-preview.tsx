import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Check,
  Clock,
  Info,
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
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInUp, ZoomIn } from "react-native-reanimated";
import { BottomSheet } from "../../components/BottomSheet";
import { KakaoMap } from "../../components/KakaoMap";
import { PrimaryButton } from "../../components/PrimaryButton";
import { SvgPathIcon } from "../../components/SvgPathIcon";
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Spacing,
} from "../../constants/theme";
import { getPresetSvgPath } from "../../constants/presetShapes";
import { routeApi } from "@/utils/api";

interface RouteOption {
  id: number;
  name: string;
  distance: string;
  estimatedTime: number;
  safety: number;
  elevation: number;
  lighting: number;
  cafeCount?: number;
  convenienceCount?: number;
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
  const [safetyInfoVisible, setSafetyInfoVisible] = useState(false);

  const isCustomDrawing = params.mode === "custom";
  const fromSaved = params.fromSaved === "true";
  const iconName =
    (params.shapeIconName as string) || (params.shapeId as string) || "heart";
  const shapeName = (params.shapeName as string) || "하트";
  const savedRouteName = params.routeName as string;
  const svgPath = params.svgPath as string | undefined;

  const generateRouteOptions = (): RouteOption[] => {
    const baseDistance = parseFloat(
      (params.targetDistanceKm as string) ||
        (params.shapeDistance as string) ||
        (params.distance as string) ||
        "4.2",
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
        convenienceCount: 5,
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
        convenienceCount: 3,
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
        convenienceCount: 2,
        difficulty: "도전",
        tag: null,
      },
    ];
  };

  const fallbackOptions = generateRouteOptions();
  const [fetchedOptions, setFetchedOptions] = useState<RouteOption[] | null>(
    null,
  );
  const [optionsLoading, setOptionsLoading] = useState(!!params.routeId);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const routeId = params.routeId as string | undefined;

  // routeId가 있으면(저장 경로에서 진입) API 로드 전에 목업을 보여주지 않는다
  const routeOptions = fetchedOptions ?? (routeId ? [] : fallbackOptions);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(
    routeId ? null : fallbackOptions[1],
  );

  const [optionPlaces, setOptionPlaces] = useState<
    { lat: number; lng: number; name: string; category: string }[]
  >([]);

  useEffect(() => {
    if (!routeId || !selectedRoute?.optionId) {
      setOptionPlaces([]);
      return;
    }
    let cancelled = false;
    routeApi
      .getOptionPlaces(routeId, selectedRoute.optionId)
      .then((res: unknown) => {
        if (cancelled) return;
        const data = (
          res as {
            data?: {
              places?: Array<{
                lat: number;
                lng: number;
                name: string;
                category: string;
              }>;
            };
          }
        )?.data;
        setOptionPlaces(data?.places ?? []);
      })
      .catch(() => setOptionPlaces([]));
    return () => {
      cancelled = true;
    };
  }, [routeId, selectedRoute?.optionId]);

  type PlaceMarkerFilter = "all" | "cafe" | "convenience" | "none";
  const [placeMarkerFilter, setPlaceMarkerFilter] =
    useState<PlaceMarkerFilter>("all");

  const filteredPlaceMarkers = (() => {
    if (placeMarkerFilter === "none") return [];
    return optionPlaces
      .filter((p) => {
        if (placeMarkerFilter === "all") return true;
        if (placeMarkerFilter === "cafe") return p.category === "cafe";
        if (placeMarkerFilter === "convenience")
          return p.category === "convenience";
        return false;
      })
      .map((p) => ({
        lat: p.lat,
        lng: p.lng,
        title: p.name,
        icon: p.category === "cafe" ? "cafe" : "convenience",
        color: p.category === "cafe" ? "#8B4512" : "#2563eb",
      }));
  })();

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
        const data = (
          res as {
            data?: {
              options?: Array<{
                id: string;
                option_number: number;
                name: string;
                distance: number;
                estimated_time: number;
                difficulty: string;
                tag: string | null;
                coordinates: Array<{ lat: number; lng: number }>;
                scores?: { safety?: number; elevation?: number };
                place_ids?: { cafe?: number[]; convenience?: number[] };
                cafe_count?: number;
                convenience_count?: number;
              }>;
            };
          }
        )?.data;
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
          cafeCount: opt.cafe_count ?? 0,
          convenienceCount: opt.convenience_count ?? 0,
          difficulty: opt.difficulty ?? "보통",
          tag: opt.tag ?? null,
          optionId: opt.id,
          coordinates: Array.isArray(opt.coordinates)
            ? opt.coordinates.map((c) => ({
                lat: Number(c.lat),
                lng: Number(c.lng),
              }))
            : undefined,
        }));
        setFetchedOptions(mapped);

        // 저장된 routeOptionId가 있으면 해당 옵션을 선택, 없으면 첫 번째 선택
        const savedRouteOptionId = params.routeOptionId as string | undefined;
        let defaultIndex = 0;
        if (savedRouteOptionId) {
          const savedIndex = mapped.findIndex(
            (opt) => opt.optionId === savedRouteOptionId,
          );
          if (savedIndex !== -1) {
            defaultIndex = savedIndex;
          }
        }

        setSelectedRoute(mapped[defaultIndex]);
        setOptionsLoading(false);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setOptionsError(
            (err as Error)?.message ?? "경로 옵션을 불러오지 못했습니다.",
          );
          setFetchedOptions(null);
          setSelectedRoute(fallbackOptions[1]);
          setOptionsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [routeId]);

  const iconSvgPath = getPresetSvgPath(iconName);

  // workout으로 선택한 경로 좌표 넘기기 (실제 경로 좌표가 있으면 그것을 넘기고, 없으면 프리셋 경로 좌표를 넘김)
  const handleStart = () => {
    if (!selectedRoute) return;
    router.push({
      pathname: "/(screens)/workout",
      params: {
        ...params,
        ...(routeId && selectedRoute.optionId
          ? { routeId, optionId: selectedRoute.optionId }
          : {}),
        selectedRouteId: selectedRoute.id.toString(),
        targetDistance: parseFloat(selectedRoute.distance).toString(),
        routeName: selectedRoute.name,
        ...(selectedRoute.coordinates && selectedRoute.coordinates.length > 0
          ? { routePolyline: JSON.stringify(selectedRoute.coordinates) }
          : {}),
      },
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "쉬움":
      case "짧은 코스":
        return { text: Colors.emerald[400], bg: `${Colors.emerald[500]}20` };
      case "보통":
        return { text: Colors.blue[400], bg: `${Colors.blue[500]}20` };
      case "도전":
      case "긴 코스":
        return { text: Colors.orange[400], bg: `${Colors.orange[500]}20` };
      default:
        return { text: Colors.zinc[400], bg: `${Colors.zinc[500]}20` };
    }
  };

  // 실제 경로가 있으면 polyline+center 전달
  // → KakaoMap이 setBounds로 전체 경로가 보이게 함
  const mapPolyline =
    selectedRoute?.coordinates && selectedRoute.coordinates.length > 0
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

  const startPosition = (() => {
    const lat =
      params.startLat != null ? parseFloat(String(params.startLat)) : null;
    const lng =
      params.startLng != null ? parseFloat(String(params.startLng)) : null;
    if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng))
      return undefined;
    return { lat, lng };
  })();

  return (
    <View style={styles.container}>
      {/* Background Map + 마커 필터 버튼 */}
      <View style={styles.mapWrapper}>
        <KakaoMap
          key={mapPolyline.length > 0 ? "path" : "preset"}
          routePath={iconName}
          polyline={mapPolyline}
          center={mapCenter}
          startPosition={startPosition}
          isLoading={!selectedRoute || optionsLoading}
          markers={filteredPlaceMarkers}
        />
        <View style={styles.placeFilterButtons} pointerEvents="box-none">
          <TouchableOpacity
            style={[
              styles.placeFilterBtn,
              placeMarkerFilter === "convenience" &&
                styles.placeFilterBtnActive,
            ]}
            onPress={() =>
              setPlaceMarkerFilter((prev) =>
                prev === "convenience" ? "all" : "convenience",
              )
            }
            activeOpacity={0.7}
          >
            <Text style={styles.placeFilterBtnEmoji}>🏪</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.placeFilterBtn,
              placeMarkerFilter === "cafe" && styles.placeFilterBtnActive,
            ]}
            onPress={() =>
              setPlaceMarkerFilter((prev) => (prev === "cafe" ? "all" : "cafe"))
            }
            activeOpacity={0.7}
          >
            <Text style={styles.placeFilterBtnEmoji}>☕</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.placeFilterBtn,
              placeMarkerFilter === "none" && styles.placeFilterBtnActive,
            ]}
            onPress={() =>
              setPlaceMarkerFilter((prev) => (prev === "none" ? "all" : "none"))
            }
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.placeFilterBtnEmoji,
                { color: Colors.emerald[400] },
              ]}
            >
              ⊘
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={Colors.zinc[50]} />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>
            {fromSaved ? "저장된 경로" : "경로 선택"}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Safety Score Info Modal */}
      <Modal
        visible={safetyInfoVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSafetyInfoVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSafetyInfoVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Shield size={24} color={Colors.purple[400]} />
              <Text style={styles.modalTitle}>안전점수란?</Text>
            </View>

            <Text style={styles.modalDescription}>
              안전점수는 경로 주변의 CCTV와 가로등(보안등) {"\n"}커버리지를
              기반으로 계산됩니다.
            </Text>

            <View style={styles.modalInfoList}>
              <View style={styles.modalInfoItem}>
                <View
                  style={[
                    styles.modalDot,
                    { backgroundColor: Colors.emerald[400] },
                  ]}
                />
                <Text style={styles.modalInfoText}>
                  경로를 20m 간격으로 나누어 각 지점을 분석합니다
                </Text>
              </View>
              <View style={styles.modalInfoItem}>
                <View
                  style={[
                    styles.modalDot,
                    { backgroundColor: Colors.blue[400] },
                  ]}
                />
                <Text style={styles.modalInfoText}>
                  CCTV 50m 또는 가로등 15m 이내에 있으면 {"\n"}안전 구간으로
                  판정합니다
                </Text>
              </View>
              <View style={styles.modalInfoItem}>
                <View
                  style={[
                    styles.modalDot,
                    { backgroundColor: Colors.purple[400] },
                  ]}
                />
                <Text style={styles.modalInfoText}>
                  안전 구간 비율이 곧 안전점수(0~100점)가 됩니다
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setSafetyInfoVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCloseText}>확인</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Bottom Sheet */}
      <BottomSheet onStateChange={setSheetState}>
        {/* 로딩 중이거나 선택된 경로가 아직 없으면 로딩 표시 */}
        {!selectedRoute || optionsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.emerald[400]} />
            <Text style={styles.loadingText}>경로를 불러오는 중...</Text>
          </View>
        ) : (
          <>
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
                  {isCustomDrawing && svgPath ? (
                    <SvgPathIcon
                      svgPath={svgPath}
                      size={24}
                      color={Colors.purple[400]}
                    />
                  ) : isCustomDrawing ? (
                    <Sparkles size={24} color={Colors.purple[400]} />
                  ) : (
                    <SvgPathIcon
                      svgPath={iconSvgPath}
                      size={24}
                      color={Colors.emerald[400]}
                    />
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
                  <View style={styles.statCardHeader}>
                    <Shield size={20} color={Colors.purple[400]} />
                    <TouchableOpacity
                      onPress={() => setSafetyInfoVisible(true)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Info size={20} color={Colors.zinc[500]} />
                    </TouchableOpacity>
                  </View>
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
                          <Text style={styles.routeOptionName}>
                            {route.name}
                          </Text>
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
                  {/* <View style={styles.featureItem}>
                    <View
                      style={[
                        styles.featureDot,
                        { backgroundColor: Colors.blue[400] },
                      ]}
                    />
                    <Text style={styles.featureText}>
                      가로등 밝음 ({selectedRoute.lighting}% 조명)
                    </Text>
                  </View> */}
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
                      {selectedRoute.convenienceCount}곳
                    </Text>
                  </View>
                  <View style={styles.facilityCard}>
                    <Text style={styles.facilityLabel}>카페</Text>
                    <Text style={styles.facilityValue}>
                      {selectedRoute.cafeCount}곳
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
                <Text style={styles.secondaryButtonText}>
                  다른 경로 생성하기
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.zinc[950],
  },
  loadingContainer: {
    paddingVertical: Spacing.xl * 2,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: FontSize.base,
    color: Colors.zinc[400],
    marginTop: Spacing.sm,
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
    backgroundColor: Colors.zinc[800],
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleBox: {
    backgroundColor: Colors.zinc[800],
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
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
  statCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: "100%",
    maxWidth: 360,
    borderWidth: 1,
    borderColor: Colors.zinc[800],
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.zinc[50],
  },
  modalDescription: {
    fontSize: FontSize.sm,
    color: Colors.zinc[300],
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  modalInfoList: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  modalInfoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.xs,
  },
  modalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  modalInfoText: {
    fontSize: FontSize.sm,
    color: Colors.zinc[400],
    flex: 1,
    lineHeight: 20,
  },
  modalCloseButton: {
    backgroundColor: Colors.purple[500],
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  modalCloseText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.zinc[50],
  },
  mapWrapper: {
    flex: 1,
    position: "relative",
  },
  placeFilterButtons: {
    position: "absolute",
    top: 100,
    right: Spacing.md,
    flexDirection: "column",
    gap: Spacing.sm,
    zIndex: 10,
  },
  placeFilterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.zinc[800],
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  placeFilterBtnActive: {
    backgroundColor: Colors.emerald[500],
  },
  placeFilterBtnEmoji: {
    fontSize: 26,
  },
});
