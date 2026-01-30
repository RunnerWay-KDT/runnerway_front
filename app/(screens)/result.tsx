import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Clock,
  Download,
  Flame,
  Share2,
  Sparkles,
  TrendingUp,
  Trophy,
} from "lucide-react-native";
import React from "react";
import {
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
import { getIconComponent } from "../../utils/shapeIcons";

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // 전달받은 좌표 데이터 파싱 (최적화: 예외처리 생략)
  const routePathData = params.path ? JSON.parse(params.path as string) : [];

  const isCustomDrawing = params.mode === "custom";
  const iconName = (params.shapeIconName as string) || "heart";
  const RouteIcon = getIconComponent(iconName);

  const distance = (params.completedDistance as string) || "4.20";
  const time = parseInt((params.completedTime as string) || "1723", 10);
  const pace = (params.averagePace as string) || "6'50\"";
  const calories = parseInt((params.calories as string) || "247", 10);

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

      {/* Map Section */}
      <Animated.View
        entering={FadeInUp.delay(450).duration(400)}
        style={styles.mapContainer}
      >
        <KakaoMap routePath={iconName} polyline={routePathData} />
      </Animated.View>

      {/* Route Card */}
      <Animated.View
        entering={FadeInUp.delay(500).duration(400)}
        style={styles.routeCard}
      >
        <View style={styles.routeIconContainer}>
          {isCustomDrawing ? (
            <View style={styles.customIconWrapper}>
              <Sparkles size={48} color={Colors.purple[400]} />
            </View>
          ) : (
            <RouteIcon
              size={96}
              color={`${Colors.emerald[500]}30`}
              strokeWidth={1.5}
            />
          )}
        </View>
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
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <Download size={20} color={Colors.zinc[50]} />
            <Text style={styles.iconButtonText}>저장</Text>
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
    height: 250,
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius["2xl"],
    borderWidth: 1,
    borderColor: Colors.zinc[800],
    overflow: "hidden",
    marginBottom: Spacing.lg,
  },
  routeCard: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius["2xl"],
    borderWidth: 1,
    borderColor: Colors.zinc[800],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
    position: "relative",
    overflow: "hidden",
  },
  routeIconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  customIconWrapper: {
    position: "relative",
  },
  distanceBadge: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.emerald[500],
    paddingHorizontal: Spacing.md,
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
