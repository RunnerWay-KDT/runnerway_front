import { useRouter } from "expo-router";
import {
  ArrowUpDown,
  Calendar,
  Clock,
  Flame,
  MapPin,
  TrendingUp,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "../../components/ScreenHeader";
import { WorkoutDetailModal } from "../../components/WorkoutDetailModal";
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Spacing,
} from "../../constants/theme";
import { getIconComponent } from "../../utils/shapeIcons";

interface WorkoutRecord {
  id: string;
  routeName: string;
  type: "running" | "walking";
  distance: number;
  duration: number; // seconds
  pace: string;
  calories: number;
  routeData: {
    shapeId: string;
    shapeName: string;
    iconName: string;
  };
  completedAt: string; // ISO8601
}

// Mock 데이터
const MOCK_WORKOUTS: WorkoutRecord[] = [
  {
    id: "workout_001",
    routeName: "하트 경로 B",
    type: "running",
    distance: 4.2,
    duration: 1723, // 28분 43초
    pace: "6'50\"",
    calories: 247,
    routeData: {
      shapeId: "heart",
      shapeName: "하트",
      iconName: "heart",
    },
    completedAt: "2026-01-20T18:30:00Z",
  },
  {
    id: "workout_002",
    routeName: "별 경로 A",
    type: "running",
    distance: 5.8,
    duration: 2340, // 39분
    pace: "6'45\"",
    calories: 342,
    routeData: {
      shapeId: "star",
      shapeName: "별",
      iconName: "star",
    },
    completedAt: "2026-01-18T19:15:00Z",
  },
  {
    id: "workout_003",
    routeName: "산책 경로",
    type: "walking",
    distance: 3.5,
    duration: 2700, // 45분
    pace: "12'51\"",
    calories: 180,
    routeData: {
      shapeId: "custom",
      shapeName: "커스텀",
      iconName: "sparkles",
    },
    completedAt: "2026-01-17T10:20:00Z",
  },
  {
    id: "workout_004",
    routeName: "커피 경로 C",
    type: "running",
    distance: 3.5,
    duration: 1500, // 25분
    pace: "7'08\"",
    calories: 206,
    routeData: {
      shapeId: "coffee",
      shapeName: "커피",
      iconName: "coffee",
    },
    completedAt: "2026-01-15T08:00:00Z",
  },
  {
    id: "workout_005",
    routeName: "강아지 경로 A",
    type: "running",
    distance: 6.2,
    duration: 2580, // 43분
    pace: "6'57\"",
    calories: 365,
    routeData: {
      shapeId: "dog",
      shapeName: "강아지",
      iconName: "dog",
    },
    completedAt: "2026-01-12T17:45:00Z",
  },
];

type SortOrder = "latest" | "oldest";

export default function WorkoutHistoryScreen() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>(MOCK_WORKOUTS);
  const [sortOrder, setSortOrder] = useState<SortOrder>("latest");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutRecord | null>(
    null,
  );
  const [isModalVisible, setIsModalVisible] = useState(false);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "오늘";
    if (diffDays === 1) return "어제";
    if (diffDays < 7) return `${diffDays}일 전`;

    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일`;
  };

  const toggleSortOrder = () => {
    const newOrder = sortOrder === "latest" ? "oldest" : "latest";
    setSortOrder(newOrder);

    const sorted = [...workouts].sort((a, b) => {
      const dateA = new Date(a.completedAt).getTime();
      const dateB = new Date(b.completedAt).getTime();
      return newOrder === "latest" ? dateB - dateA : dateA - dateB;
    });

    setWorkouts(sorted);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);

    // TODO: 실제 API 호출
    // const response = await fetch('/api/v1/users/me/workouts?page=1&limit=20&sort=date_desc', {
    //   headers: { Authorization: `Bearer ${token}` }
    // });

    // Mock: 새로고침 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsRefreshing(false);
  };

  const handleWorkoutPress = (workout: WorkoutRecord) => {
    setSelectedWorkout(workout);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedWorkout(null);
  };

  const renderWorkoutCard = ({
    item,
    index,
  }: {
    item: WorkoutRecord;
    index: number;
  }) => {
    const RouteIcon = getIconComponent(item.routeData.iconName);
    const isRunning = item.type === "running";

    return (
      <Animated.View
        entering={FadeInUp.delay(index * 50).duration(400)}
        style={styles.cardWrapper}
      >
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => handleWorkoutPress(item)}
        >
          {/* 왼쪽: 아이콘 */}
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: isRunning
                  ? `${Colors.emerald[500]}20`
                  : `${Colors.blue[500]}20`,
              },
            ]}
          >
            <RouteIcon
              size={32}
              color={isRunning ? Colors.emerald[400] : Colors.blue[400]}
              strokeWidth={1.5}
            />
          </View>

          {/* 중앙: 운동 정보 */}
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.routeName}>{item.routeName}</Text>
              <View
                style={[
                  styles.typeBadge,
                  {
                    backgroundColor: isRunning
                      ? `${Colors.emerald[500]}20`
                      : `${Colors.blue[500]}20`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.typeText,
                    {
                      color: isRunning ? Colors.emerald[400] : Colors.blue[400],
                    },
                  ]}
                >
                  {isRunning ? "러닝" : "산책"}
                </Text>
              </View>
            </View>

            {/* 통계 그리드 */}
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <MapPin size={14} color={Colors.zinc[500]} />
                <Text style={styles.statText}>
                  {item.distance.toFixed(1)}km
                </Text>
              </View>
              <View style={styles.statItem}>
                <Clock size={14} color={Colors.zinc[500]} />
                <Text style={styles.statText}>
                  {formatDuration(item.duration)}
                </Text>
              </View>
              <View style={styles.statItem}>
                <TrendingUp size={14} color={Colors.zinc[500]} />
                <Text style={styles.statText}>{item.pace}/km</Text>
              </View>
              <View style={styles.statItem}>
                <Flame size={14} color={Colors.zinc[500]} />
                <Text style={styles.statText}>{item.calories}kcal</Text>
              </View>
            </View>

            {/* 날짜 */}
            <View style={styles.dateRow}>
              <Calendar size={12} color={Colors.zinc[600]} />
              <Text style={styles.dateText}>
                {formatDate(item.completedAt)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <TrendingUp size={64} color={Colors.zinc[700]} />
      </View>
      <Text style={styles.emptyTitle}>운동 기록이 없습니다</Text>
      <Text style={styles.emptySubtitle}>
        첫 운동을 시작하고{"\n"}기록을 남겨보세요!
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => router.push("/(tabs)")}
        activeOpacity={0.7}
      >
        <Text style={styles.emptyButtonText}>운동 시작하기</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.totalStats}>
          <Text style={styles.totalLabel}>총 운동</Text>
          <Text style={styles.totalValue}>{workouts.length}회</Text>
        </View>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={toggleSortOrder}
          activeOpacity={0.7}
        >
          <ArrowUpDown size={16} color={Colors.zinc[400]} />
          <Text style={styles.sortText}>
            {sortOrder === "latest" ? "최신순" : "오래된순"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="내 기록"
        subtitle="완료한 운동 기록을 확인하세요"
        onBack={() => router.back()}
      />

      <FlatList
        data={workouts}
        renderItem={renderWorkoutCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={workouts.length > 0 ? renderHeader : null}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.listContent,
          workouts.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.emerald[500]}
            colors={[Colors.emerald[500]]}
          />
        }
      />

      <WorkoutDetailModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        workout={selectedWorkout}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.zinc[950],
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing["3xl"],
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalStats: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing.sm,
  },
  totalLabel: {
    fontSize: FontSize.base,
    color: Colors.zinc[400],
  },
  totalValue: {
    fontSize: FontSize["2xl"],
    fontWeight: FontWeight.bold,
    color: Colors.emerald[400],
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.zinc[800],
  },
  sortText: {
    fontSize: FontSize.sm,
    color: Colors.zinc[400],
    fontWeight: FontWeight.medium,
  },
  cardWrapper: {
    marginBottom: Spacing.md,
  },
  card: {
    flexDirection: "row",
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius["2xl"],
    borderWidth: 1,
    borderColor: Colors.zinc[800],
    padding: Spacing.md,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.xl,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  routeName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.zinc[50],
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.md,
  },
  typeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: FontSize.sm,
    color: Colors.zinc[400],
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: FontSize.xs,
    color: Colors.zinc[600],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.zinc[900],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.zinc[300],
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: FontSize.base,
    color: Colors.zinc[500],
    textAlign: "center",
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  emptyButton: {
    backgroundColor: Colors.emerald[500],
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  emptyButtonText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: "#fff",
  },
});
