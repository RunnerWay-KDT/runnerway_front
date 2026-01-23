import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Flame,
  Pause,
  Play,
  Square,
  TrendingUp,
  Volume2,
  VolumeX,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { BottomSheet } from "../../components/BottomSheet";
import { LiveMapMock } from "../../components/LiveMapMock";
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Spacing,
} from "../../constants/theme";

export default function WorkoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [pace, setPace] = useState("5'30\"");
  const [sheetState, setSheetState] = useState<
    "collapsed" | "half" | "expanded"
  >("collapsed");
  const [voiceGuide, setVoiceGuide] = useState(true);

  const targetDistance = parseFloat((params.targetDistance as string) || "4.2");
  const iconName = (params.shapeIconName as string) || "heart";

  const progress = Math.min(distance / targetDistance, 1);
  const progressWidth = useSharedValue(0);

  // 진행률 애니메이션
  useEffect(() => {
    progressWidth.value = withTiming(progress * 100, { duration: 300 });
  }, [progress, progressWidth]);

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  // 타이머 로직 개선 - time 의존성 제거하고 함수형 업데이트 사용
  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime + 1;
          return newTime;
        });

        setDistance((prevDistance) => {
          const newDistance = prevDistance + 0.002;

          // 페이스 계산을 여기서 직접 수행
          if (newDistance > 0) {
            setTime((currentTime) => {
              const currentPace = currentTime / 60 / newDistance;
              const mins = Math.floor(currentPace);
              const secs = Math.round((currentPace - mins) * 60);
              setPace(`${mins}'${secs.toString().padStart(2, "0")}"`);
              return currentTime;
            });
          }

          return newDistance;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isPaused]); // time 제거

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleStop = () => {
    router.replace({
      pathname: "/(screens)/result",
      params: {
        ...params,
        completedDistance: distance.toFixed(2),
        completedTime: time.toString(),
        averagePace: pace,
        calories: Math.round(distance * 60).toString(),
      },
    });
  };

  const calories = Math.round(distance * 60);
  const remainingDistance = Math.max(0, targetDistance - distance);

  return (
    <View style={styles.container}>
      {/* Background Map */}
      <LiveMapMock routePath={iconName} progress={progress} />

      {/* Top Controls */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setVoiceGuide(!voiceGuide)}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          {voiceGuide ? (
            <Volume2 size={24} color={Colors.emerald[400]} />
          ) : (
            <VolumeX size={24} color={Colors.zinc[500]} />
          )}
        </TouchableOpacity>

        <View style={styles.remainingContainer}>
          <Text style={styles.remainingLabel}>남은 거리</Text>
          <Text style={styles.remainingValue}>
            {remainingDistance.toFixed(2)} km
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleStop}
          style={styles.stopButton}
          activeOpacity={0.7}
        >
          <Square size={24} color={Colors.red[400]} />
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet */}
      <BottomSheet onStateChange={setSheetState}>
        {/* Main Stats */}
        <Animated.View entering={FadeInUp.duration(300)}>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.statCardEmerald]}>
              <Text style={styles.statLabel}>거리</Text>
              <Text style={styles.statValueLarge}>{distance.toFixed(2)}</Text>
              <Text style={styles.statUnit}>km</Text>
            </View>
            <View style={[styles.statCard, styles.statCardBlue]}>
              <Text style={styles.statLabelBlue}>시간</Text>
              <Text style={styles.statValueMedium}>{formatTime(time)}</Text>
            </View>
            <View style={[styles.statCard, styles.statCardPurple]}>
              <Text style={styles.statLabelPurple}>페이스</Text>
              <Text style={styles.statValueMedium}>{pace}</Text>
              <Text style={styles.statUnit}>/km</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>진행률</Text>
              <Text style={styles.progressValue}>
                {Math.round(progress * 100)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <Animated.View
                style={[styles.progressFill, progressAnimatedStyle]}
              />
            </View>
          </View>

          {/* Pause/Resume Button */}
          <TouchableOpacity
            onPress={() => setIsPaused(!isPaused)}
            style={[
              styles.controlButton,
              isPaused ? styles.controlButtonResume : styles.controlButtonPause,
            ]}
            activeOpacity={0.8}
          >
            {isPaused ? (
              <>
                <Play size={24} color="#fff" />
                <Text style={styles.controlButtonText}>재개하기</Text>
              </>
            ) : (
              <>
                <Pause size={24} color="#fff" />
                <Text style={styles.controlButtonText}>일시정지</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Half State - Additional Stats */}
        {(sheetState === "half" || sheetState === "expanded") && (
          <Animated.View entering={FadeInUp.delay(100).duration(300)}>
            <View style={styles.divider} />
            <View style={styles.calorieCard}>
              <View style={styles.calorieHeader}>
                <Flame size={20} color={Colors.orange[400]} />
                <Text style={styles.calorieLabel}>칼로리</Text>
              </View>
              <Text style={styles.calorieValue}>{calories}</Text>
              <Text style={styles.calorieUnit}>kcal</Text>
            </View>

            {/* 구간 기록 - half 상태에서도 보이도록 수정 */}
            <View style={styles.divider} />

            <View style={styles.sectionHeader}>
              <TrendingUp size={16} color={Colors.blue[400]} />
              <Text style={styles.sectionTitle}>구간 기록</Text>
            </View>

            <View style={styles.splitList}>
              <View style={styles.splitItem}>
                <Text style={styles.splitLabel}>0-1 km</Text>
                <Text style={styles.splitValue}>{"6'15\""}</Text>
              </View>
              <View style={styles.splitItem}>
                <Text style={styles.splitLabel}>1-2 km</Text>
                <Text style={styles.splitValue}>{"5'58\""}</Text>
              </View>
              <View style={styles.splitItemCurrent}>
                <Text style={styles.splitLabelCurrent}>현재 구간</Text>
                <Text style={styles.splitValueCurrent}>{pace}</Text>
              </View>
            </View>

            {isPaused && (
              <View style={styles.pausedInfo}>
                <Text style={styles.pausedTitle}>⏸️ 일시정지 중</Text>
                <Text style={styles.pausedText}>
                  준비되면 재개 버튼을 눌러주세요
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleStop}
              style={styles.stopWorkoutButton}
              activeOpacity={0.7}
            >
              <Text style={styles.stopWorkoutText}>운동 종료하기</Text>
            </TouchableOpacity>
          </Animated.View>
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
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  remainingContainer: {
    alignItems: "center",
  },
  remainingLabel: {
    fontSize: FontSize.sm,
    color: Colors.zinc[400],
  },
  remainingValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.emerald[400],
  },
  stopButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: `${Colors.red[500]}20`,
    justifyContent: "center",
    alignItems: "center",
  },
  statsGrid: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    alignItems: "center",
    borderWidth: 1,
  },
  statCardEmerald: {
    backgroundColor: `${Colors.emerald[500]}20`,
    borderColor: `${Colors.emerald[500]}30`,
  },
  statCardBlue: {
    backgroundColor: `${Colors.blue[500]}20`,
    borderColor: `${Colors.blue[500]}30`,
  },
  statCardPurple: {
    backgroundColor: `${Colors.purple[500]}20`,
    borderColor: `${Colors.purple[500]}30`,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.emerald[400],
    marginBottom: Spacing.xs,
  },
  statLabelBlue: {
    fontSize: FontSize.xs,
    color: Colors.blue[400],
    marginBottom: Spacing.xs,
  },
  statLabelPurple: {
    fontSize: FontSize.xs,
    color: Colors.purple[400],
    marginBottom: Spacing.xs,
  },
  statValueLarge: {
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: Colors.zinc[50],
    fontVariant: ["tabular-nums"],
  },
  statValueMedium: {
    fontSize: FontSize["2xl"],
    fontWeight: FontWeight.bold,
    color: Colors.zinc[50],
    fontVariant: ["tabular-nums"],
  },
  statUnit: {
    fontSize: FontSize.xs,
    color: Colors.zinc[400],
  },
  progressContainer: {
    marginBottom: Spacing.md,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  progressLabel: {
    fontSize: FontSize.sm,
    color: Colors.zinc[400],
  },
  progressValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.emerald[400],
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.zinc[800],
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.emerald[500],
    borderRadius: 4,
  },
  controlButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  controlButtonPause: {
    backgroundColor: Colors.amber[500],
  },
  controlButtonResume: {
    backgroundColor: Colors.emerald[500],
  },
  controlButtonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: "#fff",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.zinc[800],
    marginVertical: Spacing.md,
  },
  calorieCard: {
    backgroundColor: `${Colors.zinc[800]}50`,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
  },
  calorieHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  calorieLabel: {
    fontSize: FontSize.sm,
    color: Colors.zinc[400],
  },
  calorieValue: {
    fontSize: FontSize["2xl"],
    fontWeight: FontWeight.bold,
    color: Colors.zinc[50],
  },
  calorieUnit: {
    fontSize: FontSize.xs,
    color: Colors.zinc[500],
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
  splitList: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  splitItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: `${Colors.zinc[800]}50`,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  splitItemCurrent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: `${Colors.emerald[500]}10`,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: `${Colors.emerald[500]}30`,
    padding: Spacing.md,
  },
  splitLabel: {
    fontSize: FontSize.sm,
    color: Colors.zinc[400],
  },
  splitLabelCurrent: {
    fontSize: FontSize.sm,
    color: Colors.emerald[400],
  },
  splitValue: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.zinc[50],
  },
  splitValueCurrent: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.emerald[400],
  },
  pausedInfo: {
    backgroundColor: `${Colors.amber[500]}10`,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: `${Colors.amber[500]}30`,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  pausedTitle: {
    fontSize: FontSize.sm,
    color: Colors.amber[400],
    marginBottom: Spacing.xs,
  },
  pausedText: {
    fontSize: FontSize.xs,
    color: Colors.zinc[400],
  },
  stopWorkoutButton: {
    backgroundColor: `${Colors.red[500]}20`,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  stopWorkoutText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.red[400],
  },
});
