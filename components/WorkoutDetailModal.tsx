import { LinearGradient } from "expo-linear-gradient";
import {
  Award,
  Calendar,
  Clock,
  Flame,
  MapPin,
  TrendingUp,
  X,
  Zap,
  Route,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Spacing,
} from "../constants/theme";
import { getIconComponent } from "../utils/shapeIcons";
import { KakaoMap } from "./KakaoMap";
import { SvgPathIcon } from "./SvgPathIcon";
import { workoutApi } from "../utils/api";
import type { WorkoutDetail } from "../types/api";

const { height } = Dimensions.get("window");

interface WorkoutDetailModalProps {
  visible: boolean;
  onClose: () => void;
  workout: {
    id: string;
    routeName: string;
    type: "running" | "walking";
    distance: number;
    duration: number;
    pace: string;
    calories: number;
    svgPath?: string | null;
    routeData: {
      shapeId: string;
      shapeName: string;
      iconName: string;
    };
    completedAt: string;
  } | null;
  workoutId?: string | null;
}

export function WorkoutDetailModal({
  visible,
  onClose,
  workout,
  workoutId,
}: WorkoutDetailModalProps) {
  const [detail, setDetail] = useState<WorkoutDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // workoutId가 있으면 상세 API 호출
  useEffect(() => {
    if (visible && workoutId) {
      (async () => {
        setIsLoadingDetail(true);
        try {
          const response = await workoutApi.getWorkoutDetail(workoutId);
          if (response.success && response.data) {
            setDetail(response.data);
          }
        } catch (error) {
          console.error("운동 상세 조회 실패:", error);
        } finally {
          setIsLoadingDetail(false);
        }
      })();
    } else if (!visible) {
      setDetail(null);
    }
  }, [visible, workoutId]);

  if (!workout) return null;

  const RouteIcon = getIconComponent(workout.routeData.iconName);
  const isRunning = workout.type === "running";

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}시간 ${minutes}분 ${secs}초`;
    }
    return `${minutes}분 ${secs}초`;
  };

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    const period = hours >= 12 ? "오후" : "오전";
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;

    return `${year}년 ${month}월 ${day}일 ${period} ${displayHours}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  // 상세 데이터에서 값 사용 (있으면)
  const displayDistance = detail?.distance ?? workout.distance;
  const displayDuration = detail?.duration ?? workout.duration;
  const displayPace = detail?.avg_pace ?? workout.pace;
  const displayCalories = detail?.calories ?? workout.calories;
  const displayCompletion = detail?.route_completion;

  const realAvgSpeed =
    displayDuration > 0
      ? (displayDistance / (displayDuration / 3600)).toFixed(1)
      : "0.0";

  const detailStats = [
    {
      icon: MapPin,
      label: "거리",
      value: `${displayDistance.toFixed(2)}`,
      unit: "km",
      color: Colors.emerald[400],
    },
    {
      icon: Clock,
      label: "시간",
      value: formatDuration(displayDuration),
      unit: "",
      color: Colors.blue[400],
    },
    {
      icon: TrendingUp,
      label: "평균 페이스",
      value: displayPace,
      unit: "/km",
      color: Colors.purple[400],
    },
    {
      icon: Flame,
      label: "칼로리",
      value: `${displayCalories}`,
      unit: "kcal",
      color: Colors.orange[400],
    },
    {
      icon: Zap,
      label: "평균 속도",
      value: realAvgSpeed,
      unit: "km/h",
      color: Colors.amber[400],
    },
    {
      icon: Award,
      label: displayCompletion != null ? "완주율" : "최고 속도",
      value:
        displayCompletion != null
          ? `${displayCompletion.toFixed(0)}`
          : (parseFloat(realAvgSpeed) * 1.3).toFixed(1),
      unit: displayCompletion != null ? "%" : "km/h",
      color: Colors.pink[400],
    },
  ];

  // 경로 비교용 데이터
  const plannedPath = detail?.planned_path ?? null;
  const actualPath = detail?.actual_path ?? null;
  const splits = detail?.splits ?? null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.modalContainer}>
          {/* 헤더 */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.headerIcon,
                  {
                    backgroundColor: workout.svgPath
                      ? `${Colors.purple[500]}20`
                      : isRunning
                        ? `${Colors.emerald[500]}20`
                        : `${Colors.blue[500]}20`,
                  },
                ]}
              >
                {workout.svgPath ? (
                  <SvgPathIcon
                    svgPath={workout.svgPath}
                    size={24}
                    color={Colors.purple[400]}
                  />
                ) : (
                  <RouteIcon
                    size={24}
                    color={isRunning ? Colors.emerald[400] : Colors.blue[400]}
                    strokeWidth={1.5}
                  />
                )}
              </View>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>{workout.routeName}</Text>
                <Text style={styles.headerSubtitle}>
                  {workout.routeData.shapeName} • {isRunning ? "러닝" : "산책"}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <X size={24} color={Colors.zinc[400]} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* 지도 영역 - 상세 데이터 로딩 중이면 로더 표시 */}
            <View style={styles.mapSection}>
              <View style={styles.mapContainer}>
                {isLoadingDetail ? (
                  <View style={styles.mapLoading}>
                    <ActivityIndicator
                      size="large"
                      color={Colors.emerald[500]}
                    />
                    <Text style={styles.mapLoadingText}>
                      경로 불러오는 중...
                    </Text>
                  </View>
                ) : plannedPath || actualPath ? (
                  <KakaoMap
                    plannedPath={plannedPath ?? undefined}
                    actualPath={actualPath ?? undefined}
                  />
                ) : (
                  <KakaoMap routePath={workout.routeData.shapeId} />
                )}
              </View>
              <LinearGradient
                colors={["transparent", Colors.zinc[950]]}
                style={styles.mapGradient}
              />
            </View>

            {/* 경로 비교 범례 (계획/실제 경로가 있을 때) */}
            {(plannedPath || actualPath) && (
              <View style={styles.legendSection}>
                {plannedPath && (
                  <View style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendLine,
                        { backgroundColor: "#a1a1aa", borderStyle: "dashed" },
                      ]}
                    />
                    <Text style={styles.legendText}>계획 경로</Text>
                  </View>
                )}
                {actualPath && (
                  <View style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendLine,
                        { backgroundColor: Colors.emerald[400] },
                      ]}
                    />
                    <Text style={styles.legendText}>실제 경로</Text>
                  </View>
                )}
                {displayCompletion != null && (
                  <View style={styles.completionBadge}>
                    <Route size={12} color={Colors.emerald[400]} />
                    <Text style={styles.completionText}>
                      {displayCompletion.toFixed(0)}% 완주
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* 날짜 정보 */}
            <View style={styles.dateSection}>
              <Calendar size={16} color={Colors.zinc[500]} />
              <Text style={styles.dateText}>
                {formatDate(workout.completedAt)}
              </Text>
            </View>

            {/* 상세 통계 그리드 */}
            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>운동 통계</Text>
              <View style={styles.statsGrid}>
                {detailStats.map((stat, index) => (
                  <View key={index} style={styles.statCard}>
                    <View
                      style={[
                        styles.statIconContainer,
                        { backgroundColor: `${stat.color}20` },
                      ]}
                    >
                      <stat.icon size={20} color={stat.color} strokeWidth={2} />
                    </View>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                    <View style={styles.statValueRow}>
                      <Text style={styles.statValue}>{stat.value}</Text>
                      {stat.unit && (
                        <Text style={styles.statUnit}>{stat.unit}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* 추가 정보 */}
            <View style={styles.additionalSection}>
              <Text style={styles.sectionTitle}>경로 정보</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>경로 형태</Text>
                  <Text style={styles.infoValue}>
                    {workout.routeData.shapeName}
                  </Text>
                </View>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>운동 타입</Text>
                  <Text style={styles.infoValue}>
                    {isRunning ? "러닝" : "산책"}
                  </Text>
                </View>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>총 소모 칼로리</Text>
                  <Text
                    style={[styles.infoValue, { color: Colors.orange[400] }]}
                  >
                    {displayCalories} kcal
                  </Text>
                </View>
              </View>
            </View>

            {/* 구간 기록 (splits) */}
            {splits && splits.length > 0 && (
              <View style={styles.splitsSection}>
                <Text style={styles.sectionTitle}>구간 기록</Text>
                <View style={styles.splitsCard}>
                  <View style={styles.splitsHeader}>
                    <Text style={styles.splitsHeaderText}>구간</Text>
                    <Text style={styles.splitsHeaderText}>페이스</Text>
                    <Text style={styles.splitsHeaderText}>시간</Text>
                  </View>
                  {splits.map((split, index) => (
                    <View key={index}>
                      <View style={styles.splitsRow}>
                        <Text style={styles.splitsKm}>{split.km} km</Text>
                        <Text style={styles.splitsPace}>{split.pace}</Text>
                        <Text style={styles.splitsDuration}>
                          {Math.floor(split.duration / 60)}:
                          {(split.duration % 60).toString().padStart(2, "0")}
                        </Text>
                      </View>
                      {index < splits.length - 1 && (
                        <View style={styles.splitsDivider} />
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* 하단 여백 */}
            <View style={{ height: Spacing["2xl"] }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    backgroundColor: Colors.zinc[950],
    borderRadius: BorderRadius["2xl"],
    width: "90%",
    maxHeight: height * 0.85,
    borderWidth: 1,
    borderColor: Colors.zinc[800],
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.zinc[800],
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.xl,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.zinc[50],
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.zinc[500],
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.zinc[900],
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flexGrow: 1,
  },
  mapSection: {
    position: "relative",
  },
  mapContainer: {
    height: 300,
    backgroundColor: Colors.zinc[900],
    overflow: "hidden",
  },
  mapGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  dateSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  dateText: {
    fontSize: FontSize.sm,
    color: Colors.zinc[500],
  },
  statsSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.zinc[300],
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  statCard: {
    width: "47%",
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.zinc[800],
    padding: Spacing.md,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.zinc[500],
    marginBottom: 4,
  },
  statValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.zinc[50],
  },
  statUnit: {
    fontSize: FontSize.sm,
    color: Colors.zinc[500],
    marginLeft: 4,
  },
  additionalSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  infoCard: {
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.zinc[800],
    padding: Spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  infoLabel: {
    fontSize: FontSize.sm,
    color: Colors.zinc[500],
  },
  infoValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.zinc[50],
  },
  infoDivider: {
    height: 1,
    backgroundColor: Colors.zinc[800],
    marginVertical: 4,
  },
  // 지도 로딩
  mapLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.zinc[900],
  },
  mapLoadingText: {
    marginTop: Spacing.sm,
    fontSize: FontSize.sm,
    color: Colors.zinc[500],
  },
  // 경로 비교 범례
  legendSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
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
  legendText: {
    fontSize: FontSize.xs,
    color: Colors.zinc[400],
  },
  completionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: "auto",
    backgroundColor: `${Colors.emerald[500]}20`,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.md,
  },
  completionText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold as any,
    color: Colors.emerald[400],
  },
  // 구간 기록 (splits)
  splitsSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  splitsCard: {
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.zinc[800],
    padding: Spacing.md,
  },
  splitsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.zinc[800],
    marginBottom: Spacing.sm,
  },
  splitsHeaderText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold as any,
    color: Colors.zinc[500],
    flex: 1,
    textAlign: "center",
  },
  splitsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.xs,
  },
  splitsKm: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium as any,
    color: Colors.zinc[300],
    flex: 1,
    textAlign: "center",
  },
  splitsPace: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold as any,
    color: Colors.emerald[400],
    flex: 1,
    textAlign: "center",
  },
  splitsDuration: {
    fontSize: FontSize.sm,
    color: Colors.zinc[400],
    flex: 1,
    textAlign: "center",
  },
  splitsDivider: {
    height: 1,
    backgroundColor: Colors.zinc[800],
    marginVertical: 2,
  },
});
