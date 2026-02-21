import { useLocalSearchParams, useRouter } from "expo-router";
import * as MediaLibrary from "expo-media-library";
import {
  Bookmark,
  Clock,
  Download,
  Flame,
  MessageSquare,
  Share2,
  Sparkles,
  TrendingUp,
  Trophy,
  X,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated, { FadeInUp, ZoomIn } from "react-native-reanimated";
import ViewShot from "react-native-view-shot";
import { KakaoMap } from "../../components/KakaoMap";
import { PrimaryButton } from "../../components/PrimaryButton";
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Spacing,
} from "../../constants/theme";
import { workoutApi, savedRouteApi, communityApi } from "../../utils/api";

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const hasCalledCompleteApi = useRef(false);
  const viewShotRef = useRef<ViewShot>(null);

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

  // 도형 정보
  const shapeId = (params.shapeId as string) || "";
  const shapeName = (params.shapeName as string) || "";
  const svgPath = (params.svgPath as string) || "";

  // 북마크 상태
  const [isBookmarked, setIsBookmarked] = useState(false);

  // 이름 수정 모달 상태
  const [isNameModalVisible, setIsNameModalVisible] = useState(false);
  const [editRouteName, setEditRouteName] = useState(
    (params.routeName as string) || (params.shapeName as string) || "내 경로",
  );

  // 공유 선택 모달 상태
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);

  // 게시물 작성 모달 상태
  const [isPostModalVisible, setIsPostModalVisible] = useState(false);
  const [postCaption, setPostCaption] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  // 운동 완료 API 호출 완료 대기용 Promise
  const workoutCompletePromiseRef = useRef<Promise<void> | null>(null);

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

    workoutCompletePromiseRef.current = completeWorkout();
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

  /** 공유 버튼 클릭 → 공유 선택 모달 표시 */
  const handleSharePress = () => {
    setIsShareModalVisible(true);
  };

  /** 이미지 저장 (화면 캡처 → 갤러리 저장) */
  const handleSaveImage = async () => {
    setIsShareModalVisible(false);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "권한 필요",
          "이미지를 저장하려면 사진 접근 권한이 필요합니다.",
        );
        return;
      }

      if (viewShotRef.current?.capture) {
        const uri = await viewShotRef.current.capture();
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("저장 완료", "운동 결과가 갤러리에 저장되었습니다!");
      }
    } catch (error) {
      console.error("이미지 저장 실패:", error);
      Alert.alert("오류", "이미지 저장에 실패했습니다. 다시 시도해주세요.");
    }
  };

  /** 게시물 올리기 선택 → 게시물 작성 모달 표시 */
  const handlePostSelect = () => {
    setIsShareModalVisible(false);
    setPostCaption("");
    setIsPostModalVisible(true);
  };

  /** 게시물 작성 확인 */
  const handleConfirmPost = async () => {
    setIsPosting(true);
    try {
      // 운동 완료 API가 아직 진행 중이면 완료될 때까지 대기
      if (workoutCompletePromiseRef.current) {
        await workoutCompletePromiseRef.current;
      }

      const response = await communityApi.createPost({
        workout_id: workoutId || undefined,
        route_name: editRouteName.trim() || "내 경로",
        shape_id: shapeId || undefined,
        shape_name: shapeName || undefined,
        shape_icon: iconName || undefined,
        svg_path: svgPath || undefined,
        distance: parseFloat(distance),
        duration: time,
        pace: pace || undefined,
        calories: calories || undefined,
        caption: postCaption.trim() || undefined,
        visibility: "public",
      });

      if (response.success) {
        setIsPostModalVisible(false);
        Alert.alert("성공", "게시물이 커뮤니티에 공유되었습니다!");
      }
    } catch (error) {
      console.error("게시물 작성 실패:", error);
      Alert.alert("오류", "게시물 작성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsPosting(false);
    }
  };

  /** 저장 버튼 클릭 → 이름 입력 모달 표시 또는 북마크 해제 */
  const handleToggleBookmark = () => {
    if (!routeId) {
      Alert.alert("알림", "경로 정보가 없어 저장할 수 없습니다.");
      return;
    }

    if (isBookmarked) {
      // 이미 저장된 경우 → 바로 저장 해제
      handleUnsaveRoute();
    } else {
      // 저장하기 → 이름 수정 모달 표시
      setIsNameModalVisible(true);
    }
  };

  /** 북마크 해제 */
  const handleUnsaveRoute = async () => {
    setIsBookmarked(false);
    try {
      await savedRouteApi.unsaveRoute(routeId);
      Alert.alert("알림", "저장이 해제되었습니다.");
    } catch (error) {
      setIsBookmarked(true);
      console.error("저장 해제 실패:", error);
      Alert.alert("오류", "저장 해제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  /** 이름 확인 후 저장 (모달에서 확인 누를 때) */
  const handleConfirmSave = async () => {
    setIsNameModalVisible(false);
    setIsBookmarked(true);

    try {
      await savedRouteApi.saveRoute(
        routeId,
        routeOptionId || undefined,
        editRouteName.trim() || undefined,
      );
      Alert.alert("성공", "경로가 저장되었습니다!");
    } catch (error) {
      setIsBookmarked(false);
      console.error("경로 저장 실패:", error);
      Alert.alert("오류", "경로 저장에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ViewShot
        ref={viewShotRef}
        options={{ format: "png", quality: 1.0 }}
        style={styles.viewShotContainer}
      >
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
                  {stat.unit && (
                    <Text style={styles.statUnit}> {stat.unit}</Text>
                  )}
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
      </ViewShot>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Animated.View
          entering={FadeInUp.delay(1000).duration(400)}
          style={styles.shareButtonRow}
        >
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={handleSharePress}
          >
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
                  저장할 경로의 이름을 입력해주세요
                </Text>
                <TextInput
                  style={styles.modalInput}
                  value={editRouteName}
                  onChangeText={setEditRouteName}
                  placeholder="경로 이름 입력"
                  placeholderTextColor={Colors.zinc[500]}
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
                    onPress={handleConfirmSave}
                    activeOpacity={0.7}
                    disabled={!editRouteName.trim()}
                  >
                    <Text style={styles.modalConfirmText}>저장</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 공유 선택 모달 */}
      <Modal
        visible={isShareModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsShareModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsShareModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.shareModalHeader}>
                  <Text style={styles.modalTitle}>공유하기</Text>
                  <TouchableOpacity
                    onPress={() => setIsShareModalVisible(false)}
                    activeOpacity={0.7}
                  >
                    <X size={20} color={Colors.zinc[400]} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalSubtitle}>
                  공유 방식을 선택해주세요
                </Text>

                <TouchableOpacity
                  style={styles.shareOptionButton}
                  activeOpacity={0.7}
                  onPress={handleSaveImage}
                >
                  <View style={styles.shareOptionIcon}>
                    <Download size={22} color={Colors.blue[400]} />
                  </View>
                  <View style={styles.shareOptionContent}>
                    <Text style={styles.shareOptionTitle}>이미지 저장</Text>
                    <Text style={styles.shareOptionDesc}>
                      운동 결과를 이미지로 갤러리에 저장합니다
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.shareOptionButton}
                  activeOpacity={0.7}
                  onPress={handlePostSelect}
                >
                  <View
                    style={[
                      styles.shareOptionIcon,
                      styles.shareOptionIconPurple,
                    ]}
                  >
                    <MessageSquare size={22} color={Colors.purple[400]} />
                  </View>
                  <View style={styles.shareOptionContent}>
                    <Text style={styles.shareOptionTitle}>게시물 올리기</Text>
                    <Text style={styles.shareOptionDesc}>
                      커뮤니티에 운동 결과를 공유합니다
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 게시물 작성 모달 */}
      <Modal
        visible={isPostModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPostModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsPostModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>게시물 올리기</Text>
                <Text style={styles.modalSubtitle}>
                  커뮤니티에 공유할 내용을 작성해주세요
                </Text>

                <Text style={styles.postLabel}>경로 이름</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editRouteName}
                  onChangeText={setEditRouteName}
                  placeholder="경로 이름 입력"
                  placeholderTextColor={Colors.zinc[500]}
                  maxLength={100}
                  autoFocus
                  selectTextOnFocus
                />

                <Text style={styles.postLabel}>캡션 (선택)</Text>
                <TextInput
                  style={[styles.modalInput, styles.captionInput]}
                  value={postCaption}
                  onChangeText={setPostCaption}
                  placeholder="운동 소감을 남겨보세요"
                  placeholderTextColor={Colors.zinc[500]}
                  maxLength={500}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />

                {/* 운동 요약 정보 */}
                <View style={styles.postSummary}>
                  <View style={styles.postSummaryItem}>
                    <Text style={styles.postSummaryLabel}>거리</Text>
                    <Text style={styles.postSummaryValue}>{distance} km</Text>
                  </View>
                  <View style={styles.postSummaryDivider} />
                  <View style={styles.postSummaryItem}>
                    <Text style={styles.postSummaryLabel}>시간</Text>
                    <Text style={styles.postSummaryValue}>
                      {formatTime(time)}
                    </Text>
                  </View>
                  <View style={styles.postSummaryDivider} />
                  <View style={styles.postSummaryItem}>
                    <Text style={styles.postSummaryLabel}>페이스</Text>
                    <Text style={styles.postSummaryValue}>{pace}</Text>
                  </View>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => setIsPostModalVisible(false)}
                    activeOpacity={0.7}
                    disabled={isPosting}
                  >
                    <Text style={styles.modalCancelText}>취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalConfirmButton,
                      (!editRouteName.trim() || isPosting) &&
                        styles.modalConfirmDisabled,
                    ]}
                    onPress={handleConfirmPost}
                    activeOpacity={0.7}
                    disabled={!editRouteName.trim() || isPosting}
                  >
                    <Text style={styles.modalConfirmText}>
                      {isPosting ? "올리는 중..." : "올리기"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  viewShotContainer: {
    width: "100%",
    alignItems: "center",
    backgroundColor: Colors.zinc[950],
  },
  shareModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  shareOptionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.zinc[800],
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.zinc[700],
    marginBottom: Spacing.sm,
  },
  shareOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: `${Colors.blue[500]}20`,
    alignItems: "center",
    justifyContent: "center",
  },
  shareOptionIconPurple: {
    backgroundColor: `${Colors.purple[500]}20`,
  },
  shareOptionContent: {
    flex: 1,
  },
  shareOptionTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.zinc[50],
    marginBottom: 2,
  },
  shareOptionDesc: {
    fontSize: FontSize.xs,
    color: Colors.zinc[400],
  },
  postLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.zinc[300],
    marginBottom: Spacing.xs,
  },
  captionInput: {
    height: 80,
    paddingTop: Spacing.md,
  },
  postSummary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: Colors.zinc[800],
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  postSummaryItem: {
    alignItems: "center",
  },
  postSummaryLabel: {
    fontSize: FontSize.xs,
    color: Colors.zinc[500],
    marginBottom: 2,
  },
  postSummaryValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.zinc[50],
  },
  postSummaryDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.zinc[700],
  },
});
