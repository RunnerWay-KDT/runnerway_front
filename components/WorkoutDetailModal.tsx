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
} from "lucide-react-native";
import React from "react";
import {
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
    routeData: {
      shapeId: string;
      shapeName: string;
      iconName: string;
    };
    completedAt: string;
  } | null;
}

export function WorkoutDetailModal({
  visible,
  onClose,
  workout,
}: WorkoutDetailModalProps) {
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

  const avgSpeed = (workout.distance / (workout.duration / 3600)).toFixed(1);
  const maxSpeed = (parseFloat(avgSpeed) * 1.3).toFixed(1); // Mock: 최대 속도 (평균의 1.3배)

  const detailStats = [
    {
      icon: MapPin,
      label: "거리",
      value: `${workout.distance.toFixed(2)}`,
      unit: "km",
      color: Colors.emerald[400],
    },
    {
      icon: Clock,
      label: "시간",
      value: formatDuration(workout.duration),
      unit: "",
      color: Colors.blue[400],
    },
    {
      icon: TrendingUp,
      label: "평균 페이스",
      value: workout.pace,
      unit: "/km",
      color: Colors.purple[400],
    },
    {
      icon: Flame,
      label: "칼로리",
      value: `${workout.calories}`,
      unit: "kcal",
      color: Colors.orange[400],
    },
    {
      icon: Zap,
      label: "평균 속도",
      value: avgSpeed,
      unit: "km/h",
      color: Colors.amber[400],
    },
    {
      icon: Award,
      label: "최고 속도",
      value: maxSpeed,
      unit: "km/h",
      color: Colors.pink[400],
    },
  ];

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
                    backgroundColor: isRunning
                      ? `${Colors.emerald[500]}20`
                      : `${Colors.blue[500]}20`,
                  },
                ]}
              >
                <RouteIcon
                  size={24}
                  color={isRunning ? Colors.emerald[400] : Colors.blue[400]}
                  strokeWidth={1.5}
                />
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
            {/* 지도 영역 */}
            <View style={styles.mapSection}>
              <View style={styles.mapContainer}>
                <KakaoMap routePath={workout.routeData.shapeId} />
              </View>
              <LinearGradient
                colors={["transparent", Colors.zinc[950]]}
                style={styles.mapGradient}
              />
            </View>

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
                    {workout.calories} kcal
                  </Text>
                </View>
              </View>
            </View>

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
});
