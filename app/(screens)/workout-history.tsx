import { useRouter } from "expo-router";
import {
  ArrowUpDown,
  Bookmark,
  Calendar,
  Clock,
  Flame,
  MapPin,
  Pencil,
  Trash2,
  TrendingUp,
} from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Animated, { FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "../../components/ScreenHeader";
import { SvgPathIcon } from "../../components/SvgPathIcon";
import { WorkoutDetailModal } from "../../components/WorkoutDetailModal";
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Spacing,
} from "../../constants/theme";
import { getPresetSvgPath } from "../../constants/presetShapes";
import { workoutApi, savedRouteApi, routeApi } from "../../utils/api";
import type { WorkoutSummary } from "../../types/api";

// 운동 기록을 화면에 맞게 변환한 인터페이스
interface WorkoutRecord {
  id: string;
  routeId: string | null;
  routeOptionId: string | null;
  routeName: string;
  type: "running" | "walking";
  distance: number;
  duration: number; // seconds
  pace: string;
  calories: number;
  isBookmarked: boolean;
  svgPath: string | null; // 커스텀 경로 SVG path
  routeData: {
    shapeId: string;
    shapeName: string;
    iconName: string;
  };
  completedAt: string; // ISO8601
}

/** 백엔드 WorkoutSummary → 프론트 WorkoutRecord 변환 */
function toWorkoutRecord(w: WorkoutSummary): WorkoutRecord {
  // 백엔드에서 제공하는 shape 정보 우선 사용
  let routeData = w.shape
    ? {
        shapeId: w.shape.shape_id,
        shapeName: w.shape.shape_name,
        iconName: w.shape.icon_name,
      }
    : { shapeId: "custom", shapeName: "커스텀", iconName: "heart" };

  return {
    id: w.id,
    routeId: w.route_id ?? null,
    routeOptionId: w.route_option_id ?? null,
    routeName: w.route_name,
    type: (w.mode === "walking" ? "walking" : "running") as
      | "running"
      | "walking",
    distance: w.distance ?? 0,
    duration: w.duration ?? 0,
    pace: w.avg_pace ?? "-",
    calories: w.calories ?? 0,
    isBookmarked: w.is_bookmarked ?? false,
    svgPath: w.svg_path ?? null,
    routeData,
    completedAt: w.completed_at ?? w.started_at,
  };
}

type SortOrder = "latest" | "oldest";

export default function WorkoutHistoryScreen() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>([]);
  const rawWorkoutsRef = useRef<WorkoutRecord[]>([]); // 원본 데이터 캐시 (정렬 시 재요청 방지)
  const [sortOrder, setSortOrder] = useState<SortOrder>("latest");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(
    null,
  );
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutRecord | null>(
    null,
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

  // 이름 수정 모달 상태
  const [isNameModalVisible, setIsNameModalVisible] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutRecord | null>(
    null,
  );
  const [editRouteName, setEditRouteName] = useState("");

  /** 클라이언트 사이드 정렬 (네트워크 요청 없음) */
  const sortWorkouts = useCallback(
    (items: WorkoutRecord[], sort: SortOrder): WorkoutRecord[] => {
      const sorted = [...items];
      if (sort === "latest") {
        sorted.sort(
          (a, b) =>
            new Date(b.completedAt).getTime() -
            new Date(a.completedAt).getTime(),
        );
      } else {
        // oldest
        sorted.sort(
          (a, b) =>
            new Date(a.completedAt).getTime() -
            new Date(b.completedAt).getTime(),
        );
      }
      return sorted;
    },
    [],
  );

  /** 운동 기록 목록 로드 (서버에서 1회 fetch → 로컬 캐시) */
  const loadWorkouts = useCallback(async () => {
    try {
      const response = await workoutApi.getWorkoutHistory({
        page: 1,
        limit: 50,
      });

      if (response.success && response.data) {
        const records = response.data.workouts.map(toWorkoutRecord);
        rawWorkoutsRef.current = records;
        setWorkouts(sortWorkouts(records, sortOrder));
      }
    } catch (error) {
      console.error("운동 기록 조회 실패:", error);
    }
  }, [sortOrder, sortWorkouts]);

  // 최초 로드
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await loadWorkouts();
      setIsLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    const newOrder: SortOrder = sortOrder === "latest" ? "oldest" : "latest";
    setSortOrder(newOrder);
    // 서버 재요청 없이 로컬 캐시로 즉시 정렬
    setWorkouts(sortWorkouts(rawWorkoutsRef.current, newOrder));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadWorkouts();
    setIsRefreshing(false);
  };

  const handleWorkoutPress = (workout: WorkoutRecord) => {
    setSelectedWorkout(workout);
    setSelectedWorkoutId(workout.id);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedWorkout(null);
    setSelectedWorkoutId(null);
  };

  /** 경로 북마크 토글 */
  const handleToggleBookmark = async (workout: WorkoutRecord) => {
    if (!workout.routeId) return;

    const wasBookmarked = workout.isBookmarked;

    // 낙관적 업데이트 (캐시 동기화)
    rawWorkoutsRef.current = rawWorkoutsRef.current.map((w) =>
      w.id === workout.id ? { ...w, isBookmarked: !wasBookmarked } : w,
    );
    setWorkouts((prev) =>
      prev.map((w) =>
        w.id === workout.id ? { ...w, isBookmarked: !wasBookmarked } : w,
      ),
    );

    try {
      if (wasBookmarked) {
        await savedRouteApi.unsaveRoute(workout.routeId);
      } else {
        await savedRouteApi.saveRoute(
          workout.routeId,
          workout.routeOptionId ?? undefined,
        );
      }
    } catch (error) {
      // 실패 시 롤백
      rawWorkoutsRef.current = rawWorkoutsRef.current.map((w) =>
        w.id === workout.id ? { ...w, isBookmarked: wasBookmarked } : w,
      );
      setWorkouts((prev) =>
        prev.map((w) =>
          w.id === workout.id ? { ...w, isBookmarked: wasBookmarked } : w,
        ),
      );
      console.error("북마크 토글 실패:", error);
      Alert.alert("오류", "북마크 변경에 실패했습니다. 다시 시도해주세요.");
    }
  };

  /** 운동 기록 삭제 */
  const handleDeleteWorkout = (workout: WorkoutRecord) => {
    // 스와이프 닫기
    swipeableRefs.current.get(workout.id)?.close();

    Alert.alert(
      "기록 삭제",
      `"${workout.routeName}" 기록을 삭제하시겠습니까?\n삭제된 기록은 복구할 수 없습니다.`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await workoutApi.deleteWorkoutRecord(workout.id);
              if (response.success) {
                rawWorkoutsRef.current = rawWorkoutsRef.current.filter(
                  (w) => w.id !== workout.id,
                );
                setWorkouts((prev) => prev.filter((w) => w.id !== workout.id));
              }
            } catch (error) {
              console.error("운동 기록 삭제 실패:", error);
              Alert.alert(
                "오류",
                "기록 삭제에 실패했습니다. 다시 시도해주세요.",
              );
            }
          },
        },
      ],
    );
  };

  /** 이름 수정 시작 (왼쪽 스와이프 버튼) */
  const handleStartRename = (workout: WorkoutRecord) => {
    swipeableRefs.current.get(workout.id)?.close();
    setEditingWorkout(workout);
    setEditRouteName(workout.routeName);
    setIsNameModalVisible(true);
  };

  /** 이름 수정 확인 */
  const handleConfirmRename = async () => {
    if (!editingWorkout?.routeId || !editRouteName.trim()) return;

    const newName = editRouteName.trim();
    const prevName = editingWorkout.routeName;
    const workoutId = editingWorkout.id;

    setIsNameModalVisible(false);

    // 낙관적 업데이트 (캐시 동기화)
    rawWorkoutsRef.current = rawWorkoutsRef.current.map((w) =>
      w.id === workoutId ? { ...w, routeName: newName } : w,
    );
    setWorkouts((prev) =>
      prev.map((w) => (w.id === workoutId ? { ...w, routeName: newName } : w)),
    );

    try {
      await routeApi.updateRouteName(editingWorkout.routeId, newName);
    } catch (error) {
      // 실패 시 롤백
      rawWorkoutsRef.current = rawWorkoutsRef.current.map((w) =>
        w.id === workoutId ? { ...w, routeName: prevName } : w,
      );
      setWorkouts((prev) =>
        prev.map((w) =>
          w.id === workoutId ? { ...w, routeName: prevName } : w,
        ),
      );
      console.error("이름 수정 실패:", error);
      Alert.alert("오류", "이름 수정에 실패했습니다. 다시 시도해주세요.");
    }
    setEditingWorkout(null);
  };

  /** 스와이프 시 오른쪽에 나타나는 삭제 버튼 */
  const renderRightActions = (workout: WorkoutRecord) => {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        activeOpacity={0.7}
        onPress={() => handleDeleteWorkout(workout)}
      >
        <View style={styles.deleteActionContent}>
          <View style={styles.deleteIconContainer}>
            <Trash2 size={20} color="#f87171" />
          </View>
          <Text style={styles.deleteActionText}>삭제</Text>
        </View>
      </TouchableOpacity>
    );
  };

  /** 스와이프 시 왼쪽에 나타나는 이름 수정 버튼 */
  const renderLeftActions = (workout: WorkoutRecord) => {
    if (!workout.routeId) return null;
    return (
      <TouchableOpacity
        style={styles.editAction}
        activeOpacity={0.7}
        onPress={() => handleStartRename(workout)}
      >
        <View style={styles.editActionContent}>
          <View style={styles.editIconContainer}>
            <Pencil size={20} color={Colors.blue[400]} />
          </View>
          <Text style={styles.editActionText}>이름 수정</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderWorkoutCard = ({
    item,
    index,
  }: {
    item: WorkoutRecord;
    index: number;
  }) => {
    const iconSvgPath = getPresetSvgPath(item.routeData.iconName);
    const isRunning = item.type === "running";

    return (
      <Animated.View
        entering={FadeInUp.delay(index * 50).duration(400)}
        style={styles.cardWrapper}
      >
        <Swipeable
          ref={(ref) => {
            if (ref) {
              swipeableRefs.current.set(item.id, ref);
            } else {
              swipeableRefs.current.delete(item.id);
            }
          }}
          renderRightActions={() => renderRightActions(item)}
          renderLeftActions={() => renderLeftActions(item)}
          overshootRight={false}
          overshootLeft={false}
          friction={2}
        >
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => handleWorkoutPress(item)}
          >
            {/* 왼쪽: 아이콘 (커스텀 경로면 SVG path 보라색, 프리셋이면 기존 아이콘) */}
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: item.svgPath
                    ? `${Colors.purple[500]}20`
                    : isRunning
                      ? `${Colors.emerald[500]}20`
                      : `${Colors.blue[500]}20`,
                },
              ]}
            >
              {item.svgPath ? (
                <SvgPathIcon
                  svgPath={item.svgPath}
                  size={32}
                  color={Colors.purple[400]}
                />
              ) : (
                <SvgPathIcon
                  svgPath={iconSvgPath}
                  size={32}
                  color={isRunning ? Colors.emerald[400] : Colors.blue[400]}
                />
              )}
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
                        color: isRunning
                          ? Colors.emerald[400]
                          : Colors.blue[400],
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

              {/* 날짜 + 북마크 */}
              <View style={styles.dateRow}>
                <View style={styles.dateInfo}>
                  <Calendar size={12} color={Colors.zinc[600]} />
                  <Text style={styles.dateText}>
                    {formatDate(item.completedAt)}
                  </Text>
                </View>
                {item.routeId && (
                  <TouchableOpacity
                    style={styles.bookmarkButton}
                    activeOpacity={0.6}
                    onPress={() => handleToggleBookmark(item)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Bookmark
                      size={16}
                      color={
                        item.isBookmarked
                          ? Colors.emerald[400]
                          : Colors.zinc[600]
                      }
                      fill={
                        item.isBookmarked ? Colors.emerald[400] : "transparent"
                      }
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </Swipeable>
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

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.emerald[500]} />
          <Text style={styles.loadingText}>기록을 불러오는 중...</Text>
        </View>
      ) : (
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
      )}

      <WorkoutDetailModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        workout={selectedWorkout}
        workoutId={selectedWorkoutId}
      />

      {/* 이름 수정 모달 */}
      <Modal
        visible={isNameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsNameModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsNameModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>경로 이름 수정</Text>
                <Text style={styles.modalSubtitle}>
                  새로운 이름을 입력해주세요
                </Text>
                <TextInput
                  style={styles.modalInput}
                  value={editRouteName}
                  onChangeText={setEditRouteName}
                  placeholder="경로 이름"
                  placeholderTextColor={Colors.zinc[600]}
                  maxLength={50}
                  autoFocus
                  selectTextOnFocus
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => setIsNameModalVisible(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.modalCancelText}>취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalConfirmButton,
                      !editRouteName.trim() && styles.modalConfirmDisabled,
                    ]}
                    onPress={handleConfirmRename}
                    activeOpacity={0.7}
                    disabled={!editRouteName.trim()}
                  >
                    <Text style={styles.modalConfirmText}>확인</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.zinc[950],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSize.base,
    color: Colors.zinc[400],
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
    overflow: "hidden",
    borderRadius: BorderRadius["2xl"],
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
    justifyContent: "space-between",
  },
  dateInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  bookmarkButton: {
    padding: 2,
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
  deleteAction: {
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    width: 88,
  },
  deleteActionContent: {
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  deleteIconContainer: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.xl,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteActionText: {
    color: "#f87171",
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  editAction: {
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    width: 88,
  },
  editActionContent: {
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  editIconContainer: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.xl,
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  editActionText: {
    color: Colors.blue[400],
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  modalContent: {
    width: "100%",
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius["2xl"],
    borderWidth: 1,
    borderColor: Colors.zinc[700],
    padding: Spacing.xl,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.zinc[50],
    marginBottom: Spacing.xs,
  },
  modalSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.zinc[400],
    marginBottom: Spacing.lg,
  },
  modalInput: {
    backgroundColor: Colors.zinc[800],
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.zinc[700],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.base,
    color: Colors.zinc[50],
    marginBottom: Spacing.lg,
  },
  modalButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  modalCancelButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.zinc[700],
    backgroundColor: Colors.zinc[800],
  },
  modalCancelText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.zinc[400],
  },
  modalConfirmButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.emerald[500],
  },
  modalConfirmDisabled: {
    opacity: 0.4,
  },
  modalConfirmText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: "#fff",
  },
});
