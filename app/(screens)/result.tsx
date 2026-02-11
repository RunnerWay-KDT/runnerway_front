import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Bookmark,
  Clock,
  Flame,
  Share2,
  Sparkles,
  TrendingUp,
  Trophy,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInUp, ZoomIn } from "react-native-reanimated";
import { KakaoMap } from "../../components/KakaoMap";
import { PrimaryButton } from "../../components/PrimaryButton";
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Spacing,
} from "../../constants/theme";
import { workoutApi, savedRouteApi } from "../../utils/api";

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const hasCalledCompleteApi = useRef(false);

  const isCustomDrawing = params.mode === "custom";
  const iconName = (params.shapeIconName as string) || "heart";

  const distance = (params.completedDistance as string) || "4.20";
  const time = parseInt((params.completedTime as string) || "1723", 10);
  const pace = (params.averagePace as string) || "6'50\"";
  const calories = parseInt((params.calories as string) || "247", 10);

  // workout.tsx에서 전달받은 데이터
  const workoutId = (params.workoutId as string) || "";
  const routeId = (params.routeId as string) || "";
  const routeOptionId = (params.optionId as string) || "";
  const actualPathRaw = (params.actualPath as string) || "[]";
  const splitsDataRaw = (params.splitsData as string) || "[]";
  const endLatitude = (params.endLatitude as string) || "";
  const endLongitude = (params.endLongitude as string) || "";
  const routeCompletion = parseFloat((params.routeCompletion as string) || "0");

  // workout.tsx에서 전달받은 planned path (routePolyline 파라미터)
  const routePolylineRaw = (params.routePolyline as string) || "[]";

  // 북마크 상태
  const [isBookmarked, setIsBookmarked] = useState(false);

  // 경로 비교를 위한 state
  const [plannedPath, setPlannedPath] = useState<
    { lat: number; lng: number }[]
  >([]);
  const [actualPath, setActualPath] = useState<{ lat: number; lng: number }[]>(
    [],
  );

  // 초기값: params에서 파싱
  useEffect(() => {
    // planned path: workout.tsx에서 전달받은 routePolyline
    try {
      const parsed = JSON.parse(routePolylineRaw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setPlannedPath(parsed);
      }
    } catch {
      // ignore
    }

    // actual path: workout.tsx에서 전달받은 actualPath
    try {
      const parsed = JSON.parse(actualPathRaw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setActualPath(
          parsed.map((p: { lat: number; lng: number }) => ({
            lat: p.lat,
            lng: p.lng,
          })),
        );
      }
    } catch {
      // ignore
    }
  }, [routePolylineRaw, actualPathRaw]);

  // ============================================
  // 운동 완료 API 호출 → workouts UPDATE + workout_splits INSERT
  // ============================================
  useEffect(() => {
    if (hasCalledCompleteApi.current) return;
    if (!workoutId) {
      console.warn("⚠️ workoutId가 없어 완료 API를 호출하지 않습니다");
      return;
    }
    hasCalledCompleteApi.current = true;

    const completeWorkout = async () => {
      try {
        let actualPathData: {
          lat: number;
          lng: number;
          timestamp?: number;
        }[] = [];
        try {
          actualPathData = JSON.parse(actualPathRaw);
        } catch {
          actualPathData = [];
        }

        let splitsArr: { km: number; pace: string; duration: number }[] = [];
        try {
          splitsArr = JSON.parse(splitsDataRaw);
        } catch {
          splitsArr = [];
        }

        const response = await workoutApi.completeWorkout(workoutId, {
          completed_at: new Date().toISOString(),
          final_metrics: {
            distance: parseFloat(distance),
            duration: time,
            average_pace: pace,
            calories: calories,
          },
          route: {
            actual_path: actualPathData,
          },
          splits: splitsArr.length > 0 ? splitsArr : null,
          end_location:
            endLatitude && endLongitude
              ? {
                  latitude: parseFloat(endLatitude),
                  longitude: parseFloat(endLongitude),
                }
              : null,
          route_completion: routeCompletion > 0 ? routeCompletion : null,
        });

        if (response.success) {
          console.log("✅ 운동 완료 저장 성공:", response.data);

          // 서버에서 반환한 planned_path가 있으면 업데이트
          if (
            response.data?.planned_path &&
            response.data.planned_path.length > 0
          ) {
            setPlannedPath(response.data.planned_path);
          }

          // 서버에서 반환한 actual_path가 있으면 업데이트
          if (
            response.data?.actual_path &&
            response.data.actual_path.length > 0
          ) {
            setActualPath(
              response.data.actual_path.map(
                (p: { lat: number; lng: number }) => ({
                  lat: p.lat,
                  lng: p.lng,
                }),
              ),
            );
          }
        }
      } catch (error) {
        console.error("❌ 운동 완료 API 실패:", error);
        // API 실패해도 화면은 정상 표시
      }
    };

    completeWorkout();
  }, [
    workoutId,
    distance,
    time,
    pace,
    calories,
    actualPathRaw,
    splitsDataRaw,
    endLatitude,
    endLongitude,
    routeCompletion,
  ]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const stats = [
    {
      Icon: Clock,
      label: "시간",
      value: formatTime(time),
      color: Colors.blue[400],
    },
    {
      Icon: TrendingUp,
      label: "평균 페이스",
      value: pace,
      color: Colors.purple[400],
    },
    {
      Icon: Flame,
      label: "칼로리",
      value: calories.toString(),
      unit: "kcal",
      color: Colors.orange[400],
    },
  ];

  const handleGoHome = () => {
    router.replace("/(tabs)");
  };

  /** 북마크 토글 */
  const handleToggleBookmark = async () => {
    if (!routeId) {
      Alert.alert("알림", "경로 정보가 없어 북마크할 수 없습니다.");
      return;
    }

    const wasBookmarked = isBookmarked;
    setIsBookmarked(!wasBookmarked);

    try {
      if (wasBookmarked) {
        await savedRouteApi.unsaveRoute(routeId);
        Alert.alert("알림", "북마크가 해제되었습니다.");
      } else {
        await savedRouteApi.saveRoute(routeId, routeOptionId || undefined);
        Alert.alert("성공", "경로가 북마크되었습니다!");
      }
    } catch (error) {
      // 실패 시 롤백
      setIsBookmarked(wasBookmarked);
      console.error("북마크 토글 실패:", error);
      Alert.alert("오류", "북마크 변경에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Trophy Header */}
      <Animated.View
        entering={ZoomIn.delay(200).duration(400)}
        style={styles.trophyContainer}
      >
        <Trophy size={64} color={Colors.emerald[400]} />
      </Animated.View>

      <Animated.Text
        entering={FadeInUp.delay(300).duration(400)}
        style={styles.title}
      >
        운동 완료!
      </Animated.Text>
      <Animated.Text
        entering={FadeInUp.delay(400).duration(400)}
        style={styles.subtitle}
      >
        훌륭한 러닝이었습니다
      </Animated.Text>

      {/* Map Section - 계획 경로 vs 실제 경로 비교 */}
      <Animated.View
        entering={FadeInUp.delay(450).duration(400)}
        style={styles.mapContainer}
      >
        <KakaoMap
          routePath={iconName}
          plannedPath={plannedPath.length > 0 ? plannedPath : undefined}
          actualPath={actualPath.length > 0 ? actualPath : undefined}
        />
        {/* 경로 범례 */}
        {(plannedPath.length > 0 || actualPath.length > 0) && (
          <View style={styles.mapLegend}>
            {plannedPath.length > 0 && (
              <View style={styles.legendItem}>
                <View style={[styles.legendLine, styles.legendPlanned]} />
                <Text style={styles.legendText}>계획 경로</Text>
              </View>
            )}
            {actualPath.length > 0 && (
              <View style={styles.legendItem}>
                <View style={[styles.legendLine, styles.legendActual]} />
                <Text style={styles.legendText}>실제 경로</Text>
              </View>
            )}
          </View>
        )}
        {/* 완주율 뱃지 */}
        {routeCompletion > 0 && (
          <View style={styles.completionBadge}>
            <Text style={styles.completionText}>
              완주율 {Math.round(routeCompletion)}%
            </Text>
          </View>
        )}
      </Animated.View>

      {/* Distance Badge */}
      <Animated.View
        entering={FadeInUp.delay(500).duration(400)}
        style={styles.distanceBadgeContainer}
      >
        <View style={styles.distanceBadge}>
          <Text style={styles.distanceText}>{distance} km</Text>
        </View>
        {isCustomDrawing && (
          <View style={styles.customBadge}>
            <Sparkles size={12} color="#fff" />
            <Text style={styles.customBadgeText}>커스텀 경로</Text>
          </View>
        )}
      </Animated.View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => {
          const Icon = stat.Icon;
          return (
            <Animated.View
              key={stat.label}
              entering={FadeInUp.delay(600 + index * 100).duration(400)}
              style={styles.statCard}
            >
              <Icon size={24} color={stat.color} />
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>
                {stat.value}
                {stat.unit && <Text style={styles.statUnit}> {stat.unit}</Text>}
              </Text>
            </Animated.View>
          );
        })}
      </View>

      {/* Achievement Badge */}
      {parseFloat(distance) > 4.0 && (
        <Animated.View
          entering={FadeInUp.delay(900).duration(400)}
          style={styles.achievementCard}
        >
          <View style={styles.achievementIcon}>
            <Trophy size={20} color={Colors.amber[400]} />
          </View>
          <View style={styles.achievementContent}>
            <Text style={styles.achievementTitle}>개인 최고 기록 달성!</Text>
            <Text style={styles.achievementSubtitle}>
              이번 달 최장 거리입니다
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Custom Route Achievement */}
      {isCustomDrawing && (
        <Animated.View
          entering={FadeInUp.delay(950).duration(400)}
          style={styles.customAchievementCard}
        >
          <View style={styles.customAchievementIcon}>
            <Sparkles size={20} color={Colors.purple[400]} />
          </View>
          <View style={styles.achievementContent}>
            <Text style={styles.customAchievementTitle}>창의적인 경로!</Text>
            <Text style={styles.achievementSubtitle}>
              직접 그린 경로를 완주했습니다
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Animated.View
          entering={FadeInUp.delay(1000).duration(400)}
          style={styles.shareButtonRow}
        >
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <Share2 size={20} color={Colors.zinc[50]} />
            <Text style={styles.iconButtonText}>공유</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={handleToggleBookmark}
            disabled={!routeId}
          >
            <Bookmark
              size={20}
              color={
                !routeId
                  ? Colors.zinc[600]
                  : isBookmarked
                    ? Colors.emerald[400]
                    : Colors.zinc[50]
              }
              fill={isBookmarked ? Colors.emerald[400] : "transparent"}
            />
            <Text
              style={[
                styles.iconButtonText,
                !routeId && { color: Colors.zinc[600] },
              ]}
            >
              저장
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(1100).duration(400)}>
          <PrimaryButton onPress={handleGoHome}>홈으로 돌아가기</PrimaryButton>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.zinc[950],
  },
  content: {
    padding: Spacing.lg,
    paddingTop: Spacing["3xl"],
    paddingBottom: Spacing["3xl"],
    alignItems: "center",
  },
  trophyContainer: {
    padding: Spacing.md,
    backgroundColor: `${Colors.emerald[500]}20`,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: Colors.zinc[50],
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.base,
    color: Colors.zinc[400],
    marginBottom: Spacing.xl,
  },
  mapContainer: {
    width: "100%",
    height: 400,
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius["2xl"],
    borderWidth: 1,
    borderColor: Colors.zinc[800],
    overflow: "hidden",
    marginBottom: Spacing.md,
    position: "relative",
  },
  mapLegend: {
    position: "absolute",
    bottom: Spacing.sm,
    left: Spacing.sm,
    flexDirection: "row",
    gap: Spacing.md,
    backgroundColor: `${Colors.zinc[900]}E6`,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendLine: {
    width: 20,
    height: 3,
    borderRadius: 2,
  },
  legendPlanned: {
    backgroundColor: Colors.zinc[400],
  },
  legendActual: {
    backgroundColor: Colors.emerald[400],
  },
  legendText: {
    fontSize: FontSize.xs,
    color: Colors.zinc[300],
  },
  completionBadge: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: `${Colors.emerald[500]}CC`,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  completionText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: "#fff",
  },
  distanceBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  distanceBadge: {
    backgroundColor: Colors.emerald[500],
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  distanceText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: "#fff",
  },
  customBadge: {
    position: "absolute",
    top: Spacing.md,
    left: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.purple[500],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  customBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: "#fff",
  },
  statsGrid: {
    flexDirection: "row",
    gap: Spacing.sm,
    width: "100%",
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius["2xl"],
    borderWidth: 1,
    borderColor: Colors.zinc[800],
    padding: Spacing.md,
    alignItems: "center",
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.zinc[500],
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.zinc[50],
  },
  statUnit: {
    fontSize: FontSize.sm,
    color: Colors.zinc[400],
  },
  achievementCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    width: "100%",
    padding: Spacing.md,
    borderRadius: BorderRadius["2xl"],
    borderWidth: 1,
    borderColor: `${Colors.amber[500]}30`,
    backgroundColor: `${Colors.amber[500]}10`,
    marginBottom: Spacing.md,
  },
  achievementIcon: {
    padding: Spacing.sm,
    backgroundColor: `${Colors.amber[500]}20`,
    borderRadius: BorderRadius.lg,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.amber[400],
  },
  achievementSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.zinc[300],
    marginTop: 2,
  },
  customAchievementCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    width: "100%",
    padding: Spacing.md,
    borderRadius: BorderRadius["2xl"],
    borderWidth: 1,
    borderColor: `${Colors.purple[500]}30`,
    backgroundColor: `${Colors.purple[500]}10`,
    marginBottom: Spacing.lg,
  },
  customAchievementIcon: {
    padding: Spacing.sm,
    backgroundColor: `${Colors.purple[500]}20`,
    borderRadius: BorderRadius.lg,
  },
  customAchievementTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.purple[400],
  },
  actionButtons: {
    width: "100%",
    gap: Spacing.md,
  },
  shareButtonRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  iconButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.zinc[800],
    paddingVertical: Spacing.md,
  },
  iconButtonText: {
    fontSize: FontSize.base,
    color: Colors.zinc[50],
  },
});
